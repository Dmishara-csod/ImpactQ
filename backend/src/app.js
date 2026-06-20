import express from 'express'
import cors from 'cors'

import { config } from './config.js'
import analyzeRoutes from './routes/analyze.js'
import integrationRoutes from './routes/integrations.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    }),
  )
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'impactiq-backend' })
  })

  app.use('/api/analyze', analyzeRoutes)
  app.use('/api/integrations', integrationRoutes)

  return app
}
