import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'

export default function PublisherDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader breadcrumbs={[{ label: 'Publisher' }, { label: 'Home' }]} title="Home" description="A simpler overview of your publisher workspace." />
      <Card className="mt-6 flex flex-col gap-4 border-brand-100 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><p className="text-sm font-semibold text-brand-700">Your next best step</p><h2 className="mt-1 text-xl font-bold text-navy-900">Add your website</h2><p className="mt-1 text-sm text-slate-600">Add a site to start setting up placements.</p></div>
        <Link href="/publisher/websites" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Add website <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </Card>
      <section aria-label="Publisher summary" className="mt-5 grid gap-3 sm:grid-cols-3">
        {[['Websites', '0'], ['Results', '0'], ['Earnings', 'â‚¹0.00']].map(([label, value]) => <Card key={label} className="p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-2xl font-bold text-navy-900">{value}</p></Card>)}
      </section>
      <p className="mt-2 text-xs text-slate-500">Mock data Â· No live publisher activity</p>
      <Card className="mt-6 p-4 sm:p-5">
        <h2 className="font-semibold text-navy-900">Activity</h2>
        <p className="mt-1 text-xs text-slate-500">A simple view of your website activity.</p>
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <svg viewBox="0 0 640 140" role="img" aria-label="Publisher activity chart with no data yet" className="h-32 w-full">
            <path d="M24 20H616M24 60H616M24 100H616M24 130H616" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M24 130H616" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="text-center text-xs text-slate-500">Activity will appear here after you add a website.</p>
        </div>
      </Card>
      <details className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy-900">More publisher tools</summary>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/publisher/placements" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-700 hover:bg-slate-50">Placements</Link>
          <Link href="/publisher/statistics" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-700 hover:bg-slate-50">Statistics</Link>
          <Link href="/publisher/earnings" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-700 hover:bg-slate-50">Earnings</Link>
          <Link href="/publisher/payments" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-700 hover:bg-slate-50">Payments</Link>
        </div>
      </details>
    </div>
  )
}
