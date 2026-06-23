import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import { config } from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../../data/settings.json')

let settings = null

export function getDefaultSettings() {
  return {
    automationRepo: config.automation.repoName,
    automationPath: config.automation.repoPath,
    environment: config.automation.environment,
    testRailProjectId: config.testRail.projectId,
    jiraBaseUrl: config.jira.baseUrl,
  }
}

async function persist() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(settings, null, 2), 'utf-8')
}

export async function initSettingsStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    settings = { ...getDefaultSettings(), ...JSON.parse(raw) }
  } catch {
    settings = getDefaultSettings()
    await persist()
  }
}

export function getSettings() {
  return settings ? { ...settings } : getDefaultSettings()
}

export async function updateSettings(updates) {
  const allowed = [
    'automationRepo',
    'automationPath',
    'environment',
    'testRailProjectId',
    'jiraBaseUrl',
  ]

  for (const key of allowed) {
    if (updates[key] !== undefined && updates[key] !== null) {
      settings[key] = String(updates[key]).trim()
    }
  }

  await persist()
  return getSettings()
}

export async function resetSettings() {
  settings = getDefaultSettings()
  await persist()
  return getSettings()
}

export function resolveAnalysisSettings(requestSettings = {}) {
  const stored = getSettings()
  return {
    automationPath: requestSettings.automationPath || stored.automationPath,
    environment: requestSettings.environment || stored.environment,
    testRailProjectId: requestSettings.testRailProjectId || stored.testRailProjectId,
    jiraBaseUrl: requestSettings.jiraBaseUrl || stored.jiraBaseUrl,
  }
}
