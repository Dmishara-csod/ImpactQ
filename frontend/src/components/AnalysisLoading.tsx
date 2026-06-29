import { useEffect, useState } from 'react'

import { SkeletonBlock } from '@/components/shared/SkeletonBlock'

const PIPELINE_STAGES = [
  'Fetching Jira tickets…',
  'Scanning galaxy-automation…',
  'Resolving TestRail cases…',
  'Detecting coverage gaps…',
  'Building action plan…',
]

interface AnalysisLoadingProps {
  ticketCount?: number
}

export function AnalysisLoading({ ticketCount = 1 }: AnalysisLoadingProps) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, PIPELINE_STAGES.length - 1))
    }, 450)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${((stageIndex + 1) / PIPELINE_STAGES.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {PIPELINE_STAGES[stageIndex]}
          {ticketCount > 0 && ` · ${ticketCount} ticket${ticketCount === 1 ? '' : 's'}`}
        </p>
      </div>

      <SkeletonBlock variant="chart" />
      <div className="grid gap-3 sm:grid-cols-3">
        <SkeletonBlock variant="card" />
        <SkeletonBlock variant="card" />
        <SkeletonBlock variant="card" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonBlock variant="card" />
        <SkeletonBlock variant="card" />
      </div>
    </div>
  )
}
