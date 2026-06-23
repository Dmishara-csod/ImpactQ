import {
  buildScenarioCandidates,
  filterAcceptanceCriteria,
  scenarioActionId,
} from '@/lib/testScenarioUtils'
import type { ImpactAnalysis, TestRailMcpAction } from '@/types/analysis'

function isUsableActionTitle(title: string): boolean {
  if (/^verify:\s*cc:/i.test(title)) return false
  if (/^\[~[\w]+\]/i.test(title.trim())) return false
  if (/^verify acceptance criteria:/i.test(title)) return false
  return title.trim().length >= 15
}

function buildActionFromScenario(
  analysis: ImpactAnalysis,
  scenario: string,
): TestRailMcpAction {
  const suite = analysis.testRail.suiteName || 'Picasso Admin Regression'
  const jiraRef = analysis.ticketKeys.join(', ')
  const ticketContext = analysis.tickets
    .map((t) => `${t.key}: ${t.title}`)
    .slice(0, 3)
    .join('; ')
  const validAc = analysis.tickets
    .flatMap((t) => filterAcceptanceCriteria(t.acceptanceCriteria || []))
    .slice(0, 2)
  const impactedCases = analysis.testRail.testCases.slice(0, 8).map((c) => ({
    id: c.id,
    title: c.title,
    url: c.url,
    suite: c.suite,
  }))

  return {
    id: scenarioActionId(scenario),
    action: 'create',
    title: scenario,
    suite,
    steps: [
      `Open feature area for Jira: ${ticketContext || jiraRef}`,
      ...validAc.map((ac) => `Validate acceptance criteria: ${ac}`),
      `Execute test scenario: ${scenario}`,
      'Verify expected outcome and log result in TestRail',
    ].slice(0, 5),
    status: 'ready',
    jiraKeys: analysis.ticketKeys,
    impactedCases,
    cursorPrompt: `Using TestRail MCP (project ${analysis.testRail.projectId}), create test case:
Title: ${scenario}
Suite: ${suite}
Link to Jira: ${jiraRef}
Related tickets: ${ticketContext}

Impacted existing cases: ${impactedCases.map((c) => c.id).join(', ') || 'none'}

After creating the case, map it with @TestRailCases in the impacted automation test class.`,
  }
}

export function buildFallbackTestRailActions(analysis: ImpactAnalysis): TestRailMcpAction[] {
  const backendActions = (analysis.actionPlan?.testRail || []).filter((action) =>
    isUsableActionTitle(action.title),
  )

  const scenarios = buildScenarioCandidates({
    gaps: analysis.coverageGaps,
    tickets: analysis.tickets,
    jiraRef: analysis.ticketKeys.join(', ') || analysis.inputValue,
  })

  const backendById = new Map(backendActions.map((action) => [action.id, action]))

  return scenarios.map((scenario) => {
    const id = scenarioActionId(scenario)
    return backendById.get(id) || buildActionFromScenario(analysis, scenario)
  })
}

export function resolveTestRailActions(
  analysis: ImpactAnalysis,
  actions: TestRailMcpAction[],
): TestRailMcpAction[] {
  const scenarios = buildScenarioCandidates({
    gaps: analysis.coverageGaps,
    tickets: analysis.tickets,
    jiraRef: analysis.ticketKeys.join(', ') || analysis.inputValue,
  })

  const backendById = new Map(
    actions.filter((action) => isUsableActionTitle(action.title)).map((action) => [action.id, action]),
  )

  return scenarios.map(
    (scenario) => backendById.get(scenarioActionId(scenario)) || buildActionFromScenario(analysis, scenario),
  )
}
