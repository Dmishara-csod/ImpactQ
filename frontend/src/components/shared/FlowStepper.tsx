import { Bot, ClipboardList, LayoutDashboard, PenLine, Ticket } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { AppView } from '@/components/Layout'

const STEPS: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Summary', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'cases', label: 'Cases', icon: ClipboardList },
  { id: 'actions', label: 'Actions', icon: Bot },
]

interface FlowStepperProps {
  current: AppView
  onNavigate?: (view: AppView) => void
}

export function FlowStepper({ current, onNavigate }: FlowStepperProps) {
  const activeIndex = STEPS.findIndex((s) => s.id === current)

  return (
    <nav
      aria-label="Analysis flow"
      className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 px-2 py-1.5 text-xs dark:bg-muted/80"
    >
      <span className="mr-1 flex shrink-0 items-center gap-1 px-2 text-muted-foreground">
        <PenLine className="size-3.5" />
        Input
      </span>
      {STEPS.map((step, index) => {
        const Icon = step.icon
        const isActive = step.id === current
        const isPast = activeIndex > index

        return (
          <div key={step.id} className="flex shrink-0 items-center">
            <span className="mx-1 text-muted-foreground/50">→</span>
            <button
              type="button"
              disabled={!onNavigate}
              onClick={() => onNavigate?.(step.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors',
                isActive &&
                  'bg-background text-foreground shadow-sm dark:bg-card dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
                !isActive && isPast && 'text-foreground/80 hover:bg-background/60 dark:hover:bg-card/70',
                !isActive && !isPast && 'text-muted-foreground',
                onNavigate && 'cursor-pointer',
              )}
            >
              <Icon className="size-3.5" />
              {step.label}
            </button>
          </div>
        )
      })}
    </nav>
  )
}
