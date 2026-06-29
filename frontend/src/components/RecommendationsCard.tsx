import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface RecommendationsCardProps {
  recommendations: string[]
  onOpenActions?: () => void
}

export function RecommendationsCard({
  recommendations,
  onOpenActions,
}: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Recommended next steps</CardTitle>
          <CardDescription>Rule-based actions from the impact analysis</CardDescription>
        </div>
        {onOpenActions && (
          <Button variant="ghost" size="sm" className="shrink-0 gap-1" onClick={onOpenActions}>
            Actions
            <ArrowRight className="size-3.5" />
          </Button>
        )}
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
