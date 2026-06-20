import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AnalysisLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className={index === 0 || index === 1 ? 'lg:col-span-1' : ''}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
