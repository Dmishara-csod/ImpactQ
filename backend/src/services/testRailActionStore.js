import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { normalizeScenarioTitle } from '../utils/testScenarioUtils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../../data/created-testrail-cases.json')

let store = {}

async function persist() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

export async function initTestRailActionStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    store = JSON.parse(raw)
  } catch {
    store = {}
    await persist()
  }
}

export function getCreatedCasesForAnalysis(analysisId) {
  return store[analysisId] || {}
}

export async function saveCreatedCaseForAction(analysisId, actionId, payload) {
  if (!store[analysisId]) store[analysisId] = {}

  store[analysisId][actionId] = {
    ...payload,
    savedAt: new Date().toISOString(),
  }

  await persist()
  return store[analysisId][actionId]
}

export function findCreatedCaseByTitle(analysisId, title) {
  const normalized = normalizeScenarioTitle(title)
  const entries = Object.values(store[analysisId] || {})
  return entries.find((entry) => normalizeScenarioTitle(entry.title) === normalized)
}

export function listAllCreatedForAnalysis(analysisId) {
  const entries = Object.values(store[analysisId] || {})
  const seen = new Set()
  const created = []

  for (const entry of entries) {
    if (!entry.created) continue
    const key = normalizeScenarioTitle(entry.title)
    if (seen.has(key)) continue
    seen.add(key)
    created.push(entry.created)
  }

  return created
}
