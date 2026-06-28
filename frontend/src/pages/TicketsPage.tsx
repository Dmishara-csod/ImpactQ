import { TicketDetailCard } from '@/components/TicketDetailCard'
import { buildAffectedCases } from '@/lib/buildAffectedCases'
import type { ImpactAnalysis } from '@/types/analysis'

interface TicketsPageProps {
  analysis: ImpactAnalysis
  onOpenCases: (ticketKey: string) => void
}

export function TicketsPage({ analysis, onOpenCases }: TicketsPageProps) {
  const allCases = buildAffectedCases(analysis)

  function caseCountForTicket(ticketKey: string) {
    return allCases.filter((c) =>
      c.linkedTickets.some((t) => t.key === ticketKey),
    ).length
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Jira tickets</h2>
        <p className="mt-1 text-muted-foreground">
          {analysis.tickets.length} ticket
          {analysis.tickets.length === 1 ? '' : 's'} in this analysis run.
        </p>
      </div>

      <div className="space-y-4">
        {analysis.tickets.map((ticket) => {
          const caseCount = caseCountForTicket(ticket.key)
          return (
            <TicketDetailCard
              key={ticket.key}
              ticket={ticket}
              affectedCaseCount={caseCount}
              onViewCases={() => onOpenCases(ticket.key)}
            />
          )
        })}
      </div>
    </div>
  )
}
