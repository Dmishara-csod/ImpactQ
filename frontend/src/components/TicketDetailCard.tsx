import { ExternalLink, Tag, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
  defaultOpen?: boolean
}

const priorityVariant = {
  Highest: 'danger',
  High: 'warning',
  Medium: 'secondary',
  Low: 'outline',
} as const

export function TicketDetailCard({ ticket }: TicketDetailCardProps) {
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
            <Badge variant="secondary">{ticket.storyPoints} pts</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">{ticket.description}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <User className="size-3.5" /> People
            </p>
            <p className="text-muted-foreground">Assignee: {ticket.assignee}</p>
            <p className="text-muted-foreground">Reporter: {ticket.reporter}</p>
            <p className="text-xs text-muted-foreground">
              Created {ticket.created} · Updated {ticket.updated}
            </p>
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
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ticket.labels.map((label) => (
                <Badge key={label} variant="outline">{label}</Badge>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Impacted TestRail</p>
            {ticket.impactedTestCases.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {ticket.impactedTestCases.map((id) => (
                  <Badge key={id} variant="outline">{id}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No mapped cases yet</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Impacted automation</p>
            {ticket.impactedAutomation.length > 0 ? (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {ticket.impactedAutomation.map((item) => (
                  <li key={item}>
                    <code>{item}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No mapped tests yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
