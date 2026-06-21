import { config, testRailConfigured } from '../config.js'

function authHeader(user = config.testRail.user, apiKey = config.testRail.apiKey) {
  const credentials = Buffer.from(`${user}:${apiKey}`).toString('base64')
  return { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' }
}

async function testRailFetch(path, options = {}) {
  const url = `${options.url || config.testRail.url}/index.php?/api/v2/${path}`
  const response = await fetch(url, {
    headers: authHeader(options.user, options.apiKey),
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

export async function searchProjectCases(keywords, options = {}) {
  if (!testRailConfigured()) return []

  const projectId = options.projectId || config.testRail.projectId
  const limit = options.limit ?? 250

  try {
    const data = await testRailFetch(`get_cases/${projectId}&limit=${limit}`)
    const cases = normalizeCasesResponse(data)
    if (cases.length === 0) return []

    const lowerKeywords = keywords.map((k) => k.toLowerCase())

    return cases
      .filter((c) => {
        const haystack = `${c.title} ${c.custom_preconds || ''} ${c.custom_steps || ''}`.toLowerCase()
        return lowerKeywords.some((kw) => haystack.includes(kw))
      })
      .slice(0, 20)
      .map((c) => formatCase(c))
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
  const bySearch = await searchProjectCases(keywords, options)

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
  return {
    configured: testRailConfigured(),
    url: config.testRail.url,
    projectId: config.testRail.projectId,
  }
}
