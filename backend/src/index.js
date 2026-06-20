import { createApp } from './app.js'
import { config } from './config.js'
import { connectDb } from './db/connect.js'

await connectDb()

const app = createApp()

app.listen(config.port, () => {
  console.log(`[impactiq] Backend running on http://localhost:${config.port}`)
  console.log(`[impactiq] TestRail: ${config.testRail.user ? 'configured' : 'NOT configured'}`)
  console.log(`[impactiq] Automation repo: ${config.automation.repoPath}`)
})
