import { ArrowRight, ExternalLink } from 'lucide-react'

import { StatusBadge } from '@/components/shared/StatusBadge'
import { buildAffectedCases } from '@/lib/buildAffectedCases'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ImpactAnalysis } from '@/types/analysis'

interface ImpactedTestCasesCardProps {
  analysis: ImpactAnalysis
  onViewAll?: () => void
}

const PREVIEW_COUNT = 5

export function ImpactedTestCasesCard({
  analysis,
  onViewAll,
}: ImpactedTestCasesCardProps) {
  const { testRail } = analysis
  const previewCases = buildAffectedCases(analysis).slice(0, PREVIEW_COUNT)

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Impacted TestRail cases</CardTitle>
          <CardDescription>
            Project {testRail.projectId} · {testRail.suiteName} ·{' '}
            {testRail.testCases.length} cases
          </CardDescription>
        </div>
        {onViewAll && testRail.testCases.length > 0 && (
          <Button variant="ghost" size="sm" className="shrink-0 gap-1" onClick={onViewAll}>
            View all
            <ArrowRight className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {previewCases.map((testCase) => (
            <div
              key={testCase.id}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <a
                  href={testCase.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                >
                  {testCase.id}
                  <ExternalLink className="size-3" />
                </a>
                <p className="mt-0.5 truncate text-sm">{testCase.name}</p>
              </div>
              <div className="flex shrink-0 items-center self-start sm:self-center">
                <StatusBadge status={testCase.status} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
