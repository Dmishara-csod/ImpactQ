import { Router } from 'express'

import { listAnalysisSummaries, getAnalysisById } from '../services/analysisService.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50)
    const summaries = await listAnalysisSummaries(limit)
    res.json({ items: summaries, persisted: summaries.length > 0 })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const analysis = await getAnalysisById(req.params.id)
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found', persisted: false })
    }
    res.json(analysis)
  } catch (err) {
    next(err)
  }
})

export default router
