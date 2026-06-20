import type { ImpactAnalysis, RiskLevel } from '@/types/analysis'

export interface AnalysisHistoryEntry {
  id: string
  inputValue: string
  title: string
  riskLevel: RiskLevel
  riskScore: number
  analyzedAt: string
  analysis: ImpactAnalysis
}

const STORAGE_KEY = 'impactiq-history'
const MAX_ENTRIES = 20

export function loadHistory(): AnalysisHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AnalysisHistoryEntry[]
  } catch {
    return []
  }
}

export function saveToHistory(analysis: ImpactAnalysis): AnalysisHistoryEntry[] {
  const entry: AnalysisHistoryEntry = {
    id: analysis.id,
    inputValue: analysis.inputValue,
    title: analysis.changeSummary.title,
    riskLevel: analysis.risk.level,
    riskScore: analysis.risk.score,
    analyzedAt: new Date().toISOString(),
    analysis,
  }

  const existing = loadHistory().filter((item) => item.id !== entry.id)
  const next = [entry, ...existing].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function removeFromHistory(id: string): AnalysisHistoryEntry[] {
  const next = loadHistory().filter((item) => item.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function formatAnalyzedAt(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}
