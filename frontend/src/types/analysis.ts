export type InputType = 'jira' | 'pr' | 'requirement'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type ActionStatus = 'pending' | 'ready' | 'in_progress' | 'done'

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
  actionPlan: {
    pr: PrActionPlan
    cursor: CursorMcpAction[]
    testRail: TestRailMcpAction[]
  }
}

export interface AnalysisInput {
  inputType: InputType
  inputValue: string
}
