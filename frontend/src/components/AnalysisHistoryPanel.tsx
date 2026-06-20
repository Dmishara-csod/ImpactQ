import { Clock, History, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatAnalyzedAt,
  type AnalysisHistoryEntry,
} from '@/lib/analysisHistory'

interface AnalysisHistoryPanelProps {
  history: AnalysisHistoryEntry[]
  onSelect: (entry: AnalysisHistoryEntry) => void
  onRemove: (id: string) => void
}

const riskVariant = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
} as const

export function AnalysisHistoryPanel({
  history,
  onSelect,
  onRemove,
}: AnalysisHistoryPanelProps) {
  if (history.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" />
          Recent analyses
        </CardTitle>
        <CardDescription>Reopen a previous impact analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onSelect(entry)}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{entry.inputValue}</span>
                <Badge variant={riskVariant[entry.riskLevel]}>
                  {entry.riskScore} · {entry.riskLevel}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {entry.title}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="size-3" />
                {formatAnalyzedAt(entry.analyzedAt)}
              </p>
            </button>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 text-muted-foreground"
              onClick={() => onRemove(entry.id)}
              aria-label="Remove from history"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
