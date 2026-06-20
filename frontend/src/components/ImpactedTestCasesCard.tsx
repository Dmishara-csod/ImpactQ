import { ExternalLink } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ImpactAnalysis } from '@/types/analysis'

interface ImpactedTestCasesCardProps {
  testRail: ImpactAnalysis['testRail']
}

export function ImpactedTestCasesCard({ testRail }: ImpactedTestCasesCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Impacted TestRail cases</CardTitle>
        <CardDescription>
          Project {testRail.projectId} · {testRail.suiteName} ·{' '}
          {testRail.testCases.length} cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">ID</th>
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 font-medium">Suite</th>
              </tr>
            </thead>
            <tbody>
              {testRail.testCases.map((testCase) => (
                <tr key={testCase.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <a
                      href={testCase.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                    >
                      {testCase.id}
                      <ExternalLink className="size-3" />
                    </a>
                  </td>
                  <td className="py-3 pr-4">{testCase.title}</td>
                  <td className="py-3 text-muted-foreground">{testCase.suite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
