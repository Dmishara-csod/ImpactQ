import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ImpactAnalysis } from '@/types/analysis'

interface ChangeSummaryCardProps {
  analysis: ImpactAnalysis
}

export function ChangeSummaryCard({ analysis }: ChangeSummaryCardProps) {
  const { changeSummary } = analysis

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Change summary</CardTitle>
        <CardDescription>{changeSummary.businessCapability}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">{changeSummary.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {changeSummary.description}
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Impacted modules</p>
          <div className="flex flex-wrap gap-2">
            {changeSummary.modules.map((module) => (
              <Badge key={module} variant="secondary">
                {module}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Functional areas</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {changeSummary.functionalAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
