/** Parse Jira keys from free text (one per line, comma-separated, or inline). */
export function parseTicketKeys(raw: string): string[] {
  const matches = raw.match(/[A-Z][A-Z0-9]+-\d+/g) ?? []
  return [...new Set(matches.map((key) => key.toUpperCase()))]
}

export function formatTicketKeys(keys: string[]): string {
  return keys.join(', ')
}
