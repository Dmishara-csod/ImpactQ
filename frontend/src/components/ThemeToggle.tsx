import { Monitor, Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Theme } from '@/hooks/theme'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const options: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
]

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        'inline-flex rounded-lg border bg-muted/50 p-0.5',
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 px-2.5',
            theme === value && 'bg-background shadow-sm',
          )}
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          aria-pressed={theme === value}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  )
}
