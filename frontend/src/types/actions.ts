export type ActionsTab = 'pr' | 'agent' | 'testrail'

export interface ActionsFocus {
  tab?: ActionsTab
  promptId?: string
}

/** Maps UI tab id to actionPlan key */
export const ACTION_PLAN_TAB_KEY: Record<ActionsTab, 'pr' | 'cursor' | 'testrail'> = {
  pr: 'pr',
  agent: 'cursor',
  testrail: 'testrail',
}
