export function isValidAcceptanceCriterion(text) {
  const t = String(text || '').trim()
  if (t.length < 15) return false
  if (/^cc:\s*/i.test(t)) return false
  if (/^(fyi|note|thanks|regards|please see|see below)/i.test(t)) return false
  if (/^\[~[\w]+\]/i.test(t)) return false
  if ((t.match(/\[~[\w]+\]/g) || []).length >= 1 && !/\b(verify|should|must|able to|ensure|when|then)\b/i.test(t)) {
    return false
  }
  if (/^verify acceptance criteria:/i.test(t)) return false
  return true
}

export function normalizeScenarioTitle(title) {
  return String(title || '')
    .replace(/^verify:\s*/i, '')
    .replace(/^verify acceptance criteria:\s*/i, '')
    .replace(/^test coverage for\s+[A-Z]+-\d+:\s*/i, '')
    .replace(/^[A-Z]+-\d+:\s*/i, '')
    .trim()
    .toLowerCase()
}

export function dedupeScenarios(scenarios) {
  const seen = new Set()
  const result = []

  for (const scenario of scenarios) {
    const norm = normalizeScenarioTitle(scenario)
    if (!norm || norm.length < 10 || seen.has(norm)) continue
    seen.add(norm)
    result.push(scenario.trim())
  }

  return result
}

export function scenarioActionId(scenario) {
  const slug = normalizeScenarioTitle(scenario)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return `tr-${slug || 'action'}`
}

export function buildScenarioCandidates({ gaps, tickets, jiraRef }) {
  const scenarios = [...(gaps?.missingScenarios || []), ...(gaps?.edgeCases || []).slice(0, 2)]

  if (tickets.length > 0 && scenarios.length < 3) {
    const ticket = tickets[0]
    scenarios.push(`${ticket.key}: ${ticket.title}`)
  }

  for (const ticket of tickets) {
    for (const ac of ticket.acceptanceCriteria || []) {
      if (!isValidAcceptanceCriterion(ac)) continue
      const line = /^verify\b/i.test(ac) ? ac : `Verify ${ac}`
      scenarios.push(line)
    }
  }

  if (scenarios.length === 0) {
    scenarios.push(`Regression coverage for ${jiraRef}`)
  }

  return dedupeScenarios(scenarios).slice(0, 3)
}

export function filterAcceptanceCriteria(criteria = []) {
  return criteria.filter(isValidAcceptanceCriterion)
}
