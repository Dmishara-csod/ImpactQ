import { ClipboardList, Hand, Plus, RefreshCw } from 'lucide-react'

import { CopyButton } from '@/components/shared/CopyButton'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ActionStatus, TestRailMcpAction } from '@/types/analysis'

interface TestRailMcpPanelProps {
  actions: TestRailMcpAction[]
  highlightId?: string
}

const statusVariant: Record<ActionStatus, 'secondary' | 'warning' | 'success' | 'outline'> = {
  pending: 'outline',
  ready: 'secondary',
  in_progress: 'warning',
  done: 'success',
}

export function TestRailMcpPanel({ actions, highlightId }: TestRailMcpPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-5" />
            TestRail prompts
          </CardTitle>
          <CardDescription>
            Create or update TestRail cases via your AI agent — not from this web app.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {actions.map((action) => {
          const ActionIcon = action.action === 'create' ? Plus : RefreshCw
          const highlighted = action.id === highlightId

          return (
            <Card
              key={action.id}
              className={cn(highlighted && 'ring-2 ring-primary ring-offset-2')}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ActionIcon className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="mt-1">{action.suite}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Hand className="size-3" />
                      Manual step
                    </Badge>
                    <Badge variant={statusVariant[action.status]}>
                      {action.action}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  {action.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <pre className="overflow-x-auto rounded-lg border bg-muted p-3 text-xs whitespace-pre-wrap">
                  {action.cursorPrompt}
                </pre>
                <CopyButton
                  id={action.id}
                  text={action.cursorPrompt}
                  label="Copy prompt"
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
