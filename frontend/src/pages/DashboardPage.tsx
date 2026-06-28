import { AnalysisLoading } from '@/components/AnalysisLoading'
import { DashboardPageContent } from '@/components/dashboard/DashboardPageContent'
import type { ImpactAnalysis } from '@/types/analysis'

interface DashboardPageProps {
  analysis: ImpactAnalysis | null
  isLoading: boolean
  analyzedAt?: string | null
  loadingTicketCount?: number
  onOpenActions: () => void
  onOpenTickets: () => void
  onOpenCases: () => void
}

export function DashboardPage({
  analysis,
  isLoading,
  analyzedAt,
  loadingTicketCount,
  onOpenActions,
  onOpenTickets,
  onOpenCases,
}: DashboardPageProps) {
  if (isLoading) {
    return <AnalysisLoading ticketCount={loadingTicketCount} />
  }

  if (!analysis) return null

  return (
    <DashboardPageContent
      analysis={analysis}
      analyzedAt={analyzedAt}
      onOpenTickets={onOpenTickets}
      onOpenCases={onOpenCases}
      onOpenActions={onOpenActions}
    />
  )
}
