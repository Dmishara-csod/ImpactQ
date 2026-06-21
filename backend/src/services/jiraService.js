import { config, jiraConfigured } from '../config.js'

const CATALOG = {
  'GALXY-482': {
    title: 'Admin Theme & Branding — page load and navigation',
    description:
      'As a Galaxy admin, I want the Theme and Branding configuration page to load reliably so I can manage portal appearance settings.',
    status: 'In Progress',
    priority: 'High',
    type: 'Story',
    assignee: 'Vrutik Patwa',
    reporter: 'Product Owner',
    labels: ['admin', 'theme', 'branding', 'regression'],
    acceptanceCriteria: [
      'Theme and Branding page loads for admin users',
      'Theme and branding tabs are visible',
      'Navigation from Admin menu works correctly',
    ],
    modules: ['admin', 'portal', 'theme_and_branding'],
    sprint: 'Galaxy Sprint 24',
    storyPoints: 5,
    keywords: ['theme', 'branding', 'admin'],
    created: '2025-05-12',
    updated: '2025-06-18',
    impactedTestCases: ['C29925265'],
    impactedAutomation: ['AdminThemeAndBrandingTest.testVerifyThemeAndBrandingPageLoads'],
  },
  'GALXY-1201': {
    title: 'Configure custom header logo in Theme & Branding',
    description:
      'Enable admins to upload and configure a custom header logo that appears across the Galaxy portal header.',
    status: 'In Review',
    priority: 'High',
    type: 'Story',
    assignee: 'Vrutik Patwa',
    reporter: 'UX Team',
    labels: ['admin', 'header', 'logo', 'branding'],
    acceptanceCriteria: [
      'Admin can upload a header logo image',
      'Unsupported file types show validation error',
      'Saved logo appears in Galaxy header menu',
    ],
    modules: ['admin', 'portal', 'theme_and_branding'],
    sprint: 'Galaxy Sprint 24',
    storyPoints: 3,
    keywords: ['header', 'logo', 'branding'],
    created: '2025-05-20',
    updated: '2025-06-19',
    impactedTestCases: ['C29906508', 'C29906509'],
    impactedAutomation: ['AdminThemeAndBrandingTest.testVerifyHeaderLogoConfiguration'],
  },
  'GALXY-890': {
    title: 'Profile banner upload and profile page sync',
    description:
      'Support profile banner image upload in admin branding settings with validation and reflection on the user profile page.',
    status: 'To Do',
    priority: 'Medium',
    type: 'Story',
    assignee: 'QA Team',
    reporter: 'Product Owner',
    labels: ['admin', 'profile', 'upload', 'branding'],
    acceptanceCriteria: [
      'Admin can upload profile banner image',
      'Banner appears on user profile after save',
      'Invalid uploads show clear error messages',
    ],
    modules: ['admin', 'portal', 'profile'],
    sprint: 'Galaxy Sprint 25',
    storyPoints: 5,
    keywords: ['profile', 'banner', 'upload'],
    created: '2025-06-01',
    updated: '2025-06-17',
    impactedTestCases: ['C29906501', 'C29906503'],
    impactedAutomation: ['AdminThemeAndBrandingTest.testVerifyUploadBannerImage'],
  },
  'GALXY-1305': {
    title: 'Create custom theme workflow',
    description:
      'Add ability for admins to create, edit, and apply custom themes from the Theme and Branding admin section.',
    status: 'In Progress',
    priority: 'Medium',
    type: 'Story',
    assignee: 'Dev Team',
    reporter: 'Product Owner',
    labels: ['admin', 'theme', 'create-theme'],
    acceptanceCriteria: [
      'Admin can open create theme flow',
      'Theme name and colors can be configured',
      'New theme appears in theme list after save',
    ],
    modules: ['admin', 'portal', 'theme_and_branding'],
    sprint: 'Galaxy Sprint 25',
    storyPoints: 8,
    keywords: ['theme', 'create', 'custom'],
    created: '2025-06-05',
    updated: '2025-06-19',
    impactedTestCases: ['C29906512', 'C29906513'],
    impactedAutomation: ['AdminThemeAndBrandingTest.testVerifyCreateCustomTheme'],
  },
}

function authHeaders() {
  return {
    Authorization: `Bearer ${config.jira.apiToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

async function jiraFetch(path) {
  const url = `${config.jira.baseUrl}/rest/api/2/${path}`
  const response = await fetch(url, { headers: authHeaders() })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Jira API ${response.status}: ${text.slice(0, 200)}`)
  }

  return response.json()
}

function plainText(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  return JSON.stringify(value)
}

function extractAcceptanceCriteria(description) {
  const text = plainText(description)
  if (!text) return ['Feature behaves as specified in Jira']

  const sectionMatch = text.match(
    /acceptance criteria[:\s]*([\s\S]*?)(?:\n\s*\n|\n\s*[-*#]|$)/i,
  )
  if (sectionMatch) {
    const lines = sectionMatch[1]
      .split('\n')
      .map((l) => l.replace(/^[\s\-*•\d.)]+/, '').trim())
      .filter((l) => l.length > 3)
    if (lines.length > 0) return lines.slice(0, 8)
  }

  const bulletLines = text
    .split('\n')
    .map((l) => l.replace(/^[\s\-*•\d.)]+/, '').trim())
    .filter((l) => l.length > 8)
  return bulletLines.length > 0 ? bulletLines.slice(0, 5) : [text.slice(0, 200)]
}

function deriveKeywords(ticket) {
  const words = new Set(ticket.keywords || [])
  ticket.labels?.forEach((l) => words.add(l.toLowerCase()))
  ticket.modules?.forEach((m) => words.add(m.toLowerCase()))
  ticket.title
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3)
    .forEach((w) => words.add(w))
  return [...words]
}

function parseJiraIssue(issue) {
  const fields = issue.fields
  const key = issue.key
  const description = plainText(fields.description)
  const labels = fields.labels || []
  const components = (fields.components || []).map((c) => c.name.toLowerCase().replace(/\s+/g, '_'))
  const modules = components.length > 0 ? components : labels.slice(0, 3)

  const ticket = {
    key,
    url: `${config.jira.baseUrl}/browse/${key}`,
    title: fields.summary || key,
    description: description || `Jira issue ${key}`,
    status: fields.status?.name || 'Unknown',
    priority: fields.priority?.name || 'Medium',
    type: fields.issuetype?.name || 'Issue',
    assignee: fields.assignee?.displayName || 'Unassigned',
    reporter: fields.reporter?.displayName || fields.creator?.displayName || 'Unknown',
    labels,
    acceptanceCriteria: extractAcceptanceCriteria(description),
    modules: modules.length > 0 ? modules : ['general'],
    sprint: fields.customfield_10004?.name || fields.customfield_10004 || 'Current Sprint',
    storyPoints: fields.customfield_10002 ?? fields.customfield_10006 ?? 0,
    keywords: [],
    impactedTestCases: [],
    impactedAutomation: [],
    created: fields.created?.slice(0, 10) || '',
    updated: fields.updated?.slice(0, 10) || '',
  }

  ticket.keywords = deriveKeywords(ticket)
  return ticket
}

function applyCatalogOverlay(ticket) {
  const template = CATALOG[ticket.key]
  if (!template) return ticket

  return {
    ...ticket,
    impactedTestCases: [...(template.impactedTestCases || ticket.impactedTestCases)],
    impactedAutomation: [...(template.impactedAutomation || ticket.impactedAutomation)],
    keywords: deriveKeywords({ ...ticket, keywords: template.keywords || ticket.keywords }),
    modules:
      ticket.modules.length > 0 && ticket.modules[0] !== 'general'
        ? ticket.modules
        : template.modules,
  }
}

function buildCatalogTicket(key) {
  const baseUrl = config.jira.baseUrl
  const template = CATALOG[key]
  const url = `${baseUrl}/browse/${key}`

  if (template) {
    const { impactedTestCases = [], impactedAutomation = [], ...rest } = template
    return {
      key,
      url,
      ...rest,
      impactedTestCases: [...impactedTestCases],
      impactedAutomation: [...impactedAutomation],
      keywords: deriveKeywords({ ...rest, key }),
    }
  }

  return {
    key,
    url,
    title: `Story ${key}`,
    description: `Placeholder for ${key}.`,
    status: 'To Do',
    priority: 'Medium',
    type: 'Story',
    assignee: 'Unassigned',
    reporter: 'Product Owner',
    labels: ['impact-analysis'],
    acceptanceCriteria: ['Feature behaves as specified in Jira'],
    modules: ['admin'],
    sprint: 'Current Sprint',
    storyPoints: 3,
    keywords: [key.toLowerCase()],
    impactedTestCases: [],
    impactedAutomation: [],
    created: '2025-06-01',
    updated: new Date().toISOString().slice(0, 10),
  }
}

async function fetchJiraTicket(key) {
  try {
    const issue = await jiraFetch(
      `issue/${key}?fields=summary,description,status,priority,issuetype,assignee,reporter,creator,labels,components,customfield_10002,customfield_10004,customfield_10006,created,updated`,
    )
    return applyCatalogOverlay(parseJiraIssue(issue))
  } catch (err) {
    console.warn(`[jira] Failed to fetch ${key}:`, err.message)
    return buildCatalogTicket(key)
  }
}

export async function getJiraTickets(ticketKeys) {
  if (!jiraConfigured()) {
    return ticketKeys.map(buildCatalogTicket)
  }

  return Promise.all(ticketKeys.map(fetchJiraTicket))
}

export function getTicketKeywords(tickets) {
  const words = new Set()
  for (const ticket of tickets) {
    ticket.modules?.forEach((m) => words.add(m.toLowerCase()))
    ticket.keywords?.forEach((k) => words.add(k.toLowerCase()))
    ticket.title
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
      .forEach((w) => words.add(w))
  }
  return [...words]
}

export function getJiraStatus() {
  return {
    configured: jiraConfigured(),
    mode: jiraConfigured() ? 'api' : 'mock',
    baseUrl: config.jira.baseUrl,
    user: config.jira.user || undefined,
  }
}

export async function verifyJiraConnection() {
  if (!jiraConfigured()) return { ok: false, reason: 'JIRA_API_TOKEN not set' }
  try {
    const user = await jiraFetch('myself')
    return { ok: true, displayName: user.displayName, email: user.emailAddress }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}
