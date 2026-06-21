import express from 'express'
import cors from 'cors'
import fsSync from 'fs'

import { config, jiraConfigured, testRailConfigured } from './config.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import analyzeRoutes from './routes/analyze.js'
import historyRoutes from './routes/history.js'
import integrationRoutes from './routes/integrations.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'impactiq-backend',
      version: '1.0.0',
      integrations: {
        jira: jiraConfigured(),
        testRail: testRailConfigured(),
        mongo: Boolean(config.mongoUri),
        cursorMcp: true,
        automationRepo: fsSync.existsSync(config.automation.repoPath),
      },
    })
  })

  app.use('/api/analyze', analyzeRoutes)
  app.use('/api/history', historyRoutes)
  app.use('/api/integrations', integrationRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
