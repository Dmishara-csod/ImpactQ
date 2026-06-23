export type InputType = 'jira' | 'pr' | 'requirement'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type ActionStatus = 'pending' | 'ready' | 'in_progress' | 'done'

export interface JiraTicket {
  key: string
  title: string
  description: string
  status: string
  priority: string
  type: string
  assignee: string
  reporter: string
  labels: string[]
  acceptanceCriteria: string[]
  modules: string[]
  url: string
  sprint: string
  storyPoints: number
  impactedTestCases: string[]
  impactedAutomation: string[]
  created: string
  updated: string
}

export interface PrChangeItem {
  id: string
  testFile: string
  changeType: 'update' | 'create' | 'fix'
  summary: string
  relatedCases: string[]
  suggestedDiff: string
}

export interface PrActionPlan {
  title: string
  branchName: string
  description: string
  changes: PrChangeItem[]
  prBody: string
}

export interface CursorMcpAction {
  id: string
  category: 'playwright' | 'code' | 'run'
  title: string
  description: string
  mcpTools: string[]
  cursorPrompt: string
  targetFiles: string[]
  status: ActionStatus
}

export interface TestRailMcpAction {
  id: string
  action: 'create' | 'update'
  caseId?: string
  title: string
  suite: string
  steps: string[]
  cursorPrompt: string
  status: ActionStatus
  jiraKeys?: string[]
  impactedCases?: { id: string; title: string; url: string; suite: string }[]
  createdCase?: { id: string; title: string; url: string; suite: string }
}

export interface AutomationTest {
  file: string
  testClass: string
  testMethods: string[]
  groups: string[]
  testRailIds: string[]
}

export interface ImpactAnalysis {
  id: string
  inputType: InputType
  inputValue: string
  ticketKeys: string[]
  tickets: JiraTicket[]
  changeSummary: {
    title: string
    description: string
    modules: string[]
    businessCapability: string
    functionalAreas: string[]
  }
  codeImpact: {
    files: string[]
    services: string[]
    components: string[]
  }
  testRail: {
    projectId: string
    suiteName: string
    testCases: { id: string; title: string; suite: string; url: string }[]
  }
  automation: {
    repo: string
    framework: string
    testNgSuite: string
    environment: string
    repoPath: string
    tests: AutomationTest[]
  }
  coverageGaps: {
    missingScenarios: string[]
    missingAutomation: string[]
    edgeCases: string[]
  }
  risk: {
    score: number
    level: RiskLevel
    factors: string[]
  }
  recommendations: string[]
  meta?: {
    dataSources?: {
      jira?: string
      testRail?: string
      automation?: string
      analysis?: string
    }
    analyzedAt?: string
  }
  actionPlan: {
    pr: PrActionPlan
    cursor: CursorMcpAction[]
    testRail: TestRailMcpAction[]
  }
}

export interface AnalysisInput {
  inputType: InputType
  ticketKeys: string[]
}
