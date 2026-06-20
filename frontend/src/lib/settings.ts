export interface AppSettings {
  automationRepo: string
  automationPath: string
  environment: string
  testRailProjectId: string
  jiraBaseUrl: string
}

const STORAGE_KEY = 'impactiq-settings'

export const defaultSettings: AppSettings = {
  automationRepo: 'galaxy-automation',
  automationPath: 'C:\\Users\\vrutikpatwa\\galaxy-automation',
  environment: 'PRESTAGE',
  testRailProjectId: '49',
  jiraBaseUrl: 'https://jira.csod.com',
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
