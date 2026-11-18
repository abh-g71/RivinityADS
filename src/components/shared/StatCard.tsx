import { BarChart3, CreditCard, Eye, MousePointer2, Percent, Target, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

type StatCardProps = {
  label: string
  value: string
  detail?: string
}

const iconRules: Array<{ pattern: RegExp; icon: LucideIcon }> = [
  { pattern: /(spend|earn|revenue|balance|budget|payout|fund)/, icon: CreditCard },
  { pattern: /(impression|view|traffic|visitor)/, icon: Eye },
  { pattern: /click/, icon: MousePointer2 },
  { pattern: /(ctr|rate|%)/, icon: Percent },
  { pattern: /(conversion|lead|goal)/, icon: Target },
]

export function StatCard({ label, value, detail = 'Mock data' }: StatCardProps) {
  const Icon = iconRules.find(({ pattern }) => pattern.test(label.toLowerCase()))?.icon ?? BarChart3

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 break-words text-2xl font-semibold tabular-nums text-navy-900">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </Card>
  )
}
