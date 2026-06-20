import { useState } from 'react'

import { InputForm } from '@/components/InputForm'
import { Layout, type AppView } from '@/components/Layout'
import { ActionsPage } from '@/pages/ActionsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { analyzeChange } from '@/services/mockAnalysisService'
import type { AnalysisInput, ImpactAnalysis } from '@/types/analysis'

export default function App() {
  const [view, setView] = useState<AppView>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null)

  async function handleSubmit(input: AnalysisInput) {
    setView('dashboard')
    setIsLoading(true)
    setAnalysis(null)

    try {
      const result = await analyzeChange(input)
      setAnalysis(result)
    } finally {
      setIsLoading(false)
    }
  }

  function handleNewAnalysis() {
    setView('input')
    setAnalysis(null)
    setIsLoading(false)
  }

  function handleNavigate(nextView: AppView) {
    if (nextView === 'input') {
      handleNewAnalysis()
      return
    }
    setView(nextView)
  }

  return (
    <Layout
      view={view}
      onNavigate={handleNavigate}
      onNewAnalysis={handleNewAnalysis}
    >
      {view === 'input' && (
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}

      {view === 'dashboard' && (
        <DashboardPage
          analysis={analysis}
          isLoading={isLoading}
          onOpenActions={() => setView('actions')}
        />
      )}

      {view === 'actions' && analysis && !isLoading && (
        <ActionsPage analysis={analysis} />
      )}
    </Layout>
  )
}
