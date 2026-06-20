const STORAGE_PREFIX = 'impactiq-checklist-'

export function loadChecklist(analysisId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${analysisId}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveChecklist(analysisId: string, state: Record<string, boolean>) {
  localStorage.setItem(`${STORAGE_PREFIX}${analysisId}`, JSON.stringify(state))
}
