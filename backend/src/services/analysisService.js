import crypto from 'crypto'

import { AnalysisModel } from '../models/Analysis.js'
import { config } from '../config.js'
import { buildActionPlan, mapTicketImpact } from './actionPlanService.js'
import { getJiraTickets, getTicketKeywords } from './jiraService.js'
import { scanAutomationRepo } from './automationScanner.js'
import { resolveTestCases } from './testRailService.js'
import { detectCoverageGaps, generateRecommendations, buildCursorMcpGapAction } from './cursorMcpAnalysisService.js'

function collectAutomationCaseIds(tickets, automationTests) {
  const catalogLinks = tickets.flatMap((t) =>
    (t.impactedAutomation || []).map((entry) => {
      const [className, ...rest] = entry.split('.')
      return { className, methodName: rest.join('.') }
    }),
  )

  if (catalogLinks.length === 0) {
    return automationTests.slice(0, 3).flatMap((t) => t.testRailIds)
  }

  const ids = []
  for (const test of automationTests) {
    for (const link of catalogLinks) {
      if (test.testClass !== link.className) continue
      const method = test.methods?.find((m) => m.name === link.methodName)
      if (method) {
        ids.push(...method.testRailIds)
      }
    }
  }

  return ids
}

function unique(items) {
  return [...new Set(items)]
}

function computeRisk(ticketCount, moduleCount, gapCount) {
  const score = Math.min(95, 50 + ticketCount * 8 + moduleCount * 5 + gapCount * 3)
  const level = score >= 75 ? 'HIGH' : score >= 55 ? 'MEDIUM' : 'LOW'
  return { score, level }
}

export async function runAnalysis({ ticketKeys, settings = {} }) {
  const keys = ticketKeys?.length ? ticketKeys : ['GALXY-482']
  const repoPath = settings.automationPath || config.automation.repoPath
  const environment = settings.environment || config.automation.environment
  const projectId = settings.testRailProjectId || config.testRail.projectId

  let tickets = await getJiraTickets(keys)
  const keywords = getTicketKeywords(tickets)

  const automationScan = await scanAutomationRepo(keywords, { repoPath, environment })
  const caseIds = unique([
    ...collectAutomationCaseIds(tickets, automationScan.tests),
    ...tickets.flatMap((t) =>
      (t.impactedTestCases || []).map((id) => id.replace(/^C/i, '')),
    ),
  ])

  const testCases = await resolveTestCases(caseIds, keywords, { projectId })
  const testFiles = automationScan.tests.filter((t) => t.file.includes('Test.java'))

  tickets = mapTicketImpact(tickets, testCases, testFiles)

  const allModules = unique(tickets.flatMap((t) => t.modules))
  const gaps = await detectCoverageGaps(tickets, testCases, testFiles)
  const gapCount =
    gaps.missingScenarios.length + gaps.missingAutomation.length + gaps.edgeCases.length

  const { score, level } = computeRisk(keys.length, allModules.length, gapCount)
  const jiraSource = config.jira.apiToken ? 'api' : 'mock-catalog'
  const risk = {
    score,
    level,
    factors: [
      `${keys.length} Jira ticket${keys.length > 1 ? 's' : ''} analyzed (${jiraSource})`,
      `${allModules.length} modules impacted (${allModules.join(', ')})`,
      `${testCases.length} TestRail cases linked`,
      `${testFiles.length} automation test classes matched`,
      gapCount > 0 ? `${gapCount} coverage gaps identified` : 'No major coverage gaps',
    ],
  }

  const recommendations = await generateRecommendations(tickets, gaps, risk)
  const actionPlan = buildActionPlan({
    ticketKeys: keys,
    tickets,
    testCases,
    automation: automationScan,
    gaps,
    settings: { environment, testRailProjectId: projectId },
    cursorGapAction: buildCursorMcpGapAction({
      ticketKeys: keys,
      tickets,
      testCases,
      automation: automationScan,
      gaps,
    }),
  })

  const analysis = {
    id: crypto.randomUUID(),
    inputType: 'jira',
    inputValue: keys.join(', '),
    ticketKeys: keys,
    tickets,
    changeSummary: {
      title:
        keys.length === 1
          ? tickets[0].title
          : `Combined impact — ${keys.length} Jira stories`,
      description:
        keys.length === 1
          ? tickets[0].description
          : `Impact analysis across ${keys.join(', ')} covering ${allModules.join(', ')}.`,
      modules: allModules,
      businessCapability: 'Portal configuration and white-label branding',
      functionalAreas: unique(
        tickets.flatMap((t) => t.labels).concat(['Admin configuration', 'Test impact analysis']),
      ).slice(0, 6),
    },
    meta: {
      dataSources: {
        jira: jiraSource,
        testRail: testCases.some((c) => !c.title.startsWith('TestRail case C'))
          ? 'api'
          : 'fallback-ids',
        automation: automationScan.tests.length > 0 ? 'repo-scan' : 'none',
        analysis: 'cursor-mcp',
      },
      analyzedAt: new Date().toISOString(),
    },
    codeImpact: automationScan.codeImpact,
    testRail: {
      projectId,
      suiteName: 'Picasso Admin Regression',
      testCases,
    },
    automation: {
      repo: automationScan.repo,
      framework: automationScan.framework,
      testNgSuite: automationScan.testNgSuite,
      environment,
      repoPath,
      tests: automationScan.tests,
    },
    coverageGaps: gaps,
    risk,
    recommendations,
    actionPlan,
  }

  try {
    if (AnalysisModel.db?.readyState === 1) {
      await AnalysisModel.create({
        inputType: analysis.inputType,
        inputValue: analysis.inputValue,
        ticketKeys: keys,
        payload: analysis,
      })
    }
  } catch (err) {
    console.warn('[db] Failed to save analysis:', err.message)
  }

  return analysis
}

export async function getAnalysisById(id) {
  if (AnalysisModel.db?.readyState !== 1) return null
  const doc = await AnalysisModel.findOne({ 'payload.id': id })
  return doc?.payload ?? null
}

export async function listAnalyses(limit = 20) {
  if (AnalysisModel.db?.readyState !== 1) return []
  const docs = await AnalysisModel.find().sort({ createdAt: -1 }).limit(limit)
  return docs.map((d) => d.payload)
}

export async function listAnalysisSummaries(limit = 20) {
  const analyses = await listAnalyses(limit)
  return analyses.map((a) => ({
    id: a.id,
    inputValue: a.inputValue,
    title: a.changeSummary?.title ?? a.inputValue,
    riskLevel: a.risk?.level ?? 'MEDIUM',
    riskScore: a.risk?.score ?? 0,
    analyzedAt: a.meta?.analyzedAt ?? new Date().toISOString(),
    ticketKeys: a.ticketKeys ?? [],
  }))
}
