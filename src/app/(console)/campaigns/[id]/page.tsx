'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ArrowLeft, Clock, Pause, Pencil, Play, Wallet } from 'lucide-react'
import {
  mockAdvertiserAdSets,
  mockAdvertiserAds,
  mockAdvertiserCampaigns,
  type CampaignStatus,
} from '@/data/advertiser'

const DOT: Record<CampaignStatus, string> = { Active: 'bg-green-500', Paused: 'bg-amber-500', Pending: 'bg-brand-600', Draft: 'bg-slate-400' }
const TABS = ['Overview', 'Ad sets', 'Ads'] as const
type Tab = (typeof TABS)[number]

const amount = (v: string) => {
  const n = Number(v.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}
const num = (n: number) => n.toLocaleString('en-IN')
const day = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const campaign = mockAdvertiserCampaigns.find((c) => c.id === id)
  const [tab, setTab] = useState<Tab>('Overview')
  const [paused, setPaused] = useState(campaign?.status === 'Paused')

  const adSets = useMemo(() => mockAdvertiserAdSets.filter((a) => a.campaignId === id), [id])
  const ads = useMemo(() => mockAdvertiserAds.filter((a) => a.campaignId === id), [id])

  if (!campaign) notFound()

  const canToggle = campaign.status === 'Active' || campaign.status === 'Paused'
  const status: CampaignStatus = canToggle ? (paused ? 'Paused' : 'Active') : campaign.status
  const spent = amount(campaign.spent)
  const total = amount(campaign.totalBudget)
  const usedPct = total ? Math.round((spent / total) * 100) : 0

  const info = [
    { label: 'Campaign ID', value: campaign.id },
    { label: 'Ad format', value: campaign.campaignType },
    { label: 'Country', value: campaign.country },
    { label: 'Created', value: day(campaign.createdDate) },
    { label: 'Last updated', value: day(campaign.updatedDate) },
    { label: 'Daily budget', value: campaign.dailyBudget },
  ]
  const kpis = [
    { label: 'Spent', value: campaign.spent },
    { label: 'Impressions', value: num(campaign.impressions) },
    { label: 'Clicks', value: num(campaign.clicks) },
    { label: 'CTR', value: campaign.ctr },
    { label: 'Conversions', value: num(campaign.conversions) },
    { label: 'Cost per result', value: campaign.ecpa },
  ]

  const tasks: { icon: typeof Clock; title: string; meta: string; href: string; cta: string }[] = []
  if (usedPct >= 70) tasks.push({ icon: Wallet, title: `${usedPct}% of the budget is used`, meta: `${campaign.budgetLeft} left`, href: '/add-funds', cta: 'Add funds' })
  if (campaign.status === 'Pending') tasks.push({ icon: Clock, title: 'This campaign is in review', meta: 'Usually a few hours', href: '/campaigns', cta: 'All campaigns' })
  if (campaign.status === 'Draft') tasks.push({ icon: Pencil, title: 'Finish setting up this draft', meta: 'Saved automatically', href: '/campaigns/new/manual', cta: 'Continue' })

  return (
    <div className="space-y-4">
      <div>
        <Link href="/campaigns" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Campaigns
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{campaign.name}</h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                <span className={`h-2 w-2 rounded-full ${DOT[status]}`} aria-hidden="true" />{status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{campaign.campaignType} · {campaign.country} · Sample data</p>
          </div>
          {canToggle && (
            <button type="button" onClick={() => setPaused((p) => !p)} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
              {paused ? 'Resume delivery' : 'Pause delivery'}
            </button>
          )}
        </div>
      </div>

      <div role="tablist" aria-label="Campaign sections" className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => {
          const count = t === 'Ad sets' ? adSets.length : t === 'Ads' ? ads.length : null
          return (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${tab === t ? 'border-brand-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
              {t}{count !== null ? ` (${count})` : ''}
            </button>
          )
        })}
      </div>

      {tab === 'Overview' && (
        <div className="grid grid-cols-12 items-start gap-4">
          <div className="col-span-12 space-y-4 xl:col-span-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">{k.label}</p>
                  <p className="mt-1.5 text-xl font-semibold tabular-nums text-slate-900">{k.value}</p>
                </div>
              ))}
            </div>
            <section className="rounded-lg border border-slate-200 bg-white p-4" aria-label="Budget">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-slate-900">Budget</h2>
                <p className="text-sm tabular-nums text-slate-700">{campaign.spent} / {campaign.totalBudget}</p>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.min(100, usedPct)}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{usedPct}% used · {campaign.budgetLeft} left</p>
            </section>
          </div>

          <div className="col-span-12 space-y-4 xl:col-span-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4" aria-label="Details">
              <h2 className="text-base font-semibold text-slate-900">Details</h2>
              <dl className="mt-3 divide-y divide-slate-100">
                {info.map((i) => (
                  <div key={i.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <dt className="text-slate-500">{i.label}</dt>
                    <dd className="text-right font-medium text-slate-900">{i.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-4" aria-label="Tasks">
              <h2 className="text-base font-semibold text-slate-900">Tasks to complete</h2>
              {tasks.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Nothing needs your attention.</p>
              ) : (
                <ul className="mt-2 divide-y divide-slate-100">
                  {tasks.map((t) => (
                    <li key={t.title} className="flex items-center gap-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><t.icon className="h-4 w-4" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{t.title}</p>
                        <p className="text-xs text-slate-500">{t.meta}</p>
                      </div>
                      <Link href={t.href} className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">{t.cta}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      {tab !== 'Overview' && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-label={tab}>
          {(tab === 'Ad sets' ? adSets : ads).length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No {tab.toLowerCase()} yet for this campaign.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">ID</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Ad format</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab === 'Ad sets' ? adSets : ads).map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-600">{r.id}</td>
                      <td className="px-3 py-3"><span className="inline-flex items-center gap-2 text-slate-700"><span className={`h-2 w-2 rounded-full ${DOT[r.status]}`} aria-hidden="true" />{r.status}</span></td>
                      <td className="px-4 py-3 text-slate-700">{r.adUnit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}