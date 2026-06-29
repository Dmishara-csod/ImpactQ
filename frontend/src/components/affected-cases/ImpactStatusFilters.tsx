import { STATUS_LABEL } from '@/lib/affectedCaseStatus'
import type { CaseImpactStatus } from '@/types/affectedCase'
import { cn } from '@/lib/utils'

const ALL_STATUSES: CaseImpactStatus[] = [
  'update_automation',
  'manual_review',
  'coverage_gap',
  'covered',
]

interface ImpactStatusFiltersProps {
  selected: CaseImpactStatus[]
  onToggle: (status: CaseImpactStatus) => void
  onClear: () => void
}

export function ImpactStatusFilters({ selected, onToggle, onClear }: ImpactStatusFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_STATUSES.map((status) => {
        const active = selected.includes(status)
        return (
          <button
            key={status}
            type="button"
            onClick={() => onToggle(status)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            {STATUS_LABEL[status]}
          </button>
        )
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
