import { ProgressRing } from '@/components/shared/ProgressRing'
import { StatCard } from '@/components/shared/StatCard'
import { StaggerGrid } from '@/components/shared/StaggerGrid'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockAdvertiserStats } from '@/data/advertiser'

const setupSteps = [
  { title: 'Add funds', description: 'Choose a mock funding option to prepare your balance.', href: '/add-funds', action: 'Add funds' },
  { title: 'Check traffic', description: 'Review sample traffic information for your audience.', href: '/traffic-chart', action: 'View traffic' },
  { title: 'Create campaign', description: 'Set up your campaign settings and targeting.', href: '/campaigns/new', action: 'Create campaign' },
  { title: 'Track results', description: 'Review mock campaign statistics and activity.', href: '/campaigns', action: 'View campaigns' },
]

export default function AdvertiserDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser workspace' }, { label: 'Dashboard' }]}
        title="Dashboard"
        description="A mock overview of campaign activity."
        action={<ButtonLink href="/campaigns/new">Create campaign</ButtonLink>}
      />

      <StaggerGrid aria-label="Campaign statistics" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockAdvertiserStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </StaggerGrid>

      <section aria-labelledby="first-campaign-heading" className="mt-8">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 id="first-campaign-heading" className="text-lg font-semibold text-navy-900">
                Launch your first campaign
              </h2>
              <p className="mt-1 text-sm text-slate-600">A few steps help you get campaign-ready.</p>
            </div>
            <ProgressRing value={0} label="0/4" />
          </div>

          <ol className="mt-5 space-y-3">
            {setupSteps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-navy-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
                <ButtonLink href={step.href} variant="outline" className="shrink-0 px-3 py-2 sm:ml-auto">
                  {step.action}
                </ButtonLink>
              </li>
            ))}
          </ol>
        </Card>
      </section>
    </div>
  )
}
