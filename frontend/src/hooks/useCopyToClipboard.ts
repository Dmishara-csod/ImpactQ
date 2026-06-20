import { useCallback, useState } from 'react'

export function useCopyToClipboard(resetMs = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = useCallback(
    async (id: string, text: string) => {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), resetMs)
    },
    [resetMs],
  )

  return { copiedId, copy }
}
