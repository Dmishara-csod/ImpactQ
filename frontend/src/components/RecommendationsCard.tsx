import { CheckCircle2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface RecommendationsCardProps {
  recommendations: string[]
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <CardDescription>Suggested next steps before release</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
