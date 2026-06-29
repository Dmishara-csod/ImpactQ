import { useState } from 'react'
import { ChevronDown, ExternalLink, Hand } from 'lucide-react'

import { JiraTicketSkeleton } from '@/components/affected-cases/AffectedCaseSkeleton'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { resolveCaseActionTarget } from '@/lib/casePromptResolver'
import { formatLastUpdated, STATUS_STRIPE } from '@/lib/affectedCaseStatus'
import { cn } from '@/lib/utils'
import {
  fetchAutomationDetail,
  fetchLinkedTickets,
} from '@/services/affectedCasesService'
import type { ImpactAnalysis } from '@/types/analysis'
import type { AffectedCase, LinkedJiraTicket } from '@/types/affectedCase'
import type { ActionsTab } from '@/types/actions'

interface AffectedCaseRowProps {
  affectedCase: AffectedCase
  analysis: ImpactAnalysis
  onOpenActions?: (tab: ActionsTab, promptId?: string) => void
}

export function AffectedCaseRow({
  affectedCase,
  analysis,
  onOpenActions,
}: AffectedCaseRowProps) {
  const [open, setOpen] = useState(false)
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [automationLoading, setAutomationLoading] = useState(false)
  const [tickets, setTickets] = useState<LinkedJiraTicket[] | null>(null)
  const [automationDetail, setAutomationDetail] = useState<{
    file?: string
    method?: string
  } | null>(null)

  const hasTickets = affectedCase.linkedTickets.length > 0
  const actionTarget = resolveCaseActionTarget(analysis, affectedCase)
  const showPromptAction =
    actionTarget &&
    (affectedCase.status === 'coverage_gap' ||
      affectedCase.status === 'manual_review' ||
      affectedCase.status === 'update_automation')

  async function handleToggle() {
    const next = !open
    setOpen(next)
    if (!next) return

    if (tickets === null && hasTickets) {
      setTicketsLoading(true)
      try {
        setTickets(
          await fetchLinkedTickets(affectedCase.id, affectedCase.linkedTickets),
        )
      } finally {
        setTicketsLoading(false)
      }
    }

    if (automationDetail === null) {
      setAutomationLoading(true)
      try {
        setAutomationDetail(await fetchAutomationDetail(affectedCase))
      } finally {
        setAutomationLoading(false)
      }
    }
  }

  const automationLabel =
    affectedCase.automationFile && affectedCase.automationMethod
      ? `${affectedCase.automationFile} · ${affectedCase.automationMethod}()`
      : 'No automation found'

  return (
    <article
      className={cn(
        'group rounded-lg border border-border border-l-4 bg-card transition-all duration-200',
        STATUS_STRIPE[affectedCase.status],
        'hover:-translate-y-px hover:shadow-md dark:hover:border-border dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.35)]',
      )}
    >
      <div className="grid grid-cols-1 items-center gap-3 p-4 sm:grid-cols-[6.5rem_minmax(0,1fr)_5.5rem_auto_auto] sm:gap-x-4">
        <div className="flex items-center justify-between gap-2 sm:block">
          {affectedCase.id.startsWith('NEW-') ? (
            <span className="font-mono text-xs font-medium text-muted-foreground">
              {affectedCase.id}
            </span>
          ) : (
            <a
              href={affectedCase.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs font-medium text-primary hover:underline"
            >
              {affectedCase.id}
              <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          )}
          <StatusBadge status={affectedCase.status} className="sm:hidden" />
        </div>

        <div className="min-w-0">
          <p className="font-medium text-sm leading-snug">{affectedCase.name}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {affectedCase.statusReason}
          </p>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
            {automationLabel}
          </p>
        </div>

        <p className="hidden text-right text-xs tabular-nums text-muted-foreground sm:block">
          {formatLastUpdated(affectedCase.lastUpdated)}
        </p>

        <StatusBadge status={affectedCase.status} className="hidden sm:inline-flex" />

        <div className="flex justify-end sm:justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground"
            onClick={() => void handleToggle()}
            aria-expanded={open}
          >
            Details
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </Button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in space-y-4 border-t bg-muted/20 px-4 py-3">
          <div className="sm:hidden">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Last updated
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatLastUpdated(affectedCase.lastUpdated)}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Automation
            </p>
            {automationLoading ? (
              <Skeleton className="skeleton-shimmer h-4 w-full max-w-md" />
            ) : (
              <p className="font-mono text-xs text-foreground">
                {automationDetail?.file
                  ? `${automationDetail.file} · ${automationDetail.method}()`
                  : 'No automation found'}
              </p>
            )}
          </div>

          {hasTickets && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Linked Jira tickets
              </p>
              <div className="space-y-2">
                {ticketsLoading &&
                  Array.from({ length: affectedCase.linkedTickets.length }).map(
                    (_, index) => <JiraTicketSkeleton key={index} />,
                  )}
                {!ticketsLoading &&
                  tickets?.map((ticket) => (
                    <div
                      key={ticket.key}
                      className="flex flex-col gap-2 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <a
                          href={ticket.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          {ticket.key}
                          <ExternalLink className="size-3" />
                        </a>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {ticket.summary}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 self-start sm:self-center">
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {showPromptAction && actionTarget && (
            <div className="flex flex-col gap-2 rounded-md border border-dashed bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <Hand className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{actionTarget.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Manual step — copy the prompt and run it in your AI agent environment
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  id={`prompt-${affectedCase.id}`}
                  text={actionTarget.promptText}
                  label="Copy prompt"
                />
                {onOpenActions && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      onOpenActions(actionTarget.tab, actionTarget.promptId)
                    }
                  >
                    Open in Actions
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
