import { config, testRailConfigured } from '../config.js'
import { getSettings } from './settingsStore.js'

function authHeader(user = config.testRail.user, apiKey = config.testRail.apiKey, withJson = false) {
  const credentials = Buffer.from(`${user}:${apiKey}`).toString('base64')
  const headers = { Authorization: `Basic ${credentials}` }
  if (withJson) headers['Content-Type'] = 'application/json'
  return headers
}

async function testRailFetch(path, options = {}) {
  const url = `${options.url || config.testRail.url}/index.php?/api/v2/${path}`
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: authHeader(options.user, options.apiKey, Boolean(options.body)),
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`TestRail API error ${response.status}: ${text.slice(0, 200)}`)
  }

  return response.json()
}

function formatCase(testCase, suiteName = 'Picasso Admin Regression') {
  const numericId = String(testCase.id)
  return {
    id: `C${numericId}`,
    title: testCase.title,
    suite: suiteName,
    url: `${config.testRail.url}/index.php?/cases/view/${numericId}`,
    numericId,
  }
}

function normalizeCasesResponse(data) {
  if (Array.isArray(data)) return data
  if (data?.cases && Array.isArray(data.cases)) return data.cases
  return []
}

export function buildFallbackCases(caseIds) {
  const uniqueIds = [...new Set(caseIds.map((id) => String(id).replace(/^C/i, '')))]
  return uniqueIds.map((id) => ({
    id: `C${id}`,
    title: `TestRail case C${id}`,
    suite: 'Picasso Admin Regression',
    url: `${config.testRail.url}/index.php?/cases/view/${id}`,
  }))
}

export async function getTestCasesByIds(caseIds) {
  if (!testRailConfigured() || caseIds.length === 0) return []

  const results = await Promise.allSettled(
    caseIds.map((id) => testRailFetch(`get_case/${id}`)),
  )

  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => formatCase(r.value))
}

function normalizeSuitesResponse(data) {
  if (Array.isArray(data)) return data
  if (data?.suites && Array.isArray(data.suites)) return data.suites
  return []
}

async function getProjectSuites(projectId) {
  const data = await testRailFetch(`get_suites/${projectId}`)
  return normalizeSuitesResponse(data)
}

async function getSuiteCases(projectId, suiteId, limit = 100) {
  const data = await testRailFetch(`get_cases/${projectId}&suite_id=${suiteId}&limit=${limit}`)
  return normalizeCasesResponse(data)
}

function scoreCaseMatch(testCase, keywords, suiteName) {
  const haystack = `${testCase.title} ${testCase.custom_preconds || ''} ${testCase.custom_steps || ''} ${suiteName}`.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (kw.length > 3 && haystack.includes(kw)) score += 1
  }
  return score
}

export async function searchProjectCases(keywords, options = {}) {
  if (!testRailConfigured()) return []

  const projectId = options.projectId || config.testRail.projectId
  const limit = options.limit ?? 15
  const maxSuites = options.maxSuites ?? 4
  const lowerKeywords = keywords.map((k) => k.toLowerCase()).filter((k) => k.length > 3)

  if (lowerKeywords.length === 0) return []

  try {
    const suites = (await getProjectSuites(projectId)).slice(0, maxSuites)
    const scored = []

    for (const suite of suites) {
      let cases = []
      try {
        cases = await getSuiteCases(projectId, suite.id)
      } catch (err) {
        console.warn(`[testrail] suite ${suite.id} cases failed:`, err.message)
        continue
      }

      for (const testCase of cases) {
        const score = scoreCaseMatch(testCase, lowerKeywords, suite.name)
        if (score > 0) {
          scored.push({ testCase, suiteName: suite.name, score })
        }
      }

      if (scored.length >= limit) break
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ testCase, suiteName }) => formatCase(testCase, suiteName))
  } catch (err) {
    console.warn('[testrail] search failed:', err.message)
    return []
  }
}

export async function resolveTestCases(caseIdsFromAutomation, keywords, options = {}) {
  const uniqueIds = [...new Set(caseIdsFromAutomation.map((id) => String(id).replace(/^C/i, '')))]

  if (!testRailConfigured()) {
    return buildFallbackCases(uniqueIds)
  }

  const byId = await getTestCasesByIds(uniqueIds)
  const minLinkedCases = options.minLinkedCases ?? 3
  const shouldSearch =
    byId.length < minLinkedCases &&
    keywords.length > 0 &&
    options.skipSearch !== true

  const bySearch = shouldSearch
    ? await searchProjectCases(keywords, {
        projectId: options.projectId,
        limit: options.searchLimit ?? 15,
        maxSuites: options.maxSuites ?? 4,
      })
    : []

  const seen = new Set(byId.map((c) => c.numericId))
  const merged = [...byId]

  for (const c of bySearch) {
    if (!seen.has(c.numericId)) {
      seen.add(c.numericId)
      merged.push(c)
    }
  }

  if (merged.length === 0 && uniqueIds.length > 0) {
    return buildFallbackCases(uniqueIds)
  }

  return merged.map(({ numericId, ...rest }) => rest)
}

export function getTestRailStatus() {
  const stored = getSettings()
  return {
    configured: testRailConfigured(),
    url: config.testRail.url,
    projectId: stored.testRailProjectId || config.testRail.projectId,
  }
}

function normalizeSectionsResponse(data) {
  if (Array.isArray(data)) return data
  if (data?.sections && Array.isArray(data.sections)) return data.sections
  return []
}

async function findSuite(projectId, suiteName) {
  const suites = await getProjectSuites(projectId)
  const target = suiteName.toLowerCase()
  return (
    suites.find((s) => s.name.toLowerCase() === target) ||
    suites.find((s) => s.name.toLowerCase().includes(target) || target.includes(s.name.toLowerCase())) ||
    suites[0]
  )
}

async function findSectionId(projectId, suiteId) {
  const data = await testRailFetch(`get_sections/${projectId}&suite_id=${suiteId}`)
  const sections = normalizeSectionsResponse(data)
  return sections[0]?.id
}

const REFERENCE_CASE_ID = '29925265'

async function getCaseCreateDefaults() {
  try {
    const ref = await testRailFetch(`get_case/${REFERENCE_CASE_ID}`)
    const defaults = {
      template_id: ref.template_id ?? 1,
      type_id: ref.type_id ?? 7,
      priority_id: ref.priority_id ?? 2,
    }
    for (const [key, value] of Object.entries(ref)) {
      if (!key.startsWith('custom_')) continue
      if (value === null || value === undefined) continue
      if (key === 'custom_steps_separated' || key === 'custom_preconds' || key === 'custom_expected') continue
      defaults[key] = value
    }
    return defaults
  } catch {
    return {
      template_id: 1,
      type_id: 7,
      priority_id: 2,
      custom_level: 2,
      custom_automated: 3,
      custom_components: 1,
      custom_regressioncandidate: 3,
      custom_auto_suite_name: 'Galaxy 2.0',
    }
  }
}

function stepsToTestRailFormat(steps) {
  return steps.map((step) => ({
    content: step,
    expected: 'Expected outcome is met',
  }))
}

export async function createTestCase({ title, suite, steps = [], projectId, jiraKeys = [] }) {
  if (!testRailConfigured()) {
    throw new Error('TestRail is not configured — add credentials to backend/.env')
  }

  const pid = projectId || getSettings().testRailProjectId || config.testRail.projectId
  const matchedSuite = await findSuite(pid, suite)
  if (!matchedSuite) {
    throw new Error(`No TestRail suite found for "${suite}" in project ${pid}`)
  }

  let sectionId = await findSectionId(pid, matchedSuite.id)
  if (!sectionId) {
    const section = await testRailFetch(`add_section/${matchedSuite.id}`, {
      method: 'POST',
      body: { name: 'ImpactIQ Cases' },
    })
    sectionId = section.id
  }

  const refs = jiraKeys.length ? jiraKeys.join(', ') : undefined
  const defaults = await getCaseCreateDefaults()
  const created = await testRailFetch(`add_case/${sectionId}`, {
    method: 'POST',
    body: {
      ...defaults,
      title,
      refs,
      custom_steps_separated: stepsToTestRailFormat(steps),
    },
  })

  return formatCase(created, matchedSuite.name)
}

export function matchImpactedCasesForScenario(scenario, allCases, limit = 8) {
  const words = scenario
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3)

  const scored = allCases
    .map((c) => {
      const haystack = c.title.toLowerCase()
      const score = words.filter((w) => haystack.includes(w)).length
      return { case: c, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  return (scored.length > 0 ? scored : allCases.map((c) => ({ case: c, score: 0 })))
    .slice(0, limit)
    .map(({ case: c }) => ({ id: c.id, title: c.title, url: c.url, suite: c.suite }))
}

