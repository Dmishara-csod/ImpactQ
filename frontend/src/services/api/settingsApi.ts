import type { AppSettings } from '@/lib/settings'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchSettings(): Promise<AppSettings> {
  const response = await fetch(`${API_BASE}/api/settings`)
  if (!response.ok) throw new Error('Failed to fetch settings from backend')
  return response.json() as Promise<AppSettings>
}

export async function saveSettingsToBackend(settings: AppSettings): Promise<AppSettings> {
  const response = await fetch(`${API_BASE}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to save settings')
  }
  return response.json() as Promise<AppSettings>
}

export async function resetSettingsOnBackend(): Promise<AppSettings> {
  const response = await fetch(`${API_BASE}/api/settings/reset`, { method: 'POST' })
  if (!response.ok) throw new Error('Failed to reset settings')
  return response.json() as Promise<AppSettings>
}
