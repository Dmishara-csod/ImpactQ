import { config, cursorConfigured } from '../config.js'
import { filterAcceptanceCriteria } from '../utils/testScenarioUtils.js'

export function cursorMcpConfigured() {
  return true
}

export function getCursorMcpStatus() {
  return {
    mode: 'cursor-mcp',
    mcpConfigPath: config.cursor.mcpConfigPath,
    cursorApiKey: cursorConfigured(),
    servers: ['jetbrains', 'playwright', 'testrail'],
    hint: 'Run gap analysis prompts in Cursor using MCP tools — no OpenAI key required',
  }
}

function ruleBasedGaps(tickets, testCases, automationTests) {
  const hasBanner = tickets.some((t) => t.title.toLowerCase().includes('banner'))
  const hasLogo = tickets.some((t) => t.title.toLowerCase().includes('logo'))
  const hasTheme = tickets.some((t) => t.title.toLowerCase().includes('theme'))

  const missingScenarios = []
  const missingAutomation = []
  const edgeCases = []

  if (hasBanner) {
    missingScenarios.push('Profile banner upload failure recovery')
    missingAutomation.push('Visual regression for profile banner after theme switch')
  }
  if (hasLogo) {
    missingScenarios.push('Reject unsupported header logo file format')
    edgeCases.push('Header logo cache invalidation after branding update')
  }
  if (hasTheme) {
    missingScenarios.push('Theme preview across mobile and desktop breakpoints')
    edgeCases.push('Concurrent admin edits to theme and branding settings')
  }

  const hasSearch = tickets.some((t) => /search|find|lookup/i.test(t.title + t.description))
  const hasChannel = tickets.some((t) => /channel|carousel|feed|content/i.test(t.title + t.description))

  if (hasSearch) {
    missingScenarios.push('Search returns expected results for newly shared content')
    edgeCases.push('Search index lag after content is published to channel')
  }
  if (hasChannel) {
    missingScenarios.push('Channel carousel displays and navigates shared content correctly')
    edgeCases.push('Empty channel state and pagination edge cases')
  }

  for (const ticket of tickets) {
    for (const ac of filterAcceptanceCriteria(ticket.acceptanceCriteria || []).slice(0, 2)) {
      const scenario = `Verify ${ac}`
      if (!missingScenarios.some((s) => s.toLowerCase().includes(ac.slice(0, 24).toLowerCase()))) {
        missingScenarios.push(scenario)
      }
    }
  }

  if (missingScenarios.length === 0 && tickets.length > 0) {
    missingScenarios.push(
      `End-to-end regression coverage for ${tickets.map((t) => t.key).join(', ')}`,
    )
  }
  if (automationTests.filter((t) => t.groups?.includes('Regression')).length === 0) {
    missingAutomation.push('Regression automation for impacted admin flows')
  }

  return {
    missingScenarios: missingScenarios.slice(0, 5),
    missingAutomation: missingAutomation.slice(0, 4),
    edgeCases: edgeCases.slice(0, 4),
  }
}

export function buildGapAnalysisMcpPrompt({ ticketKeys, tickets, testCases, automation, gaps }) {
  const jiraRef = ticketKeys.join(', ')
  const testRailIds = testCases.map((c) => c.id).join(', ') || 'TBD'
  const automationFiles = automation.tests
    .filter((t) => t.file.includes('Test.java'))
    .map((t) => t.file)
    .slice(0, 5)
    .join('\n- ')

  return `You are ImpactIQ QA Copilot running inside Cursor with MCP tools.

## Goal
Analyze test coverage gaps for Jira tickets: ${jiraRef}

## Use MCP tools
1. **Jira** — Re-read ticket acceptance criteria and linked requirements for: ${jiraRef}
2. **TestRail MCP** — Fetch cases ${testRailIds} and search project ${config.testRail.projectId} for related coverage
3. **JetBrains MCP** — Inspect automation repo at ${config.automation.repoPath}:
- ${automationFiles || 'AdminThemeAndBrandingTest.java'}
4. **Playwright MCP** — Identify UI flows needing manual or automated validation

## Current rule-based gaps (validate and extend)
Missing scenarios: ${gaps.missingScenarios.join('; ') || 'none'}
Missing automation: ${gaps.missingAutomation.join('; ') || 'none'}
Edge cases: ${gaps.edgeCases.join('; ') || 'none'}

## Output
Return JSON:
{
  "missingScenarios": ["..."],
  "missingAutomation": ["..."],
  "edgeCases": ["..."],
  "recommendations": ["..."],
  "testRailActions": [{ "title": "...", "steps": ["..."] }]
}`
}

export function buildCursorMcpGapAction(context) {
  return {
    id: 'cursor-gap-analysis',
    category: 'code',
    title: 'Run AI gap analysis via Cursor MCP',
    description:
      'Paste this prompt in Cursor Agent. Uses Jira + TestRail + JetBrains + Playwright MCP instead of OpenAI.',
    mcpTools: ['testrail', 'jetbrains', 'playwright'],
    targetFiles: context.automation.tests
      .filter((t) => t.file.includes('Test.java'))
      .slice(0, 3)
      .map((t) => t.file),
    status: 'ready',
    cursorPrompt: buildGapAnalysisMcpPrompt(context),
  }
}

export async function detectCoverageGaps(tickets, testCases, automationTests, context = {}) {
  return ruleBasedGaps(tickets, testCases, automationTests)
}

export async function generateRecommendations(tickets, gaps, risk) {
  const base = [
    'Run Admin_Sanity_Test_Suite.xml on PRESTAGE before merge',
    `Review ${tickets.length} Jira ticket(s) and linked TestRail cases`,
    'Use Cursor MCP gap analysis prompt on Actions page for deeper AI review',
    'Update impacted Java Playwright tests in galaxy-automation',
  ]

  if (gaps.missingScenarios.length > 0) {
    base.push(`Add ${gaps.missingScenarios.length} new TestRail cases for identified gaps`)
  }
  if (risk.level === 'HIGH') {
    base.push('Escalate to QA lead — high release risk detected')
  }

  return base.slice(0, 6)
}
