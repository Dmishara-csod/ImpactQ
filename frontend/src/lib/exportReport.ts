import type { ImpactAnalysis } from '@/types/analysis'

export function buildAnalysisReport(analysis: ImpactAnalysis): string {
  const gaps =
    analysis.coverageGaps.missingScenarios.length +
    analysis.coverageGaps.missingAutomation.length +
    analysis.coverageGaps.edgeCases.length

  const ticketsSection = analysis.tickets
    .map(
      (t) => `### ${t.key}: ${t.title}
- Status: ${t.status} | Priority: ${t.priority} | ${t.storyPoints} pts
- Assignee: ${t.assignee}
- Modules: ${t.modules.join(', ')}
- TestRail: ${t.impactedTestCases.join(', ') || 'None'}
- Automation: ${t.impactedAutomation.join(', ') || 'None'}`,
    )
    .join('\n\n')

  return `# ImpactIQ Analysis Report

**Jira tickets:** ${analysis.inputValue}
**Feature:** ${analysis.changeSummary.title}
**Risk:** ${analysis.risk.score}/100 (${analysis.risk.level})
**Repo:** ${analysis.automation.repo}

## Summary
${analysis.changeSummary.description}

**Modules:** ${analysis.changeSummary.modules.join(', ')}

## Jira tickets (${analysis.tickets.length})
${ticketsSection}

## Impacted TestRail (${analysis.testRail.testCases.length})
${analysis.testRail.testCases.map((c) => `- ${c.id}: ${c.title}`).join('\n')}

## Impacted automation (${analysis.automation.tests.length})
${analysis.automation.tests.map((t) => `- \`${t.testClass}\` — ${t.testMethods.join(', ')}`).join('\n')}

## Coverage gaps (${gaps})
${analysis.coverageGaps.missingScenarios.map((s) => `- ${s}`).join('\n')}

## Recommendations
${analysis.recommendations.map((r) => `- ${r}`).join('\n')}

## Suggested PR
Branch: \`${analysis.actionPlan.pr.branchName}\`
${analysis.actionPlan.pr.changes.map((c) => `- ${c.testFile}: ${c.summary}`).join('\n')}
`
}
