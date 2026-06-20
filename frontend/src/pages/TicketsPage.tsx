import { TicketDetailCard } from '@/components/TicketDetailCard'
import { Badge } from '@/components/ui/badge'
import type { ImpactAnalysis } from '@/types/analysis'

interface TicketsPageProps {
  analysis: ImpactAnalysis
}

export function TicketsPage({ analysis }: TicketsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Jira tickets</h2>
        <p className="mt-1 text-muted-foreground">
          Detailed information for {analysis.tickets.length} ticket
          {analysis.tickets.length === 1 ? '' : 's'} in this impact analysis.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.ticketKeys.map((key) => (
            <Badge key={key} variant="secondary">{key}</Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {analysis.tickets.map((ticket) => (
          <TicketDetailCard key={ticket.key} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
