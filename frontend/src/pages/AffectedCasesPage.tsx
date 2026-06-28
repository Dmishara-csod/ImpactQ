import {

  AffectedCaseListSkeleton,

} from '@/components/affected-cases/AffectedCaseSkeleton'

import { AffectedCaseRow } from '@/components/affected-cases/AffectedCaseRow'

import {

  AffectedCaseSearch,

  AffectedCasesEmptyState,

} from '@/components/affected-cases/AffectedCaseSearch'

import { AffectedCasesPagination } from '@/components/affected-cases/AffectedCasesPagination'

import { ImpactStatusFilters } from '@/components/affected-cases/ImpactStatusFilters'

import { Badge } from '@/components/ui/badge'

import { useAffectedCases } from '@/hooks/useAffectedCases'

import { cn } from '@/lib/utils'

import type { ActionsTab } from '@/types/actions'
import type { ImpactAnalysis } from '@/types/analysis'

interface AffectedCasesPageProps {
  analysis: ImpactAnalysis
  ticketFilter?: string
  onOpenActions?: (tab: ActionsTab, promptId?: string) => void
}



export function AffectedCasesPage({

  analysis,

  ticketFilter,

  onOpenActions,

}: AffectedCasesPageProps) {

  const {

    query,

    setQuery,

    page,

    setPage,

    pageSize,

    setPageSize,

    statusFilters,

    toggleStatusFilter,

    setStatusFilters,

    items,

    total,

    loading,

    allCasesCount,

  } = useAffectedCases(analysis, 15, { ticketKey: ticketFilter })



  return (

    <div className="space-y-6">

      <header>

        <h2 className="text-2xl font-semibold tracking-tight">Affected Cases</h2>

        <p className="mt-1 text-muted-foreground">

          TestRail project {analysis.testRail.projectId} · {analysis.testRail.suiteName}

          · {allCasesCount} cases

        </p>

        {ticketFilter && (

          <Badge variant="secondary" className="mt-2">

            Filtered by {ticketFilter}

          </Badge>

        )}

        <p className="mt-2 text-xs text-muted-foreground">

          Impact status = required QA action (not test run results).

        </p>

      </header>



      <div className="flex flex-col gap-4">

        <AffectedCaseSearch value={query} onChange={setQuery} />

        <ImpactStatusFilters

          selected={statusFilters}

          onToggle={toggleStatusFilter}

          onClear={() => setStatusFilters([])}

        />

      </div>



      {loading ? (

        <AffectedCaseListSkeleton count={pageSize} />

      ) : total === 0 ? (

        <AffectedCasesEmptyState query={query} onClear={() => setQuery('')} />

      ) : (

        <div className={cn('animate-fade-in space-y-2')}>

          {items.map((item) => (

            <AffectedCaseRow

              key={item.id}

              affectedCase={item}

              analysis={analysis}

              onOpenActions={onOpenActions}

            />

          ))}

        </div>

      )}



      <AffectedCasesPagination

        page={page}

        pageSize={pageSize}

        total={total}

        onPageChange={setPage}

        onPageSizeChange={(size) => {

          setPageSize(size)

          setPage(1)

        }}

        disabled={loading}

      />

    </div>

  )

}


