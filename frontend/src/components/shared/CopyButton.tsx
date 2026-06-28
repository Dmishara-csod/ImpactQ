import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  id: string
  label?: string
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export function CopyButton({
  text,
  id,
  label = 'Copy',
  size = 'sm',
  variant = 'outline',
  className,
}: CopyButtonProps) {
  const { copiedId, copy } = useCopyToClipboard()

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn('gap-2', className)}
      onClick={() => copy(id, text)}
    >
      {copiedId === id ? (
        <>
          <Check className="size-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="size-4" />
          {label}
        </>
      )}
    </Button>
  )
}
