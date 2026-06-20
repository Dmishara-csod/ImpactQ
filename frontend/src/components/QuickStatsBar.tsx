import {
  AlertTriangle,
  Bot,
  ClipboardList,
  FolderGit2,
  Layers,
  TestTube2,
  Ticket,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { ImpactAnalysis } from '@/types/analysis'

interface QuickStatsBarProps {
  analysis: ImpactAnalysis
}

export function QuickStatsBar({ analysis }: QuickStatsBarProps) {
  const gapCount =
    analysis.coverageGaps.missingScenarios.length +
    analysis.coverageGaps.missingAutomation.length +
    analysis.coverageGaps.edgeCases.length

  const stats = [
    {
      label: 'Jira tickets',
      value: String(analysis.tickets.length),
      sub: analysis.ticketKeys.join(', '),
      icon: Ticket,
    },
    {
      label: 'Risk score',
      value: `${analysis.risk.score}`,
      sub: analysis.risk.level,
      icon: AlertTriangle,
      accent: analysis.risk.level === 'HIGH',
    },
    {
      label: 'Modules',
      value: String(analysis.changeSummary.modules.length),
      sub: 'impacted',
      icon: Layers,
    },
    {
      label: 'TestRail',
      value: String(analysis.testRail.testCases.length),
      sub: 'cases',
      icon: ClipboardList,
    },
    {
      label: 'Automation',
      value: String(analysis.automation.tests.length),
      sub: analysis.automation.repo,
      icon: TestTube2,
    },
    {
      label: 'Gaps',
      value: String(gapCount),
      sub: 'to address',
      icon: Bot,
    },
    {
      label: 'PR changes',
      value: String(analysis.actionPlan.pr.changes.length),
      sub: 'files',
      icon: FolderGit2,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <stat.icon className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                {stat.accent ? (
                  <Badge variant="danger" className="text-[10px]">
                    {stat.sub}
                  </Badge>
                ) : (
                  <span className="truncate text-xs text-muted-foreground">{stat.sub}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
