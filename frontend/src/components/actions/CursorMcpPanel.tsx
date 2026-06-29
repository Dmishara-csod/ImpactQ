import { Bot, Hand, Play, Terminal, Wrench } from 'lucide-react'

import { CopyButton } from '@/components/shared/CopyButton'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buildFallbackCursorActions } from '@/lib/buildFallbackCursorActions'
import { cn } from '@/lib/utils'
import type { ActionStatus, CursorMcpAction, ImpactAnalysis } from '@/types/analysis'

interface AgentPromptsPanelProps {
  analysis?: ImpactAnalysis
  actions?: CursorMcpAction[]
  highlightId?: string
}

const statusVariant: Record<ActionStatus, 'secondary' | 'warning' | 'success' | 'outline'> = {
  pending: 'outline',
  ready: 'secondary',
  in_progress: 'warning',
  done: 'success',
}

const categoryIcon = {
  playwright: Play,
  code: Wrench,
  run: Terminal,
}

export function AgentPromptsPanel({
  analysis,
  actions = [],
  highlightId,
}: AgentPromptsPanelProps) {
  const displayActions =
    actions.length > 0
      ? actions
      : analysis
        ? buildFallbackCursorActions(analysis)
        : []

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5" />
            AI agent prompts
          </CardTitle>
          <CardDescription>
            Copy each prompt into your AI agent with MCP tools enabled (Playwright, TestRail,
            JetBrains) in your local environment configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {displayActions.length} action{displayActions.length === 1 ? '' : 's'} ready.
        </CardContent>
      </Card>

      <div className="space-y-4">
        {displayActions.map((action) => {
          const Icon = categoryIcon[action.category]
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
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="mt-1">{action.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Hand className="size-3" />
                      Manual step
                    </Badge>
                    <Badge variant={statusVariant[action.status]}>
                      {action.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {action.mcpTools.map((tool) => (
                    <Badge key={tool} variant="outline">
                      {tool}
                    </Badge>
                  ))}
                </div>
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

/** @deprecated Use AgentPromptsPanel */
export const CursorMcpPanel = AgentPromptsPanel
