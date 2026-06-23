import { config } from '../config.js'
import { matchImpactedCasesForScenario } from './testRailService.js'
import {
  buildScenarioCandidates,
  filterAcceptanceCriteria,
  scenarioActionId,
} from '../utils/testScenarioUtils.js'

function pickSuite(testCases) {
  return testCases[0]?.suite || 'Picasso Admin Regression'
}

function buildTestRailActions({ ticketKeys, tickets, testCases, gaps, projectId, jiraRef }) {
  const uniqueScenarios = buildScenarioCandidates({ gaps, tickets, jiraRef })
  const suite = pickSuite(testCases)

  return uniqueScenarios.map((scenario) => {
    const ticketContext = tickets
      .map((t) => `${t.key}: ${t.title}`)
      .slice(0, 3)
      .join('; ')
    const validAc = tickets.flatMap((t) => filterAcceptanceCriteria(t.acceptanceCriteria || [])).slice(0, 2)
    const impactedCases = matchImpactedCasesForScenario(scenario, testCases)

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
      jiraKeys: ticketKeys,
      impactedCases,
      cursorPrompt: `Using TestRail MCP (project ${projectId}), create test case:
Title: ${scenario}
Suite: ${suite}
Link to Jira: ${jiraRef}
Related tickets: ${ticketContext}

Impacted existing cases: ${impactedCases.map((c) => c.id).join(', ') || 'none'}

After creating the case, map it with @TestRailCases in the impacted automation test class.`,
    }
  })
}

export function buildActionPlan({ ticketKeys, tickets, testCases, automation, gaps, settings = {}, cursorGapAction }) {
  const environment = settings.environment || config.automation.environment
  const projectId = settings.testRailProjectId || config.testRail.projectId
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
      ...(cursorGapAction ? [cursorGapAction] : []),
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

Environment: ${environment}. Fix failures and re-run.`,
      },
    ],
    testRail: buildTestRailActions({
      ticketKeys,
      tickets,
      testCases,
      gaps,
      projectId,
      jiraRef,
    }),
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
      (ticket.impactedAutomation || []).some((entry) => entry.startsWith(`${test.testClass}.`)),
    )

    const relatedCaseIds = new Set(ticket.impactedTestCases || [])

    for (const test of relatedTests) {
      const methodNames = (ticket.impactedAutomation || [])
        .filter((entry) => entry.startsWith(`${test.testClass}.`))
        .map((entry) => entry.slice(test.testClass.length + 1))

      for (const methodName of methodNames) {
        const method = test.methods?.find((m) => m.name === methodName)
        if (method) {
          method.testRailIds.forEach((id) => relatedCaseIds.add(`C${id}`))
        }
      }
    }

    testCases.forEach((c) => {
      const titleMatch = ticketKeywords.some(
        (kw) => kw.length > 3 && c.title.toLowerCase().includes(kw),
      )
      if (titleMatch) relatedCaseIds.add(c.id)
    })

    const matchedAutomation = automationTests.filter((test) =>
      ticketKeywords.some(
        (kw) =>
          kw.length > 3 &&
          (test.testClass.toLowerCase().includes(kw) ||
            test.file.toLowerCase().includes(kw) ||
            test.testMethods.some((m) => m.toLowerCase().includes(kw))),
      ),
    )

    for (const test of matchedAutomation) {
      test.testRailIds.forEach((id) => relatedCaseIds.add(`C${id}`))
    }

    const automationNames = [
      ...(ticket.impactedAutomation || []),
      ...matchedAutomation.flatMap((t) =>
        t.testMethods.slice(0, 2).map((m) => `${t.testClass}.${m}`),
      ),
    ]

    return {
      ...ticket,
      impactedTestCases: [...relatedCaseIds],
      impactedAutomation: [...new Set(automationNames)],
    }
  })
}
