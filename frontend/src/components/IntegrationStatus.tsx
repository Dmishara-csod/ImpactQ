import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Plug } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AppSettings } from '@/lib/settings'
import { fetchIntegrationStatus } from '@/services/api/analysisApi'

interface IntegrationStatusProps {
  settings: AppSettings
}

type Status = 'connected' | 'ready' | 'mock' | 'offline'

interface IntegrationItem {
  name: string
  detail: string
  status: Status
}

function mapBackendStatus(
  backend: Awaited<ReturnType<typeof fetchIntegrationStatus>> | null,
  settings: AppSettings,
): IntegrationItem[] {
  if (!backend) {
    return [
      { name: 'Jira', detail: settings.jiraBaseUrl, status: 'mock' },
      {
        name: 'TestRail',
        detail: `Project ${settings.testRailProjectId}`,
        status: 'offline',
      },
      { name: 'galaxy-automation', detail: settings.automationPath, status: 'offline' },
      { name: 'AI Agent', detail: 'JetBrains · Terminal', status: 'ready' },
      { name: 'Environment', detail: settings.environment, status: 'ready' },
    ]
  }

  return [
    {
      name: 'Jira',
      detail: backend.jira.connection?.ok
        ? `${backend.jira.baseUrl} · ${backend.jira.connection.displayName}`
        : backend.jira.configured
          ? `${backend.jira.baseUrl} · connection failed`
          : backend.jira.baseUrl,
      status:
        backend.jira.connection?.ok ? 'connected' : backend.jira.mode === 'mock' ? 'mock' : 'offline',
    },
    {
      name: 'TestRail',
      detail: backend.testRail.configured
        ? `${backend.testRail.url} · Project ${backend.testRail.projectId}`
        : 'Not configured — add credentials to backend/.env',
      status: backend.testRail.configured ? 'connected' : 'offline',
    },
    {
      name: 'galaxy-automation',
      detail: backend.automation.repoPath,
      status: backend.automation.exists ? 'connected' : 'offline',
    },
    {
      name: 'AI Agent',
      detail: backend.cursor?.hint ?? 'JetBrains · Playwright · TestRail',
      status: 'ready',
    },
    {
      name: 'Environment',
      detail: settings.environment,
      status: 'ready',
    },
  ]
}

export function IntegrationStatus({ settings }: IntegrationStatusProps) {
  const [backendStatus, setBackendStatus] = useState<Awaited<
    ReturnType<typeof fetchIntegrationStatus>
  > | null>(null)

  useEffect(() => {
    fetchIntegrationStatus()
      .then(setBackendStatus)
      .catch(() => setBackendStatus(null))
  }, [])

  const items = mapBackendStatus(backendStatus, settings)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Plug className="size-4" />
          Integrations
        </CardTitle>
        <CardDescription>
          {backendStatus
            ? 'Live status from ImpactIQ backend'
            : 'Backend offline — showing local settings'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3"
          >
            {item.status === 'connected' || item.status === 'ready' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.name}</span>
                <Badge variant="outline" className="text-[10px]">
                  {item.status}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
