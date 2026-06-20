import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ImpactAnalysis } from '@/types/analysis'

interface CodeImpactCardProps {
  codeImpact: ImpactAnalysis['codeImpact']
}

export function CodeImpactCard({ codeImpact }: CodeImpactCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Impacted page objects & services</CardTitle>
        <CardDescription>
          Affected Java page objects from galaxy-automation codebase analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="mb-2 text-sm font-medium">Files</p>
          <div className="flex flex-wrap gap-2">
            {codeImpact.files.map((file) => (
              <Badge key={file} variant="outline" className="font-mono">
                {file}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Services</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {codeImpact.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Components</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {codeImpact.components.map((component) => (
              <li key={component}>{component}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
