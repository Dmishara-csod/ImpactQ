import { config } from '../config.js'

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
  },
}

/** Jira integration placeholder — returns mock catalog entries until real Jira API is wired. */
export function getJiraTickets(ticketKeys) {
  const baseUrl = config.jira.baseUrl.replace(/\/$/, '')

  return ticketKeys.map((key) => {
    const template = CATALOG[key]
    const url = `${baseUrl}/browse/${key}`

    if (template) {
      return {
        key,
        url,
        ...template,
        impactedTestCases: [],
        impactedAutomation: [],
      }
    }

    return {
      key,
      url,
      title: `Story ${key}`,
      description: `Placeholder for ${key}. Connect Jira API to fetch real story data.`,
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
      updated: '2025-06-20',
    }
  })
}

export function getTicketKeywords(tickets) {
  const words = new Set()
  for (const ticket of tickets) {
    ticket.modules?.forEach((m) => words.add(m.toLowerCase()))
    ticket.keywords?.forEach((k) => words.add(k.toLowerCase()))
    ticket.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3).forEach((w) => words.add(w))
  }
  return [...words]
}
