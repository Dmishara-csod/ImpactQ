import { Bot, ClipboardList, GitPullRequest, Hand } from 'lucide-react'

import { AgentPromptsPanel } from '@/components/actions/CursorMcpPanel'
import { PrActionsPanel } from '@/components/actions/PrActionsPanel'
import { TestRailMcpPanel } from '@/components/actions/TestRailMcpPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ActionsFocus } from '@/types/actions'
import type { ImpactAnalysis } from '@/types/analysis'

interface ActionsPageProps {
  analysis: ImpactAnalysis
  focus?: ActionsFocus
}

export function ActionsPage({ analysis, focus }: ActionsPageProps) {
  const { pr, cursor = [], testRail = [] } = analysis.actionPlan ?? {}
  const defaultTab = focus?.tab ?? 'pr'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Actions</h2>
        <p className="mt-1 text-muted-foreground">
          Copy-only handoff to your AI agent and TestRail integration — nothing runs from this app.
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Hand className="size-3.5" />
          Every action below is a manual step executed in your local environment.
        </p>
      </div>

      <Tabs defaultValue={defaultTab} key={defaultTab + (focus?.promptId ?? '')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pr" className="gap-2">
            <GitPullRequest className="size-4" />
            PR Template
          </TabsTrigger>
          <TabsTrigger value="agent" className="gap-2">
            <Bot className="size-4" />
            AI Agent Prompts
          </TabsTrigger>
          <TabsTrigger value="testrail" className="gap-2">
            <ClipboardList className="size-4" />
            TestRail Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pr">
          <PrActionsPanel plan={pr} />
        </TabsContent>

        <TabsContent value="agent">
          <AgentPromptsPanel
            analysis={analysis}
            actions={cursor}
            highlightId={focus?.promptId}
          />
        </TabsContent>

        <TabsContent value="testrail">
          <TestRailMcpPanel
            analysis={analysis}
            actions={testRail}
            highlightId={focus?.promptId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
