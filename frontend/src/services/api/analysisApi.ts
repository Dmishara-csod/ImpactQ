import type { AnalysisInput, ImpactAnalysis } from '@/types/analysis'
import type { AppSettings } from '@/lib/settings'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function analyzeChange(
  input: AnalysisInput,
  settings?: AppSettings,
): Promise<ImpactAnalysis> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketKeys: input.ticketKeys,
      settings: settings
        ? {
            automationPath: settings.automationPath,
            environment: settings.environment,
            testRailProjectId: settings.testRailProjectId,
          }
        : undefined,
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Backend error (${response.status})`)
  }

  return response.json() as Promise<ImpactAnalysis>
}

export async function fetchIntegrationStatus() {
  const response = await fetch(`${API_BASE}/api/integrations/status`)
  if (!response.ok) throw new Error('Failed to fetch integration status')
  return response.json()
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/api/health`)
  if (!response.ok) throw new Error('Backend health check failed')
  return response.json()
}

export async function fetchHistory(limit = 20) {
  const response = await fetch(`${API_BASE}/api/history?limit=${limit}`)
  if (!response.ok) throw new Error('Failed to fetch history')
  return response.json()
}

export async function fetchAnalysisById(id: string) {
  const response = await fetch(`${API_BASE}/api/history/${id}`)
  if (!response.ok) throw new Error('Analysis not found')
  return response.json() as Promise<ImpactAnalysis>
}
