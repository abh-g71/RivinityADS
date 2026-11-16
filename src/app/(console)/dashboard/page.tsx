'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, BarChart3, CircleHelp } from 'lucide-react'
import { Switch } from '@/components/primitives/switch'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockAdvertiserCampaigns } from '@/data/advertiser'
import { campaignDraftStorageKey } from '@/features/advertiser/campaignTemplates'

type DraftSummary = { headline?: string; objective?: string }
type CampaignRow = (typeof mockAdvertiserCampaigns)[number]

export default function AdvertiserDashboardPage() {
  const [hasDraft, setHasDraft] = useState(false)
  const [draftSummary, setDraftSummary] = useState<DraftSummary>({})
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(mockAdvertiserCampaigns.slice(0, 3))

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(campaignDraftStorageKey)
        if (!saved) return
        const draft: unknown = JSON.parse(saved)
        if (draft && typeof draft === 'object') {
          const summary = draft as DraftSummary
          setHasDraft(true)
          setDraftSummary(summary)
        }
      } catch (error) {
        console.error('Unable to read saved campaign draft', error)
      }
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader breadcrumbs={[{ label: 'Advertiser workspace' }, { label: 'Home' }]} title="Home" description="A clear overview of your advertising workspace." />
      <Card className="mt-6 flex flex-col gap-4 border-brand-100 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold text-brand-700">Your next best step</p>
          <h2 className="mt-1 text-xl font-bold text-navy-900">Create a campaign</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">Choose a goal and follow four short steps. Your draft stays saved in this browser.</p>
        </div>
        <ButtonLink href="/campaigns/new" className="shrink-0">Create campaign <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
      </Card>

      <section aria-label="Campaign summary" className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Spend', value: '₹0.00' },
          { label: 'Results', value: '0' },
          { label: 'Cost per result', value: '—' },
        ].map((stat) => <Card key={stat.label} className="p-4"><p className="text-sm text-slate-600">{stat.label}</p><p className="mt-2 text-2xl font-bold text-navy-900">{stat.value}</p></Card>)}
      </section>
      <p className="mt-2 text-xs text-slate-500">Mock data · No live campaign activity</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-semibold text-navy-900">Campaign activity</h2><p className="mt-1 text-xs text-slate-500">A simple view of activity over time.</p></div>
            <BarChart3 className="h-5 w-5 text-brand-600" aria-hidden="true" />
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <svg viewBox="0 0 640 160" role="img" aria-label="Campaign activity chart with no data yet" className="h-36 w-full">
              <path d="M24 24H616M24 68H616M24 112H616M24 148H616" stroke="#e2e8f0" strokeWidth="1" />
              <path d="M24 148H616" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="text-center text-xs text-slate-500">Activity will appear here after a campaign starts.</p>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-semibold text-navy-900">Continue where you left off</h2><p className="mt-1 text-xs text-slate-500">Drafts are saved in this browser.</p></div>
            <CircleHelp className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            {hasDraft ? (
              <>
                <p className="text-sm font-semibold text-navy-900">{draftSummary.headline || draftSummary.objective || 'Campaign draft'}</p>
                <p className="mt-1 text-sm text-slate-600">Continue editing your saved draft.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-navy-900">No saved draft yet</p>
                <p className="mt-1 text-sm text-slate-600">Your progress will appear here when you start a campaign.</p>
              </>
            )}
            <Link href="/campaigns/new/manual" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              {hasDraft ? 'Continue draft' : 'Start a campaign'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </div>

      <Card className="mt-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold text-navy-900">Campaigns</h2><p className="mt-1 text-xs text-slate-500">Switch campaign delivery on or off.</p></div>
          <Link href="/campaigns" className="text-sm font-semibold text-brand-700 hover:underline">View all campaigns</Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {campaigns.map((campaign) => {
            const enabled = campaign.status === 'Active'
            return (
              <li key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium text-navy-900">{campaign.name}</p><p className="mt-1 text-xs text-slate-500">{campaign.campaignType} · {campaign.country}</p></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{enabled ? 'On' : 'Off'}</span>
                  <Switch checked={enabled} onCheckedChange={(checked) => setCampaigns((current) => current.map((item) => item.id === campaign.id ? { ...item, status: checked ? 'Active' : 'Paused' } : item))} aria-label={`${enabled ? 'Turn off' : 'Turn on'} ${campaign.name}`} />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
