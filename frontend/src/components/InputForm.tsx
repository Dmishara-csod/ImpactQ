import { type FormEvent, useState } from 'react'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AnalysisInput } from '@/types/analysis'

interface InputFormProps {
  onSubmit: (input: AnalysisInput) => void
  isLoading: boolean
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [value, setValue] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!value.trim()) return
    onSubmit({ inputType: 'jira', inputValue: value.trim() })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Analyze testing impact
        </h2>
        <p className="mt-2 text-muted-foreground">
          Submit a Jira story to identify impacted tests, coverage gaps, and
          release risk.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jira story</CardTitle>
          <CardDescription>
            Enter a Jira story ID or URL to run impact analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jira-input">Jira story ID or URL</Label>
              <Input
                id="jira-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. PROJ-482 — Add support for partial refunds in checkout"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !value.trim()}>
              {isLoading ? 'Analyzing change…' : 'Run impact analysis'}
              {!isLoading && <ArrowRight className="size-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
