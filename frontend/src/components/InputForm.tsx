import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowRight, FileText, Plus, X } from 'lucide-react'

import { AnalysisHistoryPanel } from '@/components/AnalysisHistoryPanel'
import { SettingsPanel } from '@/components/SettingsPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getAllCatalogKeys } from '@/data/jiraTicketCatalog'
import type { AnalysisHistoryEntry } from '@/lib/analysisHistory'
import {
  getJiraKeyState,
  KEY_CHIP_CLASS,
} from '@/lib/jiraKeyValidation'
import { parseTicketKeys } from '@/lib/parseTickets'
import { fetchIntegrationStatus } from '@/services/api/analysisApi'
import type { AnalysisInput } from '@/types/analysis'

interface InputFormProps {
  onSubmit: (input: AnalysisInput) => void
  isLoading: boolean
  history: AnalysisHistoryEntry[]
  error?: string | null
  onSettingsChange: (settings: import('@/lib/settings').AppSettings) => void
  onSelectHistory: (entry: AnalysisHistoryEntry) => void
  onRemoveHistory: (id: string) => void
}

const exampleSets = [
  {
    label: 'Theme & Branding (3 tickets)',
    keys: ['GXP-112', 'GXP-113', 'GXP-114'],
  },
  {
    label: 'Full admin sprint (4 tickets)',
    keys: getAllCatalogKeys(),
  },
]

export function InputForm({
  onSubmit,
  isLoading,
  history,
  error,
  onSettingsChange,
  onSelectHistory,
  onRemoveHistory,
}: InputFormProps) {
  const [rawInput, setRawInput] = useState('')
  const [jiraConnected, setJiraConnected] = useState(false)

  useEffect(() => {
    fetchIntegrationStatus()
      .then((s) => setJiraConnected(Boolean(s.jira.connection?.ok)))
      .catch(() => setJiraConnected(false))
  }, [])

  const parsedKeys = useMemo(() => parseTicketKeys(rawInput), [rawInput])
  const hasValidKey = parsedKeys.some((k) => getJiraKeyState(k, jiraConnected) === 'valid')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!hasValidKey) return
    onSubmit({
      inputType: 'jira',
      ticketKeys: parsedKeys.filter((k) => getJiraKeyState(k, jiraConnected) !== 'invalid'),
    })
  }

  function addKeys(keys: string[]) {
    const merged = [...new Set([...parsedKeys, ...keys])]
    setRawInput(merged.join('\n'))
  }

  function removeKey(key: string) {
    const next = parsedKeys.filter((k) => k !== key)
    setRawInput(next.join('\n'))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analyze impact</h2>
        <p className="mt-1 text-muted-foreground">
          Map Jira changes to TestRail cases, automation coverage, and QA actions.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!jiraConnected && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/35 dark:bg-amber-500/15 dark:text-amber-100">
          Using mock catalog — Jira API not configured. Demo keys from the catalog still work.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            Jira ticket keys
          </CardTitle>
          <CardDescription>
            Enter one or more keys — comma or newline separated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jira-input">Ticket keys</Label>
              <Textarea
                id="jira-input"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={'GXP-112\nGXP-113\nGXP-114'}
                rows={5}
                disabled={isLoading}
              />
            </div>

            {parsedKeys.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Validation</p>
                <div className="flex flex-wrap gap-2">
                  {parsedKeys.map((key) => {
                    const state = getJiraKeyState(key, jiraConnected)
                    return (
                      <Badge
                        key={key}
                        variant="outline"
                        className={`gap-1 pr-1 ${KEY_CHIP_CLASS[state]}`}
                      >
                        {key}
                        {state === 'unknown' && !jiraConnected && ' · mock?'}
                        <button
                          type="button"
                          className="rounded-full p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
                          onClick={() => removeKey(key)}
                          aria-label={`Remove ${key}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Quick add</p>
              <div className="flex flex-wrap gap-2">
                {exampleSets.map((set) => (
                  <Button
                    key={set.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => addKeys(set.keys)}
                    disabled={isLoading}
                  >
                    <Plus className="size-3.5" />
                    {set.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !hasValidKey}
            >
              {isLoading ? 'Analyzing impact…' : 'Analyze Impact'}
              {!isLoading && <ArrowRight className="size-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <SettingsPanel onSettingsChange={onSettingsChange} />
      </div>

      <AnalysisHistoryPanel
        history={history}
        onSelect={onSelectHistory}
        onRemove={onRemoveHistory}
      />
    </div>
  )
}
