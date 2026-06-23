import { Router } from 'express'

import {
  getDefaultSettings,
  getSettings,
  resetSettings,
  updateSettings,
} from '../services/settingsStore.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(getSettings())
})

router.put('/', async (req, res, next) => {
  try {
    res.json(await updateSettings(req.body))
  } catch (err) {
    next(err)
  }
})

router.post('/reset', async (_req, res, next) => {
  try {
    res.json(await resetSettings())
  } catch (err) {
    next(err)
  }
})

router.get('/defaults', (_req, res) => {
  res.json(getDefaultSettings())
})

export default router
