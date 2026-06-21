import { createApp } from './app.js'
import { config, jiraConfigured } from './config.js'
import { connectDb } from './db/connect.js'
import { verifyJiraConnection } from './services/jiraService.js'

const dbConnected = await connectDb()

if (jiraConfigured()) {
  const jiraCheck = await verifyJiraConnection()
  if (jiraCheck.ok) {
    console.log(`[impactiq] Jira: connected as ${jiraCheck.displayName}`)
  } else {
    console.warn(`[impactiq] Jira: token set but connection failed — ${jiraCheck.reason}`)
  }
}

const app = createApp()

app.listen(config.port, () => {
  console.log(`[impactiq] Backend running on http://localhost:${config.port}`)
  console.log(`[impactiq] Health: http://localhost:${config.port}/api/health`)
  console.log(`[impactiq] Jira: ${jiraConfigured() ? 'API token configured' : 'mock catalog only'}`)
  console.log(`[impactiq] TestRail: ${config.testRail.user ? 'configured' : 'NOT configured (using case ID fallbacks)'}`)
  console.log(`[impactiq] Analysis: Cursor MCP prompts (no OpenAI key required)`)
  console.log(`[impactiq] Automation repo: ${config.automation.repoPath}`)
  console.log(`[impactiq] MongoDB: ${dbConnected ? 'connected' : 'not configured'}`)
})
