import type { ImpactAnalysis } from '@/types/analysis'
import type { AffectedCase, CaseImpactStatus, LinkedJiraTicket } from '@/types/affectedCase'

function normalizeCaseId(id: string): string {
  return id.replace(/^C/i, '')
}

function keywordOverlap(gapText: string, caseTitle: string): boolean {
  const words = gapText
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4)
  const haystack = caseTitle.toLowerCase()
  return words.some((w) => haystack.includes(w))
}

function resolveAutomationMapping(analysis: ImpactAnalysis, caseId: string) {
  const numericId = normalizeCaseId(caseId)
  for (const test of analysis.automation.tests) {
    if (test.testRailIds.some((rid) => normalizeCaseId(String(rid)) === numericId)) {
      return {
        hasAutomation: true,
        automationFile: test.file,
        automationMethod: test.testMethods[0],
      }
    }
  }
  return {
    hasAutomation: false,
    automationFile: undefined,
    automationMethod: undefined,
  }
}

function getLinkedTickets(analysis: ImpactAnalysis, caseId: string): LinkedJiraTicket[] {
  return analysis.tickets
    .filter((ticket) => ticket.impactedTestCases.includes(caseId))
    .map((ticket) => ({
      key: ticket.key,
      status: ticket.status,
      summary: ticket.title,
      url: ticket.url,
    }))
}

function analysisTimestamp(analysis: ImpactAnalysis): string | undefined {
  return analysis.meta?.analyzedAt
}

function latestTicketUpdate(linkedTickets: LinkedJiraTicket[], analysis: ImpactAnalysis): string | undefined {
  if (linkedTickets.length === 0) return analysisTimestamp(analysis)

  const dates = analysis.tickets
    .filter((t) => linkedTickets.some((lt) => lt.key === t.key))
    .map((t) => t.updated)
    .filter(Boolean)

  if (dates.length === 0) return analysisTimestamp(analysis)
  return dates.sort().reverse()[0]
}

function matchesAnyGap(analysis: ImpactAnalysis, caseTitle: string): boolean {
  const { missingScenarios, missingAutomation, edgeCases } = analysis.coverageGaps
  return (
    missingScenarios.some((g) => keywordOverlap(g, caseTitle)) ||
    missingAutomation.some((g) => keywordOverlap(g, caseTitle)) ||
    edgeCases.some((g) => keywordOverlap(g, caseTitle))
  )
}

function deriveImpactStatus(
  analysis: ImpactAnalysis,
  caseTitle: string,
  linkedTickets: LinkedJiraTicket[],
  hasAutomation: boolean,
  isProposedCase = false,
): { status: CaseImpactStatus; statusReason: string } {
  if (isProposedCase) {
    return {
      status: 'coverage_gap',
      statusReason: 'Identified by gap analysis — no TestRail case exists yet',
    }
  }

  const linked = linkedTickets.length > 0
  const gapMatch = matchesAnyGap(analysis, caseTitle)

  if (linked && hasAutomation) {
    return {
      status: 'update_automation',
      statusReason: gapMatch
        ? 'Java Playwright test mapped — update locators and assertions for this change'
        : 'Automation linked to changing Jira story — review and update test code',
    }
  }

  if (linked && !hasAutomation) {
    return {
      status: 'manual_review',
      statusReason: 'Linked to Jira but no @TestRailCases automation — run manually before release',
    }
  }

  if (gapMatch) {
    return {
      status: 'coverage_gap',
      statusReason: 'Gap analysis flagged this area — confirm TestRail coverage is sufficient',
    }
  }

  if (hasAutomation) {
    return {
      status: 'covered',
      statusReason: 'Automation mapped and no open gaps — spot-check still recommended',
    }
  }

  return {
    status: 'manual_review',
    statusReason: 'Found via keyword match — manual review recommended',
  }
}

function buildProposedGapCases(analysis: ImpactAnalysis): AffectedCase[] {
  const existingTitles = analysis.testRail.testCases.map((c) => c.title.toLowerCase())

  return analysis.coverageGaps.missingScenarios
    .filter((scenario) => !existingTitles.some((t) => keywordOverlap(scenario, t)))
    .map((scenario, index) => {
      const { status, statusReason } = deriveImpactStatus(
        analysis,
        scenario,
        [],
        false,
        true,
      )

      return {
        id: `NEW-${index + 1}`,
        name: scenario,
        suite: analysis.testRail.suiteName,
        url: '#',
        status,
        statusReason,
        lastUpdated: analysisTimestamp(analysis),
        linkedTickets: [],
        hasAutomation: false,
        automationFile: undefined,
        automationMethod: undefined,
      }
    })
}

function expandCases(cases: AffectedCase[], minCount: number, analysis: ImpactAnalysis): AffectedCase[] {
  if (cases.length >= minCount) return cases

  const expanded = [...cases]
  let i = 0

  while (expanded.length < minCount) {
    const source = cases[i % cases.length]
    const suffix = expanded.length + 1
    const variantId = `${source.id}-v${suffix}`
    const linkedTickets =
      suffix % 3 === 0 ? [] : source.linkedTickets
    const hasAutomation = suffix % 4 !== 0 && source.hasAutomation

    const { status, statusReason } = deriveImpactStatus(
      analysis,
      `${source.name} extended scenario ${suffix}`,
      linkedTickets,
      hasAutomation,
    )

    expanded.push({
      ...source,
      id: variantId,
      name: `${source.name} (related ${suffix})`,
      status,
      statusReason,
      linkedTickets,
      hasAutomation,
      automationFile: hasAutomation ? source.automationFile : undefined,
      automationMethod: hasAutomation ? source.automationMethod : undefined,
    })
    i += 1
  }

  return expanded
}

export function buildAffectedCases(
  analysis: ImpactAnalysis,
  options?: { expandTo?: number },
): AffectedCase[] {
  const testRailCases = analysis.testRail.testCases.map((testCase) => {
    const linkedTickets = getLinkedTickets(analysis, testCase.id)
    const automation = resolveAutomationMapping(analysis, testCase.id)
    const { status, statusReason } = deriveImpactStatus(
      analysis,
      testCase.title,
      linkedTickets,
      automation.hasAutomation,
    )

    return {
      id: testCase.id,
      name: testCase.title,
      suite: testCase.suite,
      url: testCase.url,
      status,
      statusReason,
      lastUpdated: latestTicketUpdate(linkedTickets, analysis),
      linkedTickets,
      ...automation,
    }
  })

  const proposedCases = buildProposedGapCases(analysis)
  const merged = [...testRailCases, ...proposedCases]

  if (options?.expandTo && options.expandTo > merged.length) {
    return expandCases(merged, options.expandTo, analysis)
  }

  return merged
}
