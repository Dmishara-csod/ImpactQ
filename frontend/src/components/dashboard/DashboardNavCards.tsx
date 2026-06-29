import { ArrowRight, Bot, ClipboardList, Ticket } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { buildAffectedCases } from '@/lib/buildAffectedCases'
import type { ImpactAnalysis } from '@/types/analysis'

interface DashboardNavCardsProps {
  analysis: ImpactAnalysis
  onOpenTickets: () => void
  onOpenCases: () => void
  onOpenActions: () => void
}

export function DashboardNavCards({
  analysis,
  onOpenTickets,
  onOpenCases,
  onOpenActions,
}: DashboardNavCardsProps) {
  const caseCount = buildAffectedCases(analysis).length
  const actionCount =
    analysis.actionPlan.cursor.length + analysis.actionPlan.testRail.length

  const cards = [
    {
      label: 'Tickets',
      description: 'Jira stories, keywords, and mappings',
      count: analysis.tickets.length,
      icon: Ticket,
      onClick: onOpenTickets,
    },
    {
      label: 'Affected Cases',
      description: 'TestRail cases and required QA actions',
      count: caseCount,
      icon: ClipboardList,
      onClick: onOpenCases,
    },
    {
      label: 'Actions',
      description: 'Copy-only prompts for AI agent and TestRail',
      count: actionCount,
      icon: Bot,
      onClick: onOpenActions,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="transition-shadow hover:shadow-md"
        >
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between">
              <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                <card.icon className="size-4 text-primary" />
              </div>
              <Badge variant="secondary">{card.count}</Badge>
            </div>
            <div>
              <p className="font-medium">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1" onClick={card.onClick}>
              Open
              <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
