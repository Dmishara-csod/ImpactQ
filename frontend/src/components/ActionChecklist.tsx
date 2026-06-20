import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { loadChecklist, saveChecklist } from '@/lib/actionChecklist'
import type { ImpactAnalysis } from '@/types/analysis'

interface ActionChecklistProps {
  analysis: ImpactAnalysis
}

export function ActionChecklist({ analysis }: ActionChecklistProps) {
  const items = useMemo(
    () => [
      {
        id: 'pr-branch',
        label: `Create branch ${analysis.actionPlan.pr.branchName}`,
      },
      ...analysis.actionPlan.pr.changes.map((c) => ({
        id: `pr-${c.id}`,
        label: `PR: ${c.testFile} — ${c.summary}`,
      })),
      ...analysis.actionPlan.cursor.map((a) => ({
        id: `cursor-${a.id}`,
        label: `Cursor: ${a.title}`,
      })),
      ...analysis.actionPlan.testRail.map((a) => ({
        id: `tr-${a.id}`,
        label: `TestRail: ${a.action} — ${a.title}`,
      })),
    ],
    [analysis],
  )

  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    loadChecklist(analysis.id),
  )

  useEffect(() => {
    saveChecklist(analysis.id, checked)
  }, [analysis.id, checked])

  const doneCount = items.filter((item) => checked[item.id]).length
  const progress = Math.round((doneCount / items.length) * 100)

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Action checklist</CardTitle>
        <CardDescription>
          {doneCount} of {items.length} complete ({progress}%)
        </CardDescription>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const isDone = checked[item.id]
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
            >
              {isDone ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <span
                className={`text-sm ${isDone ? 'text-muted-foreground line-through' : ''}`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
