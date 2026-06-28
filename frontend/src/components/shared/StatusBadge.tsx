import { Badge } from '@/components/ui/badge'
import { STATUS_BADGE_CLASS, STATUS_LABEL } from '@/lib/affectedCaseStatus'
import { cn } from '@/lib/utils'
import type { CaseImpactStatus } from '@/types/affectedCase'

interface StatusBadgeProps {
  status: CaseImpactStatus
  className?: string
  pulse?: boolean
}

export function StatusBadge({ status, className, pulse }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'shrink-0 text-[11px] font-semibold tracking-wide',
        STATUS_BADGE_CLASS[status],
        (pulse ?? (status === 'update_automation' || status === 'coverage_gap')) &&
          'animate-pulse',
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  )
}
