import { Router } from 'express'

import { runAnalysis, getAnalysisById, listAnalyses } from '../services/analysisService.js'
import { validateAnalyzeRequest } from '../middleware/validateAnalyze.js'

const router = Router()

router.post('/', validateAnalyzeRequest, async (req, res, next) => {
  try {
    const { ticketKeys, settings } = req.body
    const analysis = await runAnalysis({ ticketKeys, settings })
    res.json(analysis)
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50)
    const analyses = await listAnalyses(limit)
    res.json(analyses)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const analysis = await getAnalysisById(req.params.id)
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }
    res.json(analysis)
  } catch (err) {
    next(err)
  }
})

export default router
