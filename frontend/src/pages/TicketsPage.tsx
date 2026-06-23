import { TicketDetailCard } from '@/components/TicketDetailCard'
import { Badge } from '@/components/ui/badge'
import type { ImpactAnalysis } from '@/types/analysis'

interface TicketsPageProps {
  analysis: ImpactAnalysis
}

function isPlaceholderTicket(key: string, title: string, description: string) {
  return title === `Story ${key}` || description.includes(`Placeholder for ${key}`)
}

export function TicketsPage({ analysis }: TicketsPageProps) {
  const hasPlaceholder = analysis.tickets.some((t) =>
    isPlaceholderTicket(t.key, t.title, t.description),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Jira tickets</h2>
        <p className="mt-1 text-muted-foreground">
          Detailed information for {analysis.tickets.length} ticket
          {analysis.tickets.length === 1 ? '' : 's'} in this impact analysis.
        </p>
        {analysis.meta?.dataSources && (
          <p className="mt-1 text-xs text-muted-foreground">
            Data sources — Jira: {analysis.meta.dataSources.jira} · TestRail:{' '}
            {analysis.meta.dataSources.testRail} · Automation:{' '}
            {analysis.meta.dataSources.automation}
          </p>
        )}
        {hasPlaceholder && (
          <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            This analysis has placeholder Jira data (likely from before credentials were
            configured). Go back and run a new analysis for live Jira + TestRail data.
          </p>
        )}
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
