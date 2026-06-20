export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'impactiq-theme'

export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme
}

export function initTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const theme = stored ?? 'system'
    applyTheme(resolveTheme(theme))
  } catch {
    applyTheme('light')
  }
}

export function loadStoredTheme(): Theme {
  try {
    return (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? 'system'
  } catch {
    return 'system'
  }
}
