import type { ReactNode } from 'react'
import { ArrowRight, Bot, LayoutDashboard, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AppView = 'input' | 'dashboard' | 'actions'

interface LayoutProps {
  children: ReactNode
  view: AppView
  onNavigate?: (view: AppView) => void
  onNewAnalysis?: () => void
}

export function Layout({ children, view, onNavigate, onNewAnalysis }: LayoutProps) {
  const showNav = view === 'dashboard' || view === 'actions'

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">ImpactIQ</h1>
              <p className="text-xs text-muted-foreground">
                AI-powered test impact analyzer
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showNav && onNavigate && (
              <nav className="flex rounded-lg bg-muted p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2',
                    view === 'dashboard' && 'bg-background shadow-sm',
                  )}
                  onClick={() => onNavigate('dashboard')}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2',
                    view === 'actions' && 'bg-background shadow-sm',
                  )}
                  onClick={() => onNavigate('actions')}
                >
                  <Bot className="size-4" />
                  Actions
                </Button>
              </nav>
            )}
            {showNav && onNewAnalysis && (
              <Button variant="outline" onClick={onNewAnalysis}>
                New Analysis
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

export function ActionsBanner({ onOpenActions }: { onOpenActions: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">Ready to act on this analysis?</p>
        <p className="text-sm text-muted-foreground">
          Create a PR in galaxy-automation and run fixes through Cursor Pro MCP or TestRail.
        </p>
      </div>
      <Button onClick={onOpenActions} className="shrink-0 gap-2">
        View action plan
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
