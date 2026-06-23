export function isValidAcceptanceCriterion(text: string): boolean {
  const t = text.trim()
  if (t.length < 15) return false
  if (/^cc:\s*/i.test(t)) return false
  if (/^(fyi|note|thanks|regards|please see|see below)/i.test(t)) return false
  if (/^\[~[\w]+\]/i.test(t)) return false
  if (
    (t.match(/\[~[\w]+\]/g) || []).length >= 1 &&
    !/\b(verify|should|must|able to|ensure|when|then)\b/i.test(t)
  ) {
    return false
  }
  if (/^verify acceptance criteria:/i.test(t)) return false
  return true
}

export function filterAcceptanceCriteria(criteria: string[] = []): string[] {
  return criteria.filter(isValidAcceptanceCriterion)
}

export function normalizeScenarioTitle(title: string): string {
  return title
    .replace(/^verify:\s*/i, '')
    .replace(/^verify acceptance criteria:\s*/i, '')
    .replace(/^test coverage for\s+[A-Z]+-\d+:\s*/i, '')
    .replace(/^[A-Z]+-\d+:\s*/i, '')
    .trim()
    .toLowerCase()
}

export function dedupeScenarios(scenarios: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const scenario of scenarios) {
    const norm = normalizeScenarioTitle(scenario)
    if (!norm || norm.length < 10 || seen.has(norm)) continue
    seen.add(norm)
    result.push(scenario.trim())
  }

  return result
}

export function scenarioActionId(scenario: string): string {
  const slug = normalizeScenarioTitle(scenario)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return `tr-${slug || 'action'}`
}

export function buildScenarioCandidates(input: {
  gaps: { missingScenarios: string[]; edgeCases: string[] }
  tickets: { key: string; title: string; acceptanceCriteria: string[] }[]
  jiraRef: string
}): string[] {
  const scenarios = [...input.gaps.missingScenarios, ...input.gaps.edgeCases.slice(0, 2)]

  if (input.tickets.length > 0 && scenarios.length < 3) {
    const ticket = input.tickets[0]
    scenarios.push(`${ticket.key}: ${ticket.title}`)
  }

  for (const ticket of input.tickets) {
    for (const ac of ticket.acceptanceCriteria || []) {
      if (!isValidAcceptanceCriterion(ac)) continue
      scenarios.push(/^verify\b/i.test(ac) ? ac : `Verify ${ac}`)
    }
  }

  if (scenarios.length === 0) {
    scenarios.push(`Regression coverage for ${input.jiraRef}`)
  }

  return dedupeScenarios(scenarios).slice(0, 3)
}
