const TICKET_KEY_PATTERN = /^[A-Z][A-Z0-9]+-\d+$/i

export function validateAnalyzeRequest(req, res, next) {
  const { ticketKeys } = req.body ?? {}

  if (!Array.isArray(ticketKeys) || ticketKeys.length === 0) {
    return res.status(400).json({ error: 'ticketKeys must be a non-empty array' })
  }

  const normalized = ticketKeys.map((k) => String(k).trim().toUpperCase()).filter(Boolean)

  if (normalized.length === 0) {
    return res.status(400).json({ error: 'ticketKeys must contain at least one valid key' })
  }

  const invalid = normalized.filter((key) => !TICKET_KEY_PATTERN.test(key))
  if (invalid.length > 0) {
    return res.status(400).json({
      error: `Invalid Jira key format: ${invalid.join(', ')}`,
    })
  }

  req.body.ticketKeys = normalized
  next()
}
