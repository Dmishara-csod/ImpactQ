import { Check, Copy, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { buildAnalysisReport } from '@/lib/exportReport'
import type { ImpactAnalysis } from '@/types/analysis'

interface ExportReportButtonProps {
  analysis: ImpactAnalysis
}

export function ExportReportButton({ analysis }: ExportReportButtonProps) {
  const { copiedId, copy } = useCopyToClipboard()

  function downloadReport() {
    const report = buildAnalysisReport(analysis)
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `impactiq-${analysis.inputValue.replace(/[^\w-]/g, '_')}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => copy('report', buildAnalysisReport(analysis))}
      >
        {copiedId === 'report' ? (
          <Check className="size-4" />
        ) : (
          <Copy className="size-4" />
        )}
        Copy report
      </Button>
      <Button size="sm" variant="outline" onClick={downloadReport}>
        <Download className="size-4" />
        Download .md
      </Button>
    </div>
  )
}
