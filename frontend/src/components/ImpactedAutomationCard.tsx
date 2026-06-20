import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ImpactAnalysis } from '@/types/analysis'

interface ImpactedAutomationCardProps {
  automation: ImpactAnalysis['automation']
}

export function ImpactedAutomationCard({ automation }: ImpactedAutomationCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Impacted automation tests</CardTitle>
        <CardDescription>
          {automation.repo} · {automation.framework}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <code className="block rounded-md bg-muted px-2 py-1 text-xs">
          {automation.testNgSuite}
        </code>

        {automation.tests.map((test) => (
          <div key={test.file} className="space-y-2 rounded-lg border p-3">
            <code className="block text-xs font-medium break-all">{test.file}</code>
            <p className="text-sm text-muted-foreground">{test.testClass}</p>

            <div className="flex flex-wrap gap-1.5">
              {test.groups.map((group) => (
                <Badge key={group} variant="outline">
                  {group}
                </Badge>
              ))}
            </div>

            {test.testMethods.length > 0 && (
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                {test.testMethods.map((method) => (
                  <li key={method}>• {method}</li>
                ))}
              </ul>
            )}

            {test.testRailIds.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {test.testRailIds.map((id) => (
                  <a
                    key={id}
                    href={`https://testrail.csod.com/index.php?/cases/view/${id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                  >
                    C{id}
                    <ExternalLink className="size-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
