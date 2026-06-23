import { useEffect, useState } from 'react'
import { Check, ClipboardList, Copy, ExternalLink, Loader2, Plus, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import {
  fetchStoredTestRailActions,
  runTestRailAction,
  type TestRailCaseRef,
} from '@/services/api/testRailApi'
import { resolveTestRailActions } from '@/lib/buildFallbackTestRailActions'
import { normalizeScenarioTitle } from '@/lib/testScenarioUtils'
import type { ActionStatus, ImpactAnalysis, TestRailMcpAction } from '@/types/analysis'

interface TestRailMcpPanelProps {
  analysis: ImpactAnalysis
  actions: TestRailMcpAction[]
}

const statusVariant: Record<ActionStatus, 'secondary' | 'warning' | 'success' | 'outline'> = {
  pending: 'outline',
  ready: 'secondary',
  in_progress: 'warning',
  done: 'success',
}

function CaseLinks({ cases, emptyText }: { cases: TestRailCaseRef[]; emptyText: string }) {
  if (cases.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>
  }

  return (
    <ul className="space-y-2">
      {cases.map((c) => (
        <li key={c.id} className="flex items-start gap-2 text-sm">
          <a
            href={c.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            {c.id}
            <ExternalLink className="size-3" />
          </a>
          <span className="text-muted-foreground">{c.title}</span>
        </li>
      ))}
    </ul>
  )
}

export function TestRailMcpPanel({ analysis, actions = [] }: TestRailMcpPanelProps) {
  const { copiedId, copy } = useCopyToClipboard()
  const [runningId, setRunningId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [createdCases, setCreatedCases] = useState<Record<string, TestRailCaseRef>>({})
  const [impactedByAction, setImpactedByAction] = useState<Record<string, TestRailCaseRef[]>>({})
  const [allCreatedCases, setAllCreatedCases] = useState<TestRailCaseRef[]>([])
  const [showResultsFor, setShowResultsFor] = useState<string | null>(null)

  useEffect(() => {
    fetchStoredTestRailActions(analysis.id)
      .then((stored) => {
        const mapped: Record<string, TestRailCaseRef> = {}
        const byTitle: Record<string, TestRailCaseRef> = {}
        const impacted: Record<string, TestRailCaseRef[]> = {}
        for (const [actionId, record] of Object.entries(stored.actions || {})) {
          if (record.created) {
            mapped[actionId] = record.created
            byTitle[normalizeScenarioTitle(record.title)] = record.created
          }
          if (record.impactedCases) impacted[actionId] = record.impactedCases
        }
        setCreatedCases({ ...mapped, ...byTitle })
        setImpactedByAction(impacted)
        setAllCreatedCases(stored.createdCases || [])
      })
      .catch(() => {})
  }, [analysis.id])

  function getCreatedCase(action: TestRailMcpAction) {
    return (
      createdCases[action.id] ||
      createdCases[normalizeScenarioTitle(action.title)]
    )
  }

  const allImpacted = analysis.testRail.testCases
  const displayActions = resolveTestRailActions(analysis, actions)

  async function handleCopyAndRun(action: TestRailMcpAction) {
    setRunningId(action.id)
    setErrors((prev) => ({ ...prev, [action.id]: '' }))
    setShowResultsFor(action.id)

    await copy(action.id, action.cursorPrompt)

    if (createdCases[action.id] || createdCases[normalizeScenarioTitle(action.title)]) {
      setRunningId(null)
      return
    }

    try {
      const result = await runTestRailAction({
        analysisId: analysis.id,
        actionId: action.id,
        title: action.title,
        suite: action.suite,
        steps: action.steps,
        projectId: analysis.testRail.projectId,
        jiraKeys: action.jiraKeys || analysis.ticketKeys,
        impactedCases: action.impactedCases || [],
        cursorPrompt: action.cursorPrompt,
      })

      setCreatedCases((prev) => ({ ...prev, [action.id]: result.created }))
      setImpactedByAction((prev) => ({
        ...prev,
        [action.id]: result.impactedCases,
      }))
      setAllCreatedCases(result.allCreatedCases)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [action.id]: err instanceof Error ? err.message : 'Failed to create TestRail case',
      }))
    } finally {
      setRunningId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-5" />
            TestRail via Cursor MCP
          </CardTitle>
          <CardDescription>
            Click <strong>Copy & run in Cursor</strong> on each action below — copies the MCP
            prompt, creates the new TestRail case in the backend, and shows impacted + newly
            created case links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {displayActions.length} action{displayActions.length === 1 ? '' : 's'} ready for
            this analysis
          </p>
        </CardContent>
      </Card>

      {allCreatedCases.length > 0 && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New cases created (saved in backend)</CardTitle>
            <CardDescription>
              {allCreatedCases.length} case{allCreatedCases.length === 1 ? '' : 's'} written to
              TestRail for this analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CaseLinks cases={allCreatedCases} emptyText="" />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          TestRail actions ({displayActions.length})
        </h3>
        {displayActions.length === 0 && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No TestRail actions available. Run a new analysis to generate actions.
            </CardContent>
          </Card>
        )}
        {displayActions.map((action) => {
          const ActionIcon = action.action === 'create' ? Plus : RefreshCw
          const created = getCreatedCase(action)
          const status: ActionStatus = created ? 'done' : action.status
          const relatedImpacted =
            impactedByAction[action.id]?.length > 0
              ? impactedByAction[action.id]
              : action.impactedCases || []
          const showResults = showResultsFor === action.id

          return (
            <Card key={action.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ActionIcon className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {action.suite}
                        {action.jiraKeys?.length ? ` · Jira: ${action.jiraKeys.join(', ')}` : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={action.action === 'create' ? 'default' : 'secondary'}>
                      {action.action}
                    </Badge>
                    <Badge variant={statusVariant[status]}>
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Test steps</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    {action.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Cursor Agent prompt
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">
                    {action.cursorPrompt}
                  </pre>
                </div>

                {errors[action.id] && (
                  <p className="text-sm text-destructive">{errors[action.id]}</p>
                )}

                <Button
                  size="sm"
                  onClick={() => handleCopyAndRun(action)}
                  disabled={runningId === action.id}
                >
                  {runningId === action.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : copiedId === action.id ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {runningId === action.id
                    ? 'Creating case in TestRail…'
                    : created
                      ? 'Copy & run in Cursor (case created)'
                      : 'Copy & run in Cursor'}
                </Button>

                {showResults && (
                  <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-medium">Action results</p>

                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Impacted cases (existing)
                      </p>
                      <CaseLinks
                        cases={relatedImpacted}
                        emptyText="No related impacted cases found."
                      />
                    </div>

                    {created ? (
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          New case created in TestRail
                        </p>
                        <a
                          href={created.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          {created.id} — {created.title}
                          <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    ) : runningId === action.id ? (
                      <p className="text-sm text-muted-foreground">Creating TestRail case…</p>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All impacted TestRail cases</CardTitle>
          <CardDescription>
            Existing cases linked to Jira ticket {analysis.inputValue}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CaseLinks cases={allImpacted} emptyText="No impacted cases found for this analysis." />
        </CardContent>
      </Card>
    </div>
  )
}
