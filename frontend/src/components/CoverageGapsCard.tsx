import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ImpactAnalysis } from '@/types/analysis'

interface CoverageGapsCardProps {
  gaps: ImpactAnalysis['coverageGaps']
}

function GapList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-destructive">–</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CoverageGapsCard({ gaps }: CoverageGapsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Coverage gaps</CardTitle>
        <CardDescription>
          Missing scenarios, automation, and edge cases identified by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <GapList title="Missing test scenarios" items={gaps.missingScenarios} />
        <GapList title="Missing automation" items={gaps.missingAutomation} />
        <GapList title="Edge cases" items={gaps.edgeCases} />
      </CardContent>
    </Card>
  )
}
