import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StaggerGrid } from '@/components/shared/StaggerGrid'
import { mockPublisherChecklist, mockPublisherStats } from '@/data/publisher'

const checklistItems = [
  { title: 'Add website', href: '/publisher/websites' },
  { title: 'Verify ownership', href: '/publisher/websites' },
  { title: 'Create placement', href: '/publisher/placements' },
  { title: 'Add ad code to your site', href: '/publisher/placements' },
]

export default function PublisherDashboardPage() {
  const progress = Math.round(
    (mockPublisherChecklist.completed / mockPublisherChecklist.total) * 100,
  )
  const circumference = 2 * Math.PI * 26

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Publisher' }, { label: 'Dashboard' }]}
        title="Start earning"
        description="A mock overview of your publisher activity."
        action={
          <div className="flex items-center gap-3">
            <Badge tone="neutral">Mock data</Badge>
            <Link href="/publisher/websites" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Add website</Link>
          </div>
        }
      />

      <StaggerGrid aria-label="Publisher statistics" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockPublisherStats.length ? mockPublisherStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        )) : <EmptyState title="No mock statistics" description="No sample publisher metrics are configured." />}
      </StaggerGrid>

      <section aria-labelledby="earning-checklist" className="mt-8">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 id="earning-checklist" className="text-lg font-semibold text-navy-900">Start earning</h2>
              <p className="mt-1 text-sm text-slate-600">Complete these setup steps to prepare your website.</p>
            </div>
            <div className="flex items-center gap-3" aria-label={`${progress}% setup complete`}>
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" role="img" aria-label={`${progress}% complete`}>
                <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress / 100)}
                  className="text-brand-600"
                />
              </svg>
              <span className="text-sm font-semibold text-navy-900">{progress}%</span>
            </div>
          </div>

          <ol className="mt-5 divide-y divide-slate-100">
            {checklistItems.map((item, index) => (
              <li key={item.title} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item.title}</span>
                </div>
                <Link href={item.href} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  Open
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <p className="mt-5 text-xs text-slate-500">
        Values shown are mock examples. <Link href="/publisher/earnings" className="font-medium text-brand-700 hover:underline">View earnings</Link>
      </p>
    </div>
  )
}
