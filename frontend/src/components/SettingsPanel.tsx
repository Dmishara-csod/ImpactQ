import { useState } from 'react'
import { Check, Settings2 } from 'lucide-react'

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
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  type AppSettings,
} from '@/lib/settings'

export function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [saved, setSaved] = useState(false)

  function update(field: keyof AppSettings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSave() {
    saveSettings(settings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
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
            <CardDescription>
              Configure paths and endpoints for galaxy-automation analysis
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="repo-path">Automation repo path</Label>
          <Input
            id="repo-path"
            value={settings.automationPath}
            onChange={(e) => update('automationPath', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <Input
            id="environment"
            value={settings.environment}
            onChange={(e) => update('environment', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testrail-project">TestRail project ID</Label>
          <Input
            id="testrail-project"
            value={settings.testRailProjectId}
            onChange={(e) => update('testRailProjectId', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jira-url">Jira base URL</Label>
          <Input
            id="jira-url"
            value={settings.jiraBaseUrl}
            onChange={(e) => update('jiraBaseUrl', e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button size="sm" onClick={handleSave}>
            {saved ? <Check className="size-4" /> : null}
            Save settings
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset}>
            Reset defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
