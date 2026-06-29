import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { buildAffectedCases } from '@/lib/buildAffectedCases'
import { fetchAffectedCasesPage } from '@/services/affectedCasesService'
import type { ImpactAnalysis } from '@/types/analysis'
import type { AffectedCase, CaseImpactStatus } from '@/types/affectedCase'

import { useDebouncedValue } from './useDebouncedValue'

const DEFAULT_PAGE_SIZE = 15

export interface AffectedCasesFilters {
  ticketKey?: string
  statusFilters?: CaseImpactStatus[]
}

export function useAffectedCases(
  analysis: ImpactAnalysis | null,
  initialPageSize = DEFAULT_PAGE_SIZE,
  externalFilters?: AffectedCasesFilters,
) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [statusFilters, setStatusFilters] = useState<CaseImpactStatus[]>(
    externalFilters?.statusFilters ?? [],
  )
  const [items, setItems] = useState<AffectedCase[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const ticketKey = externalFilters?.ticketKey

  useEffect(() => {
    if (externalFilters?.statusFilters) {
      setStatusFilters(externalFilters.statusFilters)
    }
  }, [externalFilters?.statusFilters])

  useEffect(() => {
    setPage(1)
  }, [ticketKey])

  const debouncedQuery = useDebouncedValue(query, 300)
  const prevDebouncedQuery = useRef(debouncedQuery)
  const prevPage = useRef(page)
  const prevStatusKey = useRef(statusFilters.join(','))

  const allCases = useMemo(
    () => (analysis ? buildAffectedCases(analysis, { expandTo: 52 }) : []),
    [analysis],
  )

  const load = useCallback(async () => {
    if (!analysis) {
      setItems([])
      setTotal(0)
      setLoading(false)
      return
    }

    const statusKey = statusFilters.join(',')
    const isPageChange =
      debouncedQuery === prevDebouncedQuery.current &&
      page !== prevPage.current &&
      statusKey === prevStatusKey.current &&
      !ticketKey

    setLoading(true)
    try {
      const result = await fetchAffectedCasesPage({
        cases: allCases,
        query: debouncedQuery,
        page,
        pageSize,
        statusFilters,
        ticketKey,
        isPageChange,
      })
      setItems(result.items)
      setTotal(result.total)
    } finally {
      setLoading(false)
      prevDebouncedQuery.current = debouncedQuery
      prevPage.current = page
      prevStatusKey.current = statusKey
    }
  }, [analysis, allCases, debouncedQuery, page, pageSize, statusFilters, ticketKey])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, statusFilters])

  useEffect(() => {
    void load()
  }, [load])

  function toggleStatusFilter(status: CaseImpactStatus) {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
  }

  return {
    query,
    setQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    statusFilters,
    setStatusFilters,
    toggleStatusFilter,
    items,
    total,
    loading,
    allCasesCount: allCases.length,
    allCases,
  }
}
