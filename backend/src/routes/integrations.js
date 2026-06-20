import { Router } from 'express'

import { config } from '../config.js'
import { getAutomationStatus } from '../services/automationScanner.js'
import { openAiConfigured } from '../services/openAiService.js'
import { getTestRailStatus } from '../services/testRailService.js'

const router = Router()

router.get('/status', (_req, res) => {
  res.json({
    jira: { configured: false, mode: 'mock', baseUrl: config.jira.baseUrl },
    testRail: getTestRailStatus(),
    automation: getAutomationStatus(),
    openAi: { configured: openAiConfigured() },
    mcp: {
      hint: 'Configure .cursor/mcp.json for TestRail and Playwright MCP in Cursor',
      servers: ['jetbrains', 'terminal', 'testrail'],
    },
  })
})

export default router
