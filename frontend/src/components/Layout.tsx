import type { ReactNode } from 'react'
import { ArrowRight, Bot, ClipboardList, LayoutDashboard, Sparkles, Ticket } from 'lucide-react'

import { ThemeToggle } from '@/components/ThemeToggle'
import { FlowStepper } from '@/components/shared/FlowStepper'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AppView = 'input' | 'dashboard' | 'tickets' | 'cases' | 'actions'

interface LayoutProps {
  children: ReactNode
  view: AppView
  onNavigate?: (view: AppView) => void
  onNewAnalysis?: () => void
}

export function Layout({ children, view, onNavigate, onNewAnalysis }: LayoutProps) {
  const showNav =
    view === 'dashboard' ||
    view === 'tickets' ||
    view === 'cases' ||
    view === 'actions'

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:bg-card/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">ImpactIQ</h1>
              <p className="text-xs text-muted-foreground">
                Test impact analysis for Galaxy QA
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showNav && onNavigate && (
              <nav className="flex rounded-lg border border-transparent bg-muted p-1 dark:border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2',
                    view === 'dashboard' &&
                      'bg-background shadow-sm dark:bg-card dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
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
                    view === 'tickets' &&
                      'bg-background shadow-sm dark:bg-card dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
                  )}
                  onClick={() => onNavigate('tickets')}
                >
                  <Ticket className="size-4" />
                  Tickets
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2',
                    view === 'cases' &&
                      'bg-background shadow-sm dark:bg-card dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
                  )}
                  onClick={() => onNavigate('cases')}
                >
                  <ClipboardList className="size-4" />
                  Cases
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2',
                    view === 'actions' &&
                      'bg-background shadow-sm dark:bg-card dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
                  )}
                  onClick={() => onNavigate('actions')}
                >
                  <Bot className="size-4" />
                  Actions
                </Button>
              </nav>
            )}
            <ThemeToggle />
            {showNav && onNewAnalysis && (
              <Button variant="outline" onClick={onNewAnalysis}>
                New Analysis
              </Button>
            )}
          </div>
        </div>
      </header>
      {showNav && onNavigate && (
        <div className="border-b border-border bg-muted/40 dark:bg-muted/60">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            <FlowStepper current={view} onNavigate={onNavigate} />
          </div>
        </div>
      )}
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
          Create a PR in galaxy-automation and apply fixes via AI agent prompts or TestRail.
        </p>
      </div>
      <Button onClick={onOpenActions} className="shrink-0 gap-2">
        View action plan
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}

export function CasesBanner({
  count,
  onOpenCases,
}: {
  count: number
  onOpenCases: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">
          {count} affected TestRail case{count === 1 ? '' : 's'}
        </p>
        <p className="text-sm text-muted-foreground">
          Search, filter, and review run status with linked Jira tickets.
        </p>
      </div>
      <Button variant="outline" onClick={onOpenCases} className="shrink-0 gap-2">
        <ClipboardList className="size-4" />
        View affected cases
      </Button>
    </div>
  )
}

export function TicketsBanner({
  count,
  onOpenTickets,
}: {
  count: number
  onOpenTickets: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">
          {count} Jira ticket{count === 1 ? '' : 's'} in this analysis
        </p>
        <p className="text-sm text-muted-foreground">
          View story details, acceptance criteria, and per-ticket test impact.
        </p>
      </div>
      <Button variant="outline" onClick={onOpenTickets} className="shrink-0 gap-2">
        <Ticket className="size-4" />
        View tickets
      </Button>
    </div>
  )
}
