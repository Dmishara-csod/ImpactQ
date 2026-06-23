import { AnalysisLoading } from '@/components/AnalysisLoading'
import { ActionsBanner, TicketsBanner } from '@/components/Layout'
import { ChangeSummaryCard } from '@/components/ChangeSummaryCard'
import { CodeImpactCard } from '@/components/CodeImpactCard'
import { CoverageGapsCard } from '@/components/CoverageGapsCard'
import { ExportReportButton } from '@/components/ExportReportButton'
import { ImpactedAutomationCard } from '@/components/ImpactedAutomationCard'
import { ImpactedTestCasesCard } from '@/components/ImpactedTestCasesCard'
import { IntegrationStatus } from '@/components/IntegrationStatus'
import { QuickStatsBar } from '@/components/QuickStatsBar'
import { RecommendationsCard } from '@/components/RecommendationsCard'
import { RiskChartsCard } from '@/components/RiskChartsCard'
import { formatAnalyzedAt } from '@/lib/analysisHistory'
import type { AppSettings } from '@/lib/settings'
import type { ImpactAnalysis } from '@/types/analysis'

interface DashboardPageProps {
  analysis: ImpactAnalysis | null
  isLoading: boolean
  analyzedAt?: string | null
  settings: AppSettings
  onOpenActions?: () => void
  onOpenTickets?: () => void
}

export function DashboardPage({
  analysis,
  isLoading,
  analyzedAt,
  settings,
  onOpenActions,
  onOpenTickets,
}: DashboardPageProps) {
  if (isLoading) {
    return <AnalysisLoading />
  }

  if (!analysis) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Analysis for{' '}
            <span className="font-medium text-foreground">{analysis.inputValue}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {analysis.ticketKeys.length} tickets · {analysis.automation.repo} ·{' '}
            {analysis.automation.environment}
            {analyzedAt && ` · ${formatAnalyzedAt(analyzedAt)}`}
            {analysis.meta?.dataSources && (
              <>
                {' · '}
                Jira: {analysis.meta.dataSources.jira}
                {' · '}
                TestRail: {analysis.meta.dataSources.testRail}
                {' · '}
                Automation: {analysis.meta.dataSources.automation}
              </>
            )}
          </p>
        </div>
        <ExportReportButton analysis={analysis} />
      </div>

      <QuickStatsBar analysis={analysis} />

      {onOpenTickets && (
        <TicketsBanner
          count={analysis.tickets.length}
          onOpenTickets={onOpenTickets}
        />
      )}

      <IntegrationStatus settings={settings} />

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
