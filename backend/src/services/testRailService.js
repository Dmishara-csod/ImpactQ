import { config, testRailConfigured } from '../config.js'

function authHeader() {
  const credentials = Buffer.from(`${config.testRail.user}:${config.testRail.apiKey}`).toString('base64')
  return { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' }
}

async function testRailFetch(path) {
  const url = `${config.testRail.url}/index.php?/api/v2/${path}`
  const response = await fetch(url, { headers: authHeader() })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`TestRail API error ${response.status}: ${text.slice(0, 200)}`)
  }

  return response.json()
}

function formatCase(testCase, suiteName = 'TestRail') {
  const numericId = String(testCase.id)
  return {
    id: `C${numericId}`,
    title: testCase.title,
    suite: suiteName,
    url: `${config.testRail.url}/index.php?/cases/view/${numericId}`,
    numericId,
  }
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

export async function searchProjectCases(keywords, limit = 50) {
  if (!testRailConfigured()) return []

  try {
    const cases = await testRailFetch(`get_cases/${config.testRail.projectId}&limit=${limit}`)
    if (!Array.isArray(cases)) return []

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

export async function resolveTestCases(caseIdsFromAutomation, keywords) {
  const byId = await getTestCasesByIds([...new Set(caseIdsFromAutomation)])
  const bySearch = await searchProjectCases(keywords)

  const seen = new Set(byId.map((c) => c.numericId))
  const merged = [...byId]

  for (const c of bySearch) {
    if (!seen.has(c.numericId)) {
      seen.add(c.numericId)
      merged.push(c)
    }
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
