import fsSync from 'fs'
import path from 'path'

import { Router } from 'express'

import { config } from '../config.js'
import { getAutomationStatus } from '../services/automationScanner.js'
import { getCursorMcpStatus } from '../services/cursorMcpAnalysisService.js'
import { getJiraStatus, verifyJiraConnection } from '../services/jiraService.js'
import { getSettings } from '../services/settingsStore.js'
import { getTestRailStatus } from '../services/testRailService.js'

const router = Router()

router.get('/status', async (req, res, next) => {
  try {
    const automationPath = req.query.automationPath || config.automation.repoPath

    const automation = {
      ...getAutomationStatus(),
      repoPath: automationPath,
      exists: fsSync.existsSync(automationPath),
      testFileCount: countTestFiles(automationPath),
    }

    const jiraStatus = getJiraStatus()
    let jiraConnection = null
    if (jiraStatus.configured) {
      jiraConnection = await verifyJiraConnection()
    }

    res.json({
      settings: getSettings(),
      jira: { ...jiraStatus, connection: jiraConnection },
      testRail: getTestRailStatus(),
      automation,
      cursor: getCursorMcpStatus(),
      mongo: { configured: Boolean(config.mongoUri) },
      mcp: {
        hint: 'Copy mcp.json.example to .cursor/mcp.json for TestRail and Playwright MCP in Cursor',
        servers: ['jetbrains', 'playwright', 'testrail'],
      },
    })
  } catch (err) {
    next(err)
  }
})

function countTestFiles(repoPath) {
  try {
    return walkTestFiles(path.join(repoPath, 'src', 'test', 'java')).length
  } catch {
    return 0
  }
}

function walkTestFiles(dir, files = []) {
  if (!fsSync.existsSync(dir)) return files
  for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkTestFiles(fullPath, files)
    } else if (entry.name.endsWith('Test.java')) {
      files.push(fullPath)
    }
  }
  return files
}

export default router
