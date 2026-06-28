import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type SkeletonVariant = 'card' | 'row' | 'chart'

interface SkeletonBlockProps {
  variant?: SkeletonVariant
  className?: string
}

export function SkeletonBlock({ variant = 'card', className }: SkeletonBlockProps) {
  if (variant === 'row') {
    return (
      <div className={cn('flex gap-3 rounded-lg border p-4', className)}>
        <Skeleton className="skeleton-shimmer h-5 w-16 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="skeleton-shimmer h-4 w-3/4" />
          <Skeleton className="skeleton-shimmer h-3 w-1/2" />
        </div>
        <Skeleton className="skeleton-shimmer h-6 w-20 rounded-full" />
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div className={cn('space-y-3 rounded-lg border p-4', className)}>
        <Skeleton className="skeleton-shimmer h-4 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="skeleton-shimmer h-3 w-24" />
              <Skeleton className="skeleton-shimmer h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <Skeleton className="skeleton-shimmer mb-3 h-4 w-32" />
      <Skeleton className="skeleton-shimmer mb-2 h-3 w-full" />
      <Skeleton className="skeleton-shimmer h-3 w-2/3" />
    </div>
  )
}
