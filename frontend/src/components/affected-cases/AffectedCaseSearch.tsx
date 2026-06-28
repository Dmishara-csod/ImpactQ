import { Search, SearchX, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AffectedCaseSearchProps {
  value: string
  onChange: (value: string) => void
}

export function AffectedCaseSearch({ value, onChange }: AffectedCaseSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by case ID or name…"
        className="pl-9 pr-9"
        aria-label="Search affected cases"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}

interface AffectedCasesEmptyStateProps {
  query: string
  onClear: () => void
}

export function AffectedCasesEmptyState({
  query,
  onClear,
}: AffectedCasesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-6 text-muted-foreground" />
      </div>
      <p className="font-medium">No cases found</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {query
          ? `Nothing matches "${query}". Try a different case ID or name.`
          : 'No affected cases in this analysis.'}
      </p>
      {query && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
          Clear search
        </Button>
      )}
    </div>
  )
}
