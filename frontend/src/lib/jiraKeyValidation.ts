import { getAllCatalogKeys } from '@/data/jiraTicketCatalog'

const KEY_PATTERN = /^[A-Z][A-Z0-9]+-\d+$/

export type JiraKeyState = 'valid' | 'invalid' | 'unknown'

export function isValidJiraKeyFormat(key: string): boolean {
  return KEY_PATTERN.test(key)
}

/** In mock mode, keys in the demo catalog are "found". */
export function getJiraKeyState(key: string, jiraConnected: boolean): JiraKeyState {
  if (!isValidJiraKeyFormat(key)) return 'invalid'
  if (jiraConnected) return 'valid'
  const catalog = new Set(getAllCatalogKeys())
  return catalog.has(key) ? 'valid' : 'unknown'
}

export const KEY_CHIP_CLASS: Record<JiraKeyState, string> = {
  valid:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/45 dark:bg-emerald-500/18 dark:text-emerald-100',
  invalid:
    'border-red-500/40 bg-red-500/10 text-red-800 dark:border-red-400/45 dark:bg-red-500/18 dark:text-red-100',
  unknown:
    'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:border-amber-400/45 dark:bg-amber-500/18 dark:text-amber-100',
}
