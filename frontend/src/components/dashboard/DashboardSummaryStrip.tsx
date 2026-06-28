import { ClipboardList, Layers, Ticket } from 'lucide-react'

import { buildAffectedCases } from '@/lib/buildAffectedCases'
import { countByImpactStatus } from '@/lib/casePromptResolver'
import type { ImpactAnalysis } from '@/types/analysis'

interface DashboardSummaryStripProps {
  analysis: ImpactAnalysis
}

export function DashboardSummaryStrip({ analysis }: DashboardSummaryStripProps) {
  const cases = buildAffectedCases(analysis)
  const counts = countByImpactStatus(cases)
  const needsAction =
    counts.update_automation + counts.manual_review + counts.coverage_gap

  const items = [
    {
      label: 'Tickets analyzed',
      value: String(analysis.tickets.length),
      icon: Ticket,
    },
    {
      label: 'Affected cases',
      value: String(cases.length),
      icon: ClipboardList,
    },
    {
      label: 'Needs action',
      value: String(needsAction),
      sub: 'update · review · gap',
      icon: Layers,
    },
  ]

  return (
    <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 bg-card px-4 py-3"
        >
          <item.icon className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-xl font-semibold tabular-nums tracking-tight">
              {item.value}
            </p>
            {'sub' in item && item.sub && (
              <p className="text-[10px] text-muted-foreground">{item.sub}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
