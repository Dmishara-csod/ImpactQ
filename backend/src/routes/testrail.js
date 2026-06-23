import { Router } from 'express'

import {
  findCreatedCaseByTitle,
  getCreatedCasesForAnalysis,
  listAllCreatedForAnalysis,
  saveCreatedCaseForAction,
} from '../services/testRailActionStore.js'
import { createTestCase, getTestRailStatus } from '../services/testRailService.js'
import { scenarioActionId } from '../utils/testScenarioUtils.js'

const router = Router()

router.get('/status', (_req, res) => {
  res.json(getTestRailStatus())
})

router.get('/actions/:analysisId', (req, res) => {
  const analysisId = req.params.analysisId
  res.json({
    analysisId,
    actions: getCreatedCasesForAnalysis(analysisId),
    createdCases: listAllCreatedForAnalysis(analysisId),
  })
})

router.post('/actions/run', async (req, res, next) => {
  try {
    const {
      analysisId,
      actionId,
      title,
      suite,
      steps,
      projectId,
      jiraKeys,
      impactedCases = [],
      cursorPrompt,
    } = req.body

    if (!analysisId || !actionId) {
      return res.status(400).json({ error: 'analysisId and actionId are required' })
    }
    if (!title?.trim()) {
      return res.status(400).json({ error: 'title is required' })
    }

    const resolvedActionId = actionId || scenarioActionId(title.trim())
    const existingByAction = getCreatedCasesForAnalysis(analysisId)[resolvedActionId]
    const existingByTitle = findCreatedCaseByTitle(analysisId, title)

    const existing = existingByAction?.created ? existingByAction : existingByTitle
    if (existing?.created) {
      return res.json({
        analysisId,
        actionId: resolvedActionId,
        created: existing.created,
        impactedCases: existing.impactedCases || impactedCases,
        allCreatedCases: listAllCreatedForAnalysis(analysisId),
        message: `Case ${existing.created.id} already created for this scenario`,
        alreadyExists: true,
      })
    }

    const created = await createTestCase({
      title: title.trim(),
      suite: suite || 'Admin Theme & Branding',
      steps: steps || [],
      projectId,
      jiraKeys: jiraKeys || [],
    })

    const record = await saveCreatedCaseForAction(analysisId, resolvedActionId, {
      actionId: resolvedActionId,
      title: title.trim(),
      suite: suite || 'Admin Theme & Branding',
      jiraKeys: jiraKeys || [],
      cursorPrompt,
      created,
      impactedCases,
    })

    res.status(201).json({
      analysisId,
      actionId: resolvedActionId,
      created,
      impactedCases,
      allCreatedCases: listAllCreatedForAnalysis(analysisId),
      message: `Test case ${created.id} created and saved to backend`,
      record,
    })
  } catch (err) {
    next(err)
  }
})

export default router
