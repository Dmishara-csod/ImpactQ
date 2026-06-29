import { GitPullRequest, Hand } from 'lucide-react'

import { CopyButton } from '@/components/shared/CopyButton'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { PrActionPlan } from '@/types/analysis'

interface PrActionsPanelProps {
  plan: PrActionPlan
}

const changeTypeVariant = {
  update: 'secondary' as const,
  create: 'default' as const,
  fix: 'warning' as const,
}

export function PrActionsPanel({ plan }: PrActionsPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="size-5" />
            PR template
          </CardTitle>
          <CardDescription>
            Read-only preview — copy and open a PR manually in galaxy-automation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Hand className="size-3" />
              Manual step
            </Badge>
            <code className="rounded-md bg-muted px-2 py-1 text-sm">{plan.branchName}</code>
            <CopyButton id="branch" text={plan.branchName} label="Copy branch" />
            <CopyButton id="pr-body" text={plan.prBody} label="Copy description" />
          </div>
          <p className="text-sm font-medium">{plan.title}</p>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
            <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/50 p-4 text-xs whitespace-pre-wrap">
              {plan.prBody}
            </pre>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Suggested file changes ({plan.changes.length})
        </h3>
        {plan.changes.map((change) => (
          <Card key={change.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{change.testFile}</CardTitle>
                  <CardDescription className="mt-1">{change.summary}</CardDescription>
                </div>
                <Badge variant={changeTypeVariant[change.changeType]}>
                  {change.changeType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                {change.suggestedDiff}
              </pre>
              <CopyButton id={change.id} text={change.suggestedDiff} label="Copy snippet" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
