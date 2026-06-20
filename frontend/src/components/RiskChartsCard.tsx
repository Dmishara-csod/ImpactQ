import { BarChart3 } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTheme } from '@/hooks/useTheme'
import type { ImpactAnalysis, RiskLevel } from '@/types/analysis'

interface RiskChartsCardProps {
  analysis: ImpactAnalysis
}

const riskColors: Record<RiskLevel, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
}

const riskVariant: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
}

const coverageColors = ['#6366f1', '#0ea5e9', '#ef4444']

export function RiskChartsCard({ analysis }: RiskChartsCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const tickColor = isDark ? '#94a3b8' : '#64748b'
  const gaugeBg = isDark ? '#334155' : '#e2e8f0'
  const tooltipStyle = {
    borderRadius: 8,
    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
    fontSize: 12,
  }

  const { risk, changeSummary, codeImpact, testRail, automation, coverageGaps } =
    analysis

  const gapCount =
    coverageGaps.missingScenarios.length +
    coverageGaps.missingAutomation.length +
    coverageGaps.edgeCases.length

  const riskGaugeData = [
    { name: 'Risk', value: risk.score, fill: riskColors[risk.level] },
  ]

  const impactData = changeSummary.modules.map((module) => ({
    module,
    files: Math.max(
      1,
      codeImpact.files.filter((file) =>
        file.toLowerCase().includes(module.slice(0, 4)),
      ).length,
    ),
    tests:
      testRail.testCases.filter((tc) =>
        tc.title.toLowerCase().includes(module),
      ).length +
      automation.tests.filter((t) =>
        t.file.toLowerCase().includes(module),
      ).length,
  }))

  const coverageData = [
    { name: 'TestRail', value: testRail.testCases.length },
    { name: 'Automation', value: automation.tests.length },
    { name: 'Gaps', value: gapCount },
  ]

  const riskBreakdown = [
    { label: 'Modules', value: changeSummary.modules.length },
    { label: 'Files', value: codeImpact.files.length },
    { label: 'Auto gaps', value: coverageGaps.missingAutomation.length },
    { label: 'Edge cases', value: coverageGaps.edgeCases.length },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5" />
          Risk & coverage
        </CardTitle>
        <CardDescription>Visual release readiness assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="100%"
                barSize={10}
                data={riskGaugeData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background={{ fill: gaugeBg }}
                  dataKey="value"
                  cornerRadius={6}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{risk.score}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="space-y-2">
            <Badge variant={riskVariant[risk.level]} className="text-sm">
              {risk.level} RISK
            </Badge>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {risk.factors.slice(0, 3).map((factor) => (
                <li key={factor}>• {factor}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Module impact
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={impactData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="module"
                tick={{ fontSize: 11, fill: tickColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="files" name="Files" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tests" name="Tests" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Test coverage mix
            </p>
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie
                  data={coverageData}
                  dataKey="value"
                  innerRadius={28}
                  outerRadius={44}
                  paddingAngle={3}
                >
                  {coverageData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={coverageColors[index % coverageColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              {coverageData.map((item, index) => (
                <span key={item.name} className="flex items-center gap-1">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: coverageColors[index] }}
                  />
                  {item.name} ({item.value})
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Risk drivers
            </p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart
                layout="vertical"
                data={riskBreakdown}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={64}
                  tick={{ fontSize: 10, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar
                  dataKey="value"
                  fill={riskColors[risk.level]}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
