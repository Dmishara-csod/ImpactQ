import { Router } from 'express'

import { runAnalysis, getAnalysisById, listAnalyses } from '../services/analysisService.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { ticketKeys, settings } = req.body

    if (!ticketKeys?.length) {
      return res.status(400).json({ error: 'ticketKeys array is required' })
    }

    const analysis = await runAnalysis({ ticketKeys, settings })
    res.json(analysis)
  } catch (err) {
    console.error('[analyze]', err)
    res.status(500).json({ error: err.message || 'Analysis failed' })
  }
})

router.get('/', async (_req, res) => {
  try {
    const analyses = await listAnalyses()
    res.json(analyses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const analysis = await getAnalysisById(req.params.id)
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' })
    res.json(analysis)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
