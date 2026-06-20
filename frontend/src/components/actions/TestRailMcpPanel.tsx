import { Check, ClipboardList, Copy, Plus, RefreshCw } from 'lucide-react'

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
import type { ActionStatus, TestRailMcpAction } from '@/types/analysis'

interface TestRailMcpPanelProps {
  actions: TestRailMcpAction[]
}

const statusVariant: Record<ActionStatus, 'secondary' | 'warning' | 'success' | 'outline'> = {
  pending: 'outline',
  ready: 'secondary',
  in_progress: 'warning',
  done: 'success',
}

export function TestRailMcpPanel({ actions }: TestRailMcpPanelProps) {
  const { copiedId, copy } = useCopyToClipboard()

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-5" />
            TestRail via Cursor MCP
          </CardTitle>
          <CardDescription>
            Create or update cases on testrail.csod.com (project 49) using Cursor Agent
            with TestRail MCP integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect the TestRail MCP server in Cursor, then run each prompt to create or update
          cases and map them with @TestRailCases in AdminThemeAndBrandingTest.java.
        </CardContent>
      </Card>

      <div className="space-y-4">
        {actions.map((action) => {
          const ActionIcon = action.action === 'create' ? Plus : RefreshCw

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
                        {action.caseId && ` · ${action.caseId}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={action.action === 'create' ? 'default' : 'secondary'}>
                      {action.action}
                    </Badge>
                    <Badge variant={statusVariant[action.status]}>
                      {action.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Test steps
                  </p>
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
                <Button
                  size="sm"
                  onClick={() => copy(action.id, action.cursorPrompt)}
                >
                  {copiedId === action.id ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  Copy & run in Cursor
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
