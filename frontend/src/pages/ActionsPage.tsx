import { Bot, ClipboardList, GitPullRequest } from 'lucide-react'

import { CursorMcpPanel } from '@/components/actions/CursorMcpPanel'
import { PrActionsPanel } from '@/components/actions/PrActionsPanel'
import { TestRailMcpPanel } from '@/components/actions/TestRailMcpPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ImpactAnalysis } from '@/types/analysis'

interface ActionsPageProps {
  analysis: ImpactAnalysis
}

export function ActionsPage({ analysis }: ActionsPageProps) {
  const { pr, cursor, testRail } = analysis.actionPlan

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Action plan</h2>
        <p className="mt-1 text-muted-foreground">
          Create a PR in galaxy-automation, then use Cursor Pro with MCP to run TestNG
          suites and update TestRail cases on testrail.csod.com.
        </p>
      </div>

      <Tabs defaultValue="pr">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pr" className="gap-2">
            <GitPullRequest className="size-4" />
            PR changes
          </TabsTrigger>
          <TabsTrigger value="cursor" className="gap-2">
            <Bot className="size-4" />
            Cursor MCP
          </TabsTrigger>
          <TabsTrigger value="testrail" className="gap-2">
            <ClipboardList className="size-4" />
            TestRail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pr">
          <PrActionsPanel plan={pr} />
        </TabsContent>

        <TabsContent value="cursor">
          <CursorMcpPanel actions={cursor} />
        </TabsContent>

        <TabsContent value="testrail">
          <TestRailMcpPanel actions={testRail} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
