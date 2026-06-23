import type { CursorMcpAction, ImpactAnalysis } from '@/types/analysis'

export function buildFallbackCursorActions(analysis: ImpactAnalysis): CursorMcpAction[] {
  if (analysis.actionPlan?.cursor?.length > 0) {
    return analysis.actionPlan.cursor
  }

  const jiraRef = analysis.ticketKeys.join(', ')
  const testFiles = analysis.automation.tests
    .filter((t) => t.file.includes('Test.java'))
    .slice(0, 2)
    .map((t) => t.file)

  const targetFiles =
    testFiles.length > 0
      ? testFiles
      : ['src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml']

  return [
    {
      id: 'cursor-fallback-1',
      category: 'code',
      title: 'Update impacted Java Playwright tests',
      description: 'Use Cursor Agent with JetBrains MCP to update test files and page objects.',
      mcpTools: ['filesystem', 'jetbrains', 'terminal'],
      targetFiles,
      status: 'ready',
      cursorPrompt: `In galaxy-automation repo, update tests for Jira tickets: ${jiraRef}
1. Fix locators in impacted page objects
2. Update @TestRailCases mappings: ${analysis.testRail.testCases.map((c) => c.id).join(', ') || 'TBD'}
3. Follow @Test(groups = {"Sanity","Admin"}) patterns`,
    },
    {
      id: 'cursor-fallback-2',
      category: 'run',
      title: 'Run Admin Sanity suite via Maven',
      description: 'Execute tests through Cursor terminal MCP against PRESTAGE.',
      mcpTools: ['terminal', 'jetbrains'],
      targetFiles: ['src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml'],
      status: 'pending',
      cursorPrompt: `Run in galaxy-automation:
mvn test -DsuiteXmlFile=src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml

Environment: PRESTAGE. Fix failures and re-run.`,
    },
  ]
}
