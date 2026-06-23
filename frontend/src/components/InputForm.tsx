import { type FormEvent, useMemo, useState } from 'react'
import { ArrowRight, Plus, X } from 'lucide-react'

import { AnalysisHistoryPanel } from '@/components/AnalysisHistoryPanel'
import { SettingsPanel } from '@/components/SettingsPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getAllCatalogKeys } from '@/data/jiraTicketCatalog'
import type { AnalysisHistoryEntry } from '@/lib/analysisHistory'
import { parseTicketKeys } from '@/lib/parseTickets'
import type { AnalysisInput } from '@/types/analysis'

interface InputFormProps {
  onSubmit: (input: AnalysisInput) => void
  isLoading: boolean
  history: AnalysisHistoryEntry[]
  error?: string | null
  onSettingsChange: (settings: import('@/lib/settings').AppSettings) => void
  onSelectHistory: (entry: AnalysisHistoryEntry) => void
  onRemoveHistory: (id: string) => void
}

const exampleSets = [
  {
    label: 'Theme & Branding (3 tickets)',
    keys: ['GALXY-482', 'GALXY-1201', 'GALXY-890'],
  },
  {
    label: 'Full admin sprint (4 tickets)',
    keys: getAllCatalogKeys(),
  },
]

export function InputForm({
  onSubmit,
  isLoading,
  history,
  error,
  onSettingsChange,
  onSelectHistory,
  onRemoveHistory,
}: InputFormProps) {
  const [rawInput, setRawInput] = useState('')

  const parsedKeys = useMemo(() => parseTicketKeys(rawInput), [rawInput])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (parsedKeys.length === 0) return
    onSubmit({ inputType: 'jira', ticketKeys: parsedKeys })
  }

  function addKeys(keys: string[]) {
    const merged = [...new Set([...parsedKeys, ...keys])]
    setRawInput(merged.join('\n'))
  }

  function removeKey(key: string) {
    const next = parsedKeys.filter((k) => k !== key)
    setRawInput(next.join('\n'))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Analyze testing impact
        </h2>
        <p className="mt-2 text-muted-foreground">
          Submit one or more Jira stories to map impacted TestRail cases,
          galaxy-automation tests, coverage gaps, and release risk.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Jira stories</CardTitle>
          <CardDescription>
            Enter multiple ticket keys — one per line or comma-separated.
            ImpactIQ scans galaxy-automation and TestRail project 49.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jira-input">Jira ticket keys</Label>
              <Textarea
                id="jira-input"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={'GALXY-482\nGALXY-1201\nGALXY-890'}
                rows={5}
                disabled={isLoading}
              />
            </div>

            {parsedKeys.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {parsedKeys.length} ticket{parsedKeys.length === 1 ? '' : 's'} detected
                </p>
                <div className="flex flex-wrap gap-2">
                  {parsedKeys.map((key) => (
                    <Badge key={key} variant="secondary" className="gap-1 pr-1">
                      {key}
                      <button
                        type="button"
                        className="rounded-full p-0.5 hover:bg-muted"
                        onClick={() => removeKey(key)}
                        aria-label={`Remove ${key}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Quick add examples</p>
              <div className="flex flex-wrap gap-2">
                {exampleSets.map((set) => (
                  <Button
                    key={set.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => addKeys(set.keys)}
                    disabled={isLoading}
                  >
                    <Plus className="size-3.5" />
                    {set.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || parsedKeys.length === 0}
            >
              {isLoading
                ? `Analyzing ${parsedKeys.length} ticket${parsedKeys.length === 1 ? '' : 's'}…`
                : `Run impact analysis (${parsedKeys.length || 0} tickets)`}
              {!isLoading && <ArrowRight className="size-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <SettingsPanel onSettingsChange={onSettingsChange} />
      </div>

      <AnalysisHistoryPanel
        history={history}
        onSelect={onSelectHistory}
        onRemove={onRemoveHistory}
      />
    </div>
  )
}
