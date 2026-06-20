import { Bot, Check, Copy, Play, Terminal, Wrench } from 'lucide-react'

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
import type { ActionStatus, CursorMcpAction } from '@/types/analysis'

interface CursorMcpPanelProps {
  actions: CursorMcpAction[]
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

export function CursorMcpPanel({ actions }: CursorMcpPanelProps) {
  const { copiedId, copy } = useCopyToClipboard()

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5" />
            Cursor Pro + MCP
          </CardTitle>
          <CardDescription>
            Run Java Playwright tests via Maven, fix page objects, and apply changes through
            Cursor Agent using MCP tools (filesystem, terminal, JetBrains).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Open the galaxy-automation repo in Cursor. Copy a prompt below and paste it into
          Cursor Agent with JetBrains and terminal MCP enabled.
        </CardContent>
      </Card>

      <div className="space-y-4">
        {actions.map((action) => {
          const Icon = categoryIcon[action.category]

          return (
            <Card key={action.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={statusVariant[action.status]}>
                    {action.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    MCP tools
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {action.mcpTools.map((tool) => (
                      <Badge key={tool} variant="outline">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Target files
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {action.targetFiles.map((file) => (
                      <code
                        key={file}
                        className="rounded bg-muted px-2 py-0.5 text-xs"
                      >
                        {file}
                      </code>
                    ))}
                  </div>
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
