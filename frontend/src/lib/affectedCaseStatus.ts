import type { CaseImpactStatus } from '@/types/affectedCase'

/** Left stripe — uses dedicated impact tokens (distinct from primary/link blue). */
export const STATUS_STRIPE: Record<CaseImpactStatus, string> = {
  update_automation: 'border-l-[var(--impact-update)]',
  manual_review: 'border-l-[var(--impact-manual)]',
  coverage_gap: 'border-l-[var(--impact-gap)]',
  covered: 'border-l-[var(--impact-covered)]',
}

export const STATUS_LABEL: Record<CaseImpactStatus, string> = {
  update_automation: 'Update Automation',
  manual_review: 'Manual Review',
  coverage_gap: 'Coverage Gap',
  covered: 'Covered',
}

export const STATUS_BADGE_CLASS: Record<CaseImpactStatus, string> = {
  update_automation: 'impact-badge impact-badge--update',
  manual_review: 'impact-badge impact-badge--manual',
  coverage_gap: 'impact-badge impact-badge--gap',
  covered: 'impact-badge impact-badge--covered',
}

export const STATUS_BAR_CLASS: Record<CaseImpactStatus, string> = {
  update_automation: 'bg-[var(--impact-update)]',
  manual_review: 'bg-[var(--impact-manual)]',
  coverage_gap: 'bg-[var(--impact-gap)]',
  covered: 'bg-[var(--impact-covered)]',
}

export function formatLastUpdated(iso?: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
