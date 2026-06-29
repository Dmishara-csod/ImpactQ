import type { ImpactAnalysis } from '@/types/analysis'
import type { ActionsTab } from '@/types/actions'
import type { AffectedCase, CaseImpactStatus } from '@/types/affectedCase'

export interface CaseActionTarget {
  tab: ActionsTab
  promptId?: string
  promptText: string
  label: string
}

export function resolveCaseActionTarget(
  analysis: ImpactAnalysis,
  affectedCase: AffectedCase,
): CaseActionTarget | null {
  const { cursor, testRail, pr } = analysis.actionPlan
  const ticketRef = affectedCase.linkedTickets.map((t) => t.key).join(', ')

  if (
    affectedCase.status === 'coverage_gap' ||
    affectedCase.status === 'manual_review'
  ) {
    const tr = testRail.find(
      (a) =>
        affectedCase.name.toLowerCase().includes(a.title.toLowerCase().slice(0, 20)) ||
        a.title.toLowerCase().includes(affectedCase.name.toLowerCase().slice(0, 20)),
    )
    if (tr) {
      return {
        tab: 'testrail',
        promptId: tr.id,
        promptText: tr.cursorPrompt,
        label: `Create TestRail case: ${tr.title}`,
      }
    }
    return {
      tab: 'testrail',
      promptText: `Using TestRail MCP (project ${analysis.testRail.projectId}), create test case:
Title: ${affectedCase.name}
Suite: ${affectedCase.suite}
Link to Jira: ${ticketRef || 'TBD'}`,
      label: 'Generate TestRail prompt',
    }
  }

  if (affectedCase.status === 'update_automation') {
    const match = cursor.find((a) => a.id !== 'cursor-gap-analysis')
    if (match) {
      return {
        tab: 'agent',
        promptId: match.id,
        promptText: match.cursorPrompt,
        label: `Update automation for ${affectedCase.id}`,
      }
    }
  }

  const gap = cursor.find((a) => a.id === 'cursor-gap-analysis')
  if (gap && affectedCase.status !== 'covered') {
    return {
      tab: 'agent',
      promptId: gap.id,
      promptText: gap.cursorPrompt,
      label: 'Run gap analysis via AI agent',
    }
  }

  if (affectedCase.status === 'covered') {
    return {
      tab: 'pr',
      promptText: pr.prBody,
      label: 'View PR template',
    }
  }

  return null
}

export function countByImpactStatus(cases: AffectedCase[]): Record<CaseImpactStatus, number> {
  return cases.reduce(
    (acc, c) => {
      acc[c.status] += 1
      return acc
    },
    {
      update_automation: 0,
      manual_review: 0,
      coverage_gap: 0,
      covered: 0,
    } as Record<CaseImpactStatus, number>,
  )
}
