export interface TestRailCaseRef {
  id: string
  title: string
  url: string
  suite: string
}

export interface RunTestRailActionResponse {
  analysisId: string
  actionId: string
  created: TestRailCaseRef
  impactedCases: TestRailCaseRef[]
  allCreatedCases: TestRailCaseRef[]
  message: string
  alreadyExists?: boolean
}

export interface StoredTestRailActions {
  analysisId: string
  actions: Record<
    string,
    {
      actionId: string
      title: string
      created: TestRailCaseRef
      impactedCases: TestRailCaseRef[]
      savedAt: string
    }
  >
  createdCases: TestRailCaseRef[]
}

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function runTestRailAction(payload: {
  analysisId: string
  actionId: string
  title: string
  suite: string
  steps: string[]
  projectId?: string
  jiraKeys?: string[]
  impactedCases?: TestRailCaseRef[]
  cursorPrompt: string
}): Promise<RunTestRailActionResponse> {
  const response = await fetch(`${API_BASE}/api/testrail/actions/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Failed to run TestRail action (${response.status})`)
  }

  return response.json() as Promise<RunTestRailActionResponse>
}

export async function fetchStoredTestRailActions(
  analysisId: string,
): Promise<StoredTestRailActions> {
  const response = await fetch(`${API_BASE}/api/testrail/actions/${analysisId}`)
  if (!response.ok) throw new Error('Failed to load TestRail action results from backend')
  return response.json() as Promise<StoredTestRailActions>
}
