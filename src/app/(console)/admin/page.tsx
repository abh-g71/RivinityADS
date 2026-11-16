import Link from 'next/link'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StaggerGrid } from '@/components/shared/StaggerGrid'
import {
  mockAdminActivity,
  mockAdminCampaignReviews,
  mockAdminSupportTickets,
  mockAdminUsers,
  mockAdminWebsites,
} from '@/data/admin'

const reviewWebsiteCount = mockAdminWebsites.filter((website) => website.status === 'Pending').length
const reviewCampaignCount = mockAdminCampaignReviews.filter((campaign) => campaign.status === 'Pending').length
const openTicketCount = mockAdminSupportTickets.filter((ticket) => ticket.status !== 'Resolved').length

const stats = [
  { label: 'Mock users', value: String(mockAdminUsers.length) },
  { label: 'Websites in review', value: String(reviewWebsiteCount) },
  { label: 'Campaigns in review', value: String(reviewCampaignCount) },
  { label: 'Open support tickets', value: String(openTicketCount) },
]

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        title="Admin dashboard"
        description="Review mock platform queues and activity. No production operations are available here."
        action={<Link href="/admin/campaigns" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Review campaigns</Link>}
      />

      <StaggerGrid aria-label="Mock platform statistics" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.label} label={stat.label} value={stat.value} detail="Mock fixture count" />)}
      </StaggerGrid>

      <section aria-labelledby="admin-activity" className="mt-8">
        <h2 id="admin-activity" className="mb-4 text-lg font-semibold text-navy-900">Recent activity</h2>
        {mockAdminActivity.length ? (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {mockAdminActivity.map((activity) => (
              <li key={activity.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <span className="text-sm text-navy-900">{activity.description}</span>
                <span className="text-xs text-slate-500">{activity.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No recent activity" description="Mock admin activity will appear here when fixtures are provided." />
        )}
      </section>
    </div>
  )
}
