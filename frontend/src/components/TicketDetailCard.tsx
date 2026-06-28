import { ExternalLink, Tag, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { JiraTicket } from '@/types/analysis'

interface TicketDetailCardProps {
  ticket: JiraTicket
  affectedCaseCount?: number
  onViewCases?: () => void
}

const priorityVariant = {
  Highest: 'danger',
  High: 'warning',
  Medium: 'secondary',
  Low: 'outline',
} as const

export function TicketDetailCard({
  ticket,
  affectedCaseCount = 0,
  onViewCases,
}: TicketDetailCardProps) {
  const noMatches =
    ticket.impactedTestCases.length === 0 && ticket.impactedAutomation.length === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <a
              href={ticket.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-lg font-semibold text-primary hover:underline"
            >
              {ticket.key}
              <ExternalLink className="size-4" />
            </a>
            <CardTitle className="mt-1 text-base font-medium">{ticket.title}</CardTitle>
            <CardDescription className="mt-1">{ticket.type} · {ticket.sprint}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{ticket.status}</Badge>
            <Badge variant={priorityVariant[ticket.priority as keyof typeof priorityVariant] ?? 'outline'}>
              {ticket.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">{ticket.description}</p>

        {noMatches && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
            No automation or TestRail cases matched this ticket — treat as a coverage gap signal.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <User className="size-3.5" /> People
            </p>
            <p className="text-muted-foreground">Assignee: {ticket.assignee}</p>
            <p className="text-muted-foreground">Reporter: {ticket.reporter}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <Tag className="size-3.5" /> Modules & labels
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ticket.modules.map((m) => (
                <Badge key={m} variant="secondary">{m}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Acceptance criteria</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {ticket.acceptanceCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Affected cases:{' '}
            <span className="font-medium text-foreground">{affectedCaseCount}</span>
          </p>
          {onViewCases && (
            <Button variant="outline" size="sm" onClick={onViewCases}>
              View in Cases
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
