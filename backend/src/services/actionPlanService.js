import { config } from '../config.js'

export function buildActionPlan({ ticketKeys, tickets, testCases, automation, gaps }) {
  const jiraRef = ticketKeys.join(', ')
  const testFiles = automation.tests.filter((t) => t.file.includes('Test.java'))

  const prChanges = testFiles.slice(0, 4).map((test, index) => ({
    id: `pr-${index + 1}`,
    testFile: test.file.split('/').pop(),
    changeType: index === testFiles.length - 1 && testFiles.length < 4 ? 'create' : 'update',
    summary: `Update ${test.testClass} for impacted TestRail cases`,
    relatedCases: test.testRailIds.map((id) => `C${id}`),
    suggestedDiff: `@Test(groups = {"Regression", "Admin"})\n@TestRailCases(testCasesId = "${test.testRailIds[0] || '00000000'}")\npublic void ${test.testMethods[0] || 'testExample'}() {\n    // update locators and assertions\n}`,
  }))

  if (prChanges.length === 0) {
    prChanges.push({
      id: 'pr-1',
      testFile: 'AdminThemeAndBrandingTest.java',
      changeType: 'update',
      summary: 'Add tests for submitted Jira stories',
      relatedCases: testCases.slice(0, 3).map((c) => c.id),
      suggestedDiff: '// Add new @Test methods with @TestRailCases annotations',
    })
  }

  const branchSuffix = ticketKeys[0]?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'impact'

  return {
    pr: {
      title: `Update galaxy-automation for ${ticketKeys.length} Jira stor${ticketKeys.length === 1 ? 'y' : 'ies'}`,
      branchName: `test/impactiq-${branchSuffix}`,
      description:
        'Create a PR in galaxy-automation updating tests and page objects for impacted TestRail cases.',
      changes: prChanges,
      prBody: `## ImpactIQ — galaxy-automation coverage PR

### Jira tickets
${ticketKeys.map((k) => `- ${k}`).join('\n')}

### Repository
\`${config.automation.repoName}\`

### TestRail cases
${testCases.map((c) => c.id).join(', ') || 'TBD'}

### Verify
\`\`\`bash
mvn test -DsuiteXmlFile=src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml
\`\`\``,
    },
    cursor: [
      {
        id: 'cursor-1',
        category: 'code',
        title: 'Update impacted Java Playwright tests',
        description: 'Use Cursor Agent with JetBrains MCP to update test files and page objects.',
        mcpTools: ['filesystem', 'jetbrains', 'terminal'],
        targetFiles: testFiles.slice(0, 2).map((t) => t.file),
        status: 'ready',
        cursorPrompt: `In galaxy-automation repo, update tests for Jira tickets: ${jiraRef}
1. Fix locators in impacted page objects
2. Update @TestRailCases mappings: ${testCases.map((c) => c.id).join(', ')}
3. Follow @Test(groups = {"Sanity","Admin"}) patterns`,
      },
      {
        id: 'cursor-2',
        category: 'run',
        title: 'Run Admin Sanity suite via Maven',
        description: 'Execute tests through Cursor terminal MCP against PRESTAGE.',
        mcpTools: ['terminal', 'jetbrains'],
        targetFiles: ['src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml'],
        status: 'pending',
        cursorPrompt: `Run in galaxy-automation:
mvn test -DsuiteXmlFile=src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml

Environment: ${config.automation.environment}. Fix failures and re-run.`,
      },
    ],
    testRail: gaps.missingScenarios.slice(0, 3).map((scenario, index) => ({
      id: `tr-action-${index + 1}`,
      action: 'create',
      title: scenario,
      suite: 'Admin Theme & Branding',
      steps: [
        'Navigate to impacted admin feature',
        `Validate: ${scenario}`,
        'Verify expected outcome',
      ],
      status: 'ready',
      cursorPrompt: `Using TestRail MCP (project ${config.testRail.projectId}), create test case:
Title: ${scenario}
Suite: Admin Theme & Branding
Link to Jira: ${jiraRef}`,
    })),
  }
}

export function mapTicketImpact(tickets, testCases, automationTests) {
  return tickets.map((ticket) => {
    const ticketKeywords = [
      ...ticket.modules,
      ...(ticket.keywords || []),
      ...ticket.title.toLowerCase().split(/\W+/),
    ].map((k) => k.toLowerCase())

    const relatedTests = automationTests.filter((test) =>
      ticketKeywords.some(
        (kw) =>
          kw.length > 3 &&
          (test.testClass.toLowerCase().includes(kw) ||
            test.file.toLowerCase().includes(kw)),
      ),
    )

    const relatedCaseIds = new Set()
    relatedTests.forEach((t) => t.testRailIds.forEach((id) => relatedCaseIds.add(`C${id}`)))

    testCases.forEach((c) => {
      if (ticketKeywords.some((kw) => kw.length > 3 && c.title.toLowerCase().includes(kw))) {
        relatedCaseIds.add(c.id)
      }
    })

    if (ticket.impactedTestCases?.length) {
      ticket.impactedTestCases.forEach((id) => relatedCaseIds.add(id))
    }

    return {
      ...ticket,
      impactedTestCases: [...relatedCaseIds],
      impactedAutomation: relatedTests.flatMap((t) =>
        t.testMethods.slice(0, 2).map((m) => `${t.testClass}.${m}`),
      ),
    }
  })
}
