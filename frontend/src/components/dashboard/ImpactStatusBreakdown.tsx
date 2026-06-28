import { buildAffectedCases } from '@/lib/buildAffectedCases'
import { countByImpactStatus } from '@/lib/casePromptResolver'
import { STATUS_BAR_CLASS, STATUS_LABEL } from '@/lib/affectedCaseStatus'
import type { ImpactAnalysis } from '@/types/analysis'
import type { CaseImpactStatus } from '@/types/affectedCase'

const STATUS_ORDER: CaseImpactStatus[] = [
  'update_automation',
  'manual_review',
  'coverage_gap',
  'covered',
]

interface ImpactStatusBreakdownProps {
  analysis: ImpactAnalysis
}

export function ImpactStatusBreakdown({ analysis }: ImpactStatusBreakdownProps) {
  const cases = buildAffectedCases(analysis)
  const counts = countByImpactStatus(cases)
  const total = cases.length || 1

  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="text-sm font-semibold">Cases by impact status</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        QA actions required across {cases.length} affected cases
      </p>
      <div className="mt-4 space-y-3">
        {STATUS_ORDER.map((status) => {
          const count = counts[status]
          const pct = Math.round((count / total) * 100)
          return (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{STATUS_LABEL[status]}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${STATUS_BAR_CLASS[status]}`}
                  style={{ width: `${pct}%`, minWidth: count > 0 ? '4px' : 0 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
