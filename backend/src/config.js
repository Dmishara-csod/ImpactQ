import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGODB_URI || '',
  testRail: {
    url: (process.env.TESTRAIL_URL || 'https://testrail.csod.com').replace(/\/$/, ''),
    user: process.env.TESTRAIL_USER || process.env.TESTRAIL_USERNAME || '',
    apiKey: process.env.TESTRAIL_API_KEY || '',
    projectId: process.env.TESTRAIL_PROJECT_ID || '49',
  },
  automation: {
    repoPath: process.env.AUTOMATION_REPO_PATH || 'C:\\Users\\vrutikpatwa\\galaxy-automation',
    environment: process.env.AUTOMATION_ENV || 'PRESTAGE',
    repoName: 'galaxy-automation',
  },
  jira: {
    baseUrl: (process.env.JIRA_BASE_URL || 'https://jira.csod.com').replace(/\/$/, ''),
    apiToken: process.env.JIRA_API_TOKEN || '',
    user: process.env.JIRA_USER || '',
  },
  cursor: {
    apiKey: process.env.CURSOR_API_KEY || '',
    mcpConfigPath: process.env.CURSOR_MCP_CONFIG || '.cursor/mcp.json',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}

export function testRailConfigured() {
  return Boolean(config.testRail.user && config.testRail.apiKey)
}

export function jiraConfigured() {
  return Boolean(config.jira.apiToken)
}

export function cursorConfigured() {
  return Boolean(config.cursor.apiKey)
}
