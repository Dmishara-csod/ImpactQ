import { DashboardNavCards } from '@/components/dashboard/DashboardNavCards'
import { DashboardSummaryStrip } from '@/components/dashboard/DashboardSummaryStrip'
import { ImpactStatusBreakdown } from '@/components/dashboard/ImpactStatusBreakdown'
import { ChangeSummaryCard } from '@/components/ChangeSummaryCard'
import { RecommendationsCard } from '@/components/RecommendationsCard'
import { formatAnalyzedAt } from '@/lib/analysisHistory'
import type { ImpactAnalysis } from '@/types/analysis'

interface DashboardPageContentProps {
  analysis: ImpactAnalysis
  analyzedAt?: string | null
  onOpenTickets: () => void
  onOpenCases: () => void
  onOpenActions: () => void
}

export function DashboardPageContent({
  analysis,
  analyzedAt,
  onOpenTickets,
  onOpenCases,
  onOpenActions,
}: DashboardPageContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Impact summary</h2>
        <p className="text-sm text-muted-foreground">
          {analysis.inputValue}
          {analyzedAt && ` · ${formatAnalyzedAt(analyzedAt)}`}
          {' · '}
          {analysis.automation.repo} · {analysis.automation.environment}
        </p>
      </div>

      <DashboardSummaryStrip analysis={analysis} />
      <DashboardNavCards
        analysis={analysis}
        onOpenTickets={onOpenTickets}
        onOpenCases={onOpenCases}
        onOpenActions={onOpenActions}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChangeSummaryCard analysis={analysis} />
        <ImpactStatusBreakdown analysis={analysis} />
      </div>

      <RecommendationsCard
        recommendations={analysis.recommendations.slice(0, 5)}
        onOpenActions={onOpenActions}
      />
    </div>
  )
}
