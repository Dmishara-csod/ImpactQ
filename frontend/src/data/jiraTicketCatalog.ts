import type { JiraTicket } from '@/types/analysis'

type TicketTemplate = Omit<JiraTicket, 'key' | 'url'>

const CATALOG: Record<string, TicketTemplate> = {
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
    impactedTestCases: ['C29925265'],
    impactedAutomation: ['AdminThemeAndBrandingTest.testVerifyThemeAndBrandingPageLoads'],
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
    impactedTestCases: ['C29906508', 'C29906509'],
    impactedAutomation: ['AdminThemeAndBrandingTest.testVerifyHeaderLogoConfiguration'],
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
      'Removing banner restores default state',
    ],
    modules: ['admin', 'portal', 'profile'],
    sprint: 'Galaxy Sprint 25',
    storyPoints: 5,
    impactedTestCases: ['C29906501', 'C29906503'],
    impactedAutomation: ['AdminThemeAndBrandingTest.testVerifyUploadBannerImage'],
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
    impactedTestCases: ['C29906512', 'C29906513'],
    impactedAutomation: ['AdminThemeAndBrandingTest.testVerifyCreateCustomTheme'],
    created: '2025-06-05',
    updated: '2025-06-19',
  },
}

export function buildJiraTicket(key: string, jiraBaseUrl: string): JiraTicket {
  const template = CATALOG[key]
  const url = `${jiraBaseUrl.replace(/\/$/, '')}/browse/${key}`

  if (template) {
    return { key, url, ...template }
  }

  return {
    key,
    url,
    title: `Story ${key} — feature change`,
    description: `Implementation work tracked under ${key}. ImpactIQ will map this to galaxy-automation and TestRail coverage.`,
    status: 'To Do',
    priority: 'Medium',
    type: 'Story',
    assignee: 'Unassigned',
    reporter: 'Product Owner',
    labels: ['impact-analysis'],
    acceptanceCriteria: ['Feature behaves as specified in Jira description'],
    modules: ['admin'],
    sprint: 'Current Sprint',
    storyPoints: 3,
    impactedTestCases: [],
    impactedAutomation: [],
    created: '2025-06-01',
    updated: '2025-06-20',
  }
}

export function getAllCatalogKeys(): string[] {
  return Object.keys(CATALOG)
}
