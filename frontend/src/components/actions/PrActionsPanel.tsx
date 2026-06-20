import { Check, Copy, ExternalLink, GitPullRequest } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
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
  const { copiedId, copy } = useCopyToClipboard()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="size-5" />
            Suggested pull request
          </CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded-md bg-muted px-2 py-1 text-sm">{plan.branchName}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copy('branch', plan.branchName)}
            >
              {copiedId === 'branch' ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              Copy branch name
            </Button>
            <Button
              size="sm"
              onClick={() => copy('pr-body', plan.prBody)}
            >
              {copiedId === 'pr-body' ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              Copy PR description
            </Button>
          </div>
          <p className="text-sm font-medium">{plan.title}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Test files to change ({plan.changes.length})
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
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Related TestRail cases
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {change.relatedCases.map((caseId) => (
                    <Badge key={caseId} variant="outline">
                      {caseId}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Suggested test changes
                </p>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                  {change.suggestedDiff}
                </pre>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(change.id, change.suggestedDiff)}
              >
                {copiedId === change.id ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                Copy changes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Open in Cursor Pro</p>
            <p className="text-sm text-muted-foreground">
              Paste the PR description into Cursor Agent to scaffold the branch and test updates.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              copy(
                'cursor-pr',
                `Create branch ${plan.branchName} and implement the following test PR:\n\n${plan.prBody}`,
              )
            }
          >
            {copiedId === 'cursor-pr' ? (
              <Check className="size-4" />
            ) : (
              <ExternalLink className="size-4" />
            )}
            Copy Cursor prompt
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
