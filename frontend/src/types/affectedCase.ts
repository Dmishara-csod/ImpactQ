/** QA impact status — what action this case needs, not a test run result. */
export type CaseImpactStatus =
  | 'update_automation'
  | 'manual_review'
  | 'coverage_gap'
  | 'covered'

export interface LinkedJiraTicket {
  key: string
  status: string
  summary: string
  url: string
}

export interface AffectedCase {
  id: string
  name: string
  suite: string
  url: string
  status: CaseImpactStatus
  /** Why this status was assigned — shown under the case name. */
  statusReason: string
  /** Most recent linked Jira ticket update, or analysis time for proposed cases. */
  lastUpdated?: string
  linkedTickets: LinkedJiraTicket[]
  hasAutomation: boolean
  automationFile?: string
  automationMethod?: string
}
