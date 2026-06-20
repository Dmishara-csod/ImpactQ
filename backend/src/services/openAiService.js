import OpenAI from 'openai'

import { config } from '../config.js'

let client = null

function getClient() {
  if (!config.openAiKey) return null
  if (!client) client = new OpenAI({ apiKey: config.openAiKey })
  return client
}

export function openAiConfigured() {
  return Boolean(config.openAiKey)
}

export async function detectCoverageGaps(tickets, testCases, automationTests) {
  const openai = getClient()

  const context = {
    tickets: tickets.map((t) => ({
      key: t.key,
      title: t.title,
      acceptanceCriteria: t.acceptanceCriteria,
    })),
    testRailCount: testCases.length,
    testRailTitles: testCases.map((c) => c.title),
    automation: automationTests.map((a) => a.testClass),
  }

  if (!openai) {
    return ruleBasedGaps(tickets, testCases, automationTests)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a QA impact analyst. Return JSON with keys: missingScenarios (string[]), missingAutomation (string[]), edgeCases (string[]). Be specific to Galaxy admin theme/branding testing.',
        },
        {
          role: 'user',
          content: `Analyze coverage gaps:\n${JSON.stringify(context, null, 2)}`,
        },
      ],
      temperature: 0.3,
    })

    const parsed = JSON.parse(response.choices[0].message.content)
    return {
      missingScenarios: parsed.missingScenarios ?? [],
      missingAutomation: parsed.missingAutomation ?? [],
      edgeCases: parsed.edgeCases ?? [],
    }
  } catch (err) {
    console.warn('[openai] gap detection failed:', err.message)
    return ruleBasedGaps(tickets, testCases, automationTests)
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

  if (testCases.length < tickets.length * 2) {
    missingScenarios.push('Additional TestRail coverage needed for submitted stories')
  }
  if (automationTests.filter((t) => t.groups.includes('Regression')).length === 0) {
    missingAutomation.push('Regression automation for impacted admin flows')
  }

  return {
    missingScenarios: missingScenarios.slice(0, 5),
    missingAutomation: missingAutomation.slice(0, 4),
    edgeCases: edgeCases.slice(0, 4),
  }
}

export async function generateRecommendations(tickets, gaps, risk) {
  const openai = getClient()
  const base = [
    'Run Admin_Sanity_Test_Suite.xml on PRESTAGE before merge',
    `Review ${tickets.length} Jira ticket(s) and linked TestRail cases`,
    'Update AdminThemeAndBrandingTest.java for impacted stories',
  ]

  if (!openai) {
    if (gaps.missingScenarios.length > 0) {
      base.push(`Add ${gaps.missingScenarios.length} new TestRail cases for identified gaps`)
    }
    if (risk.level === 'HIGH') {
      base.push('Escalate to QA lead — high release risk detected')
    }
    return base
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Return a JSON object with key recommendations as an array of 4-6 actionable QA strings.',
        },
        {
          role: 'user',
          content: JSON.stringify({ tickets: tickets.map((t) => t.key), gaps, risk }),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const parsed = JSON.parse(response.choices[0].message.content)
    return parsed.recommendations ?? base
  } catch {
    return base
  }
}
