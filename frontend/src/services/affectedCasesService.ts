import type { AffectedCase, CaseImpactStatus, LinkedJiraTicket } from '@/types/affectedCase'

const FILTER_DELAY_MS = 280
const PAGE_DELAY_MS = 200
const JIRA_DELAY_MS = 350

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface AffectedCasesPageResult {
  items: AffectedCase[]
  total: number
  page: number
  pageSize: number
}

function applyFilters(
  cases: AffectedCase[],
  opts: {
    query: string
    statusFilters: CaseImpactStatus[]
    ticketKey?: string
  },
): AffectedCase[] {
  let filtered = cases

  if (opts.ticketKey) {
    filtered = filtered.filter((c) =>
      c.linkedTickets.some((t) => t.key === opts.ticketKey),
    )
  }

  if (opts.statusFilters.length > 0) {
    filtered = filtered.filter((c) => opts.statusFilters.includes(c.status))
  }

  const q = opts.query.trim().toLowerCase()
  if (q) {
    filtered = filtered.filter(
      (c) =>
        c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    )
  }

  return filtered
}

export async function fetchAffectedCasesPage(opts: {
  cases: AffectedCase[]
  query: string
  page: number
  pageSize: number
  statusFilters?: CaseImpactStatus[]
  ticketKey?: string
  isPageChange?: boolean
}): Promise<AffectedCasesPageResult> {
  await delay(opts.isPageChange ? PAGE_DELAY_MS : FILTER_DELAY_MS)

  const filtered = applyFilters(opts.cases, {
    query: opts.query,
    statusFilters: opts.statusFilters ?? [],
    ticketKey: opts.ticketKey,
  })

  const total = filtered.length
  const start = (opts.page - 1) * opts.pageSize
  const items = filtered.slice(start, start + opts.pageSize)

  return {
    items,
    total,
    page: opts.page,
    pageSize: opts.pageSize,
  }
}

export async function fetchLinkedTickets(
  _caseId: string,
  tickets: LinkedJiraTicket[],
): Promise<LinkedJiraTicket[]> {
  await delay(JIRA_DELAY_MS)
  return tickets
}

export async function fetchAutomationDetail(
  affectedCase: AffectedCase,
): Promise<{ file?: string; method?: string }> {
  await delay(JIRA_DELAY_MS)
  return {
    file: affectedCase.automationFile,
    method: affectedCase.automationMethod,
  }
}
