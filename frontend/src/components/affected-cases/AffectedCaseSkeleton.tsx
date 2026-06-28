import { Skeleton } from '@/components/ui/skeleton'

export function AffectedCaseSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg border bg-card p-4 sm:gap-4">
      <Skeleton className="skeleton-shimmer hidden h-5 w-20 shrink-0 sm:block" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <Skeleton className="skeleton-shimmer h-4 w-16" />
          <Skeleton className="skeleton-shimmer h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="skeleton-shimmer h-4 w-3/4" />
        <Skeleton className="skeleton-shimmer h-3 w-1/2" />
      </div>
      <Skeleton className="skeleton-shimmer hidden h-5 w-16 shrink-0 sm:block" />
      <Skeleton className="skeleton-shimmer hidden h-6 w-20 shrink-0 rounded-full md:block" />
    </div>
  )
}

export function AffectedCaseListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading affected cases">
      {Array.from({ length: count }).map((_, index) => (
        <AffectedCaseSkeleton key={index} />
      ))}
    </div>
  )
}

export function JiraTicketSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <Skeleton className="skeleton-shimmer h-4 w-24" />
        <Skeleton className="skeleton-shimmer h-3 w-full max-w-sm" />
      </div>
      <Skeleton className="skeleton-shimmer h-5 w-16 rounded-full" />
    </div>
  )
}
