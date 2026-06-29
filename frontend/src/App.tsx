import { useEffect, useState } from 'react'

import { InputForm } from '@/components/InputForm'
import { Layout, type AppView } from '@/components/Layout'
import { ActionsPage } from '@/pages/ActionsPage'
import { AffectedCasesPage } from '@/pages/AffectedCasesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TicketsPage } from '@/pages/TicketsPage'
import {
  loadHistory,
  removeFromHistory,
  saveToHistory,
  type AnalysisHistoryEntry,
} from '@/lib/analysisHistory'
import { defaultSettings, type AppSettings } from '@/lib/settings'
import { analyzeChange } from '@/services/api/analysisApi'
import { fetchSettings } from '@/services/api/settingsApi'
import type { AnalysisInput, ImpactAnalysis } from '@/types/analysis'

import type { ActionsFocus, ActionsTab } from '@/types/actions'

export default function App() {
  const [view, setView] = useState<AppView>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTicketCount, setLoadingTicketCount] = useState(0)
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null)
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null)
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>(() => loadHistory())
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [error, setError] = useState<string | null>(null)
  const [casesTicketFilter, setCasesTicketFilter] = useState<string | undefined>()
  const [actionsFocus, setActionsFocus] = useState<ActionsFocus>({})

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => {})
  }, [])

  function resetAnalysisContext() {
    setError(null)
    setCasesTicketFilter(undefined)
    setActionsFocus({})
  }

  async function handleSubmit(input: AnalysisInput) {
    setView('dashboard')
    setIsLoading(true)
    setLoadingTicketCount(input.ticketKeys.length)
    setAnalysis(null)
    setAnalyzedAt(null)
    resetAnalysisContext()

    try {
      const result = await analyzeChange(input, settings)
      setAnalysis(result)
      const now = new Date().toISOString()
      setAnalyzedAt(now)
      setHistory(saveToHistory(result))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setView('input')
    } finally {
      setIsLoading(false)
    }
  }

  function handleNewAnalysis() {
    setView('input')
    setAnalysis(null)
    setAnalyzedAt(null)
    setIsLoading(false)
    resetAnalysisContext()
  }

  function handleNavigate(nextView: AppView) {
    if (nextView === 'input') {
      handleNewAnalysis()
      return
    }
    setView(nextView)
  }

  function handleSelectHistory(entry: AnalysisHistoryEntry) {
    setAnalysis(entry.analysis)
    setAnalyzedAt(entry.analyzedAt)
    setView('dashboard')
    setIsLoading(false)
    resetAnalysisContext()
  }

  function handleRemoveHistory(id: string) {
    setHistory(removeFromHistory(id))
    if (analysis?.id === id) {
      handleNewAnalysis()
    }
  }

  function openCases(ticketKey?: string) {
    setCasesTicketFilter(ticketKey)
    setView('cases')
  }

  function openActions(tab?: ActionsTab, promptId?: string) {
    setActionsFocus({ tab, promptId })
    setView('actions')
  }

  return (
    <Layout
      view={view}
      onNavigate={handleNavigate}
      onNewAnalysis={handleNewAnalysis}
    >
      {view === 'input' && (
        <InputForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          history={history}
          error={error}
          onSettingsChange={setSettings}
          onSelectHistory={handleSelectHistory}
          onRemoveHistory={handleRemoveHistory}
        />
      )}

      {view === 'dashboard' && (
        <DashboardPage
          analysis={analysis}
          isLoading={isLoading}
          analyzedAt={analyzedAt}
          loadingTicketCount={loadingTicketCount}
          onOpenTickets={() => setView('tickets')}
          onOpenCases={() => openCases()}
          onOpenActions={() => openActions()}
        />
      )}

      {view === 'tickets' && analysis && !isLoading && (
        <TicketsPage analysis={analysis} onOpenCases={openCases} />
      )}

      {view === 'cases' && analysis && !isLoading && (
        <AffectedCasesPage
          analysis={analysis}
          ticketFilter={casesTicketFilter}
          onOpenActions={openActions}
        />
      )}

      {view === 'actions' && analysis && !isLoading && (
        <ActionsPage analysis={analysis} focus={actionsFocus} />
      )}
    </Layout>
  )
}
