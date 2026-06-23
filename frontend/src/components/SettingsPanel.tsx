import { useEffect, useState } from 'react'
import { Check, Loader2, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { defaultSettings, type AppSettings } from '@/lib/settings'
import {
  fetchSettings,
  resetSettingsOnBackend,
  saveSettingsToBackend,
} from '@/services/api/settingsApi'

interface SettingsPanelProps {
  onSettingsChange?: (settings: AppSettings) => void
}

export function SettingsPanel({ onSettingsChange }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    fetchSettings()
      .then((data) => {
        setSettings(data)
        onSettingsChange?.(data)
      })
      .catch(() => setError('Could not load settings from backend'))
      .finally(() => setLoading(false))
  }, [open, onSettingsChange])

  function update(field: keyof AppSettings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const updated = await saveSettingsToBackend(settings)
      setSettings(updated)
      onSettingsChange?.(updated)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setSaving(true)
    setError(null)
    try {
      const defaults = await resetSettingsOnBackend()
      setSettings(defaults)
      onSettingsChange?.(defaults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <Settings2 className="size-4" />
        Integration settings
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Integration settings</CardTitle>
            <CardDescription>Saved to backend — used for analysis and automation scan</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
            <Loader2 className="size-4 animate-spin" />
            Loading from backend…
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="repo-path">Automation repo path</Label>
              <Input
                id="repo-path"
                value={settings.automationPath}
                onChange={(e) => update('automationPath', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Input
                id="environment"
                value={settings.environment}
                onChange={(e) => update('environment', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testrail-project">TestRail project ID</Label>
              <Input
                id="testrail-project"
                value={settings.testRailProjectId}
                onChange={(e) => update('testRailProjectId', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jira-url">Jira base URL</Label>
              <Input
                id="jira-url"
                value={settings.jiraBaseUrl}
                onChange={(e) => update('jiraBaseUrl', e.target.value)}
                disabled={saving}
              />
            </div>
          </>
        )}
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button size="sm" onClick={handleSave} disabled={loading || saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
            Save settings
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset} disabled={loading || saving}>
            Reset defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
