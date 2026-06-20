import { AnalysisLoading } from '@/components/AnalysisLoading'
import { ActionsBanner } from '@/components/Layout'
import { ChangeSummaryCard } from '@/components/ChangeSummaryCard'
import { CodeImpactCard } from '@/components/CodeImpactCard'
import { CoverageGapsCard } from '@/components/CoverageGapsCard'
import { ImpactedAutomationCard } from '@/components/ImpactedAutomationCard'
import { ImpactedTestCasesCard } from '@/components/ImpactedTestCasesCard'
import { RecommendationsCard } from '@/components/RecommendationsCard'
import { RiskChartsCard } from '@/components/RiskChartsCard'
import type { ImpactAnalysis } from '@/types/analysis'

interface DashboardPageProps {
  analysis: ImpactAnalysis | null
  isLoading: boolean
  onOpenActions?: () => void
}

export function DashboardPage({ analysis, isLoading, onOpenActions }: DashboardPageProps) {
  if (isLoading) {
    return <AnalysisLoading />
  }

  if (!analysis) return null

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Analysis for{' '}
          <span className="font-medium text-foreground">{analysis.inputValue}</span>
          {' · '}
          <span className="text-muted-foreground">{analysis.automation.repo}</span>
        </p>
      </div>

      {onOpenActions && <ActionsBanner onOpenActions={onOpenActions} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChangeSummaryCard analysis={analysis} />
        <RiskChartsCard analysis={analysis} />
        <CodeImpactCard codeImpact={analysis.codeImpact} />
        <ImpactedTestCasesCard testRail={analysis.testRail} />
        <ImpactedAutomationCard automation={analysis.automation} />
        <CoverageGapsCard gaps={analysis.coverageGaps} />
        <RecommendationsCard recommendations={analysis.recommendations} />
      </div>
    </div>
  )
}
