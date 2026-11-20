'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { mockAdvertiserCampaigns, type CampaignStatus } from '@/data/advertiser'

type Range = 7 | 30 | 90
type Metric = 'Impressions' | 'Clicks' | 'Spend'
type Campaign = {
  id: string
  name: string
  format: string
  status: CampaignStatus
  spend: number
  impressions: number
  clicks: number
  conversions: number
}

const parseAmount = (value: string) => Number(value.replace(/[^\d.-]/g, '')) || 0
const campaigns: Campaign[] = mockAdvertiserCampaigns.map((item) => ({
  id: item.id,
  name: item.name,
  format: item.campaignType,
  status: item.status,
  spend: parseAmount(item.spent),
  impressions: item.impressions,
  clicks: item.clicks,
  conversions: item.conversions,
}))
const inr = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`
const compact = (value: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 0 }).format(value)
const statusDot: Record<CampaignStatus, string> = {
  Active: 'bg-emerald-500', Paused: 'bg-zinc-400', Pending: 'bg-amber-500', Draft: 'bg-zinc-300',
}

function makeSeries(base: number, count: number, seed: number) {
  let state = seed
  return Array.from({ length: count }, (_, index) => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return Math.max(1, base * (0.7 + 0.55 * (index / Math.max(1, count - 1)) + (state / 4294967296 - 0.5) * 0.18))
  })
}
function Sparkline({ values, accent = false }: { values: number[]; accent?: boolean }) {
  const max = Math.max(...values)
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${28 - (value / max) * 24}`).join(' ')
  return <svg viewBox="0 0 100 30" className="h-8 w-20 shrink-0" aria-hidden="true"><polyline points={points} fill="none" stroke={accent ? '#10B981' : '#71717A'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
}
function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-xl border border-zinc-200/80 bg-white p-5 shadow-none ${className}`}>{children}</section>
}
function RangeBars({ values, range }: { values: number[]; range: Range }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...values)
  const peak = values.indexOf(max)
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const labels = range === 7
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : range === 30
      ? values.map((_, index) => `${(index + 1) * 3}D`)
      : values.map((_, index) => `W${index + 1}`)
  return <>
    <div className="mt-4 flex h-44 items-end justify-between gap-1.5" role="img" aria-label={`Daily spend for ${range} days`}>
      {values.map((value, index) => <div key={index} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end" onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} title={`${labels[index]}: ${inr(value)}`}><span className="mb-1 whitespace-nowrap font-sans text-[11px] leading-4 tabular-nums text-zinc-600">{inr(value)}</span><span className={`w-3 rounded-full transition-colors group-hover:bg-emerald-400 ${index === peak ? 'bg-emerald-500' : 'bg-zinc-300'}`} style={{ height: `${Math.max(8, (value / max) * 100)}%` }} />{hover === index && <span className="absolute bottom-[calc(100%-12px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-950 px-2 py-1 font-sans text-[10px] tabular-nums text-white">{inr(value)}</span>}<span className="mt-1 font-sans text-[11px] leading-4 tabular-nums text-zinc-600">{labels[index]}</span></div>)}
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3"><div><p className="text-xs text-zinc-500">Peak day</p><p className="mt-0.5 font-sans text-sm font-semibold tabular-nums text-zinc-900">{inr(max)}</p></div><div><p className="text-xs text-zinc-500">Avg daily spend</p><p className="mt-0.5 font-sans text-sm font-semibold tabular-nums text-zinc-900">{inr(avg)}</p></div></div>
  </>
}
function PerformanceChart({ metric, range, values }: { metric: Metric; range: Range; values: number[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 360, H = 164, left = 48, right = 8, top = 10, bottom = 18
  const max = Math.max(...values) * 1.12
  const x = (index: number) => left + index / (values.length - 1) * (W - left - right)
  const y = (value: number) => top + (1 - value / max) * (H - top - bottom)
  const line = values.map((value, index) => `${x(index)},${y(value)}`).join(' ')
  const area = `${left},${H - bottom} ${line} ${W - right},${H - bottom}`
  const selected = hover ?? values.length - 1
  const valueLabel = (value: number) => metric === 'Spend' ? inr(value) : compact(value)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-3 h-[156px] w-full"
      role="img"
      aria-label={`${metric} trend across ${range} days`}
      onMouseLeave={() => setHover(null)}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const px = (event.clientX - bounds.left) / bounds.width * W
        const nearest = Math.round((px - left) / (W - left - right) * (values.length - 1))
        setHover(Math.max(0, Math.min(values.length - 1, nearest)))
      }}
    >
    {[0, 1, 2, 3].map((step) => { const value = Math.round(max * (3 - step) / 3); const gy = top + step / 3 * (H - top - bottom); return <g key={step}><line x1={left} x2={W - right} y1={gy} y2={gy} stroke="#E4E4E7" /><text x={left - 6} y={gy + 4} textAnchor="end" fontFamily="var(--font-sans)" fontVariant="tabular-nums" fontSize="12" fill="#71717A">{valueLabel(value)}</text></g> })}
    <polygon points={area} fill="#10B981" fillOpacity="0.09" /><polyline points={line} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    {hover !== null && <g><line x1={x(selected)} x2={x(selected)} y1={top} y2={H - bottom} stroke="#A1A1AA" strokeDasharray="3 3" /><circle cx={x(selected)} cy={y(values[selected])} r="3.5" fill="#fff" stroke="#10B981" strokeWidth="2" /><rect x={Math.min(W - 74, Math.max(left, x(selected) - 34))} y={Math.max(top, y(values[selected]) - 25)} width="70" height="19" rx="3" fill="#09090B" /><text x={Math.min(W - 74, Math.max(left, x(selected) - 34)) + 6} y={Math.max(top, y(values[selected]) - 25) + 13} fontFamily="var(--font-sans)" fontVariant="tabular-nums" fontSize="9" fill="#fff">{valueLabel(values[selected])}</text></g>}
    </svg>
  )
}

export default function AdvertiserDashboard() {
  const [range, setRange] = useState<Range>(30)
  const [metric, setMetric] = useState<Metric>('Impressions')
  const spend = campaigns.reduce((total, campaign) => total + campaign.spend, 0)
  const impressions = campaigns.reduce((total, campaign) => total + campaign.impressions, 0)
  const clicks = campaigns.reduce((total, campaign) => total + campaign.clicks, 0)
  const conversions = campaigns.reduce((total, campaign) => total + campaign.conversions, 0)
  const scale = range === 7 ? 0.24 : range === 30 ? 1 : 2.85
  const ctr = clicks / Math.max(1, impressions) * 100
  const roas = conversions * 100 / Math.max(1, spend)
  const trendValues = useMemo(() => {
    const base = metric === 'Spend' ? spend / range : metric === 'Clicks' ? clicks / range : impressions / range
    return makeSeries(base, 12, range + metric.length * 17)
  }, [clicks, impressions, metric, range, spend])
  const dailySpend = useMemo(() => makeSeries(spend / Math.min(range, 30), range === 7 ? 7 : range === 30 ? 10 : 12, range * 11).map(Math.round), [range, spend])
  const kpis = [
    { label: 'Total spend', value: inr(spend * scale), secondary: undefined, delta: '+8.2%', values: makeSeries(spend * scale, 10, range + 1) },
    { label: 'Impressions', value: compact(impressions * scale), secondary: undefined, delta: '+12.4%', values: makeSeries(impressions * scale, 10, range + 2) },
    { label: 'Clicks (CTR)', value: Math.round(clicks * scale).toLocaleString('en-IN'), secondary: `${ctr.toFixed(2)}%`, delta: '+9.1%', values: makeSeries(clicks * scale, 10, range + 3) },
    { label: 'Conversions (ROAS)', value: `${Math.round(conversions * scale)}`, secondary: `${roas.toFixed(2)}x`, delta: '+6.7%', values: makeSeries(conversions * scale, 10, range + 4), accent: true },
  ]
  const formatSpend = [
    { name: 'Native', spend: campaigns.filter((campaign) => campaign.format.toLowerCase().includes('native')).reduce((sum, campaign) => sum + campaign.spend, 0) },
    { name: 'Display', spend: campaigns.filter((campaign) => campaign.format === 'Popunder').reduce((sum, campaign) => sum + campaign.spend, 0) },
    { name: 'Video', spend: campaigns.filter((campaign) => campaign.format === 'Interstitial').reduce((sum, campaign) => sum + campaign.spend, 0) },
    { name: 'Push', spend: campaigns.filter((campaign) => campaign.format.toLowerCase().includes('push')).reduce((sum, campaign) => sum + campaign.spend, 0) },
  ]
  const actions = [
    { title: 'Account balance is low', href: '/add-funds', action: 'Add funds', dot: 'bg-red-500' },
    { title: campaigns.filter((campaign) => campaign.status === 'Pending').length === 1 ? 'Campaign in review' : `${campaigns.filter((campaign) => campaign.status === 'Pending').length} campaigns in review`, href: '/campaigns', action: 'Review', dot: 'bg-amber-500' },
    { title: 'Unfinished campaign draft', href: '/campaigns/new', action: 'Continue', dot: 'bg-zinc-400' },
  ]
  const activity = [
    { label: 'Spring launch preview paused', date: 'Nov 20' },
    { label: 'Mobile app preview updated', date: 'Nov 19' },
    { label: 'Creative approved', date: 'Nov 18' },
    { label: 'Funds added to account', date: 'Nov 16' },
  ]
  const formatMax = Math.max(1, ...formatSpend.map((format) => format.spend))

  return <main className="min-h-[calc(100vh-8rem)] space-y-4 bg-[#F8F9FA] text-zinc-950">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold tracking-tight text-zinc-950">Overview</h1><p className="mt-0.5 text-xs text-zinc-500">Advertiser account <span className="mx-1 text-zinc-300">/</span><span className="font-sans tabular-nums">Nov 2026</span></p></div><div className="inline-flex rounded-lg border border-zinc-200/80 bg-white p-0.5" role="group" aria-label="Date range">{([7, 30, 90] as Range[]).map((days) => <button key={days} type="button" onClick={() => setRange(days)} aria-pressed={range === days} className={`rounded-md px-3 py-1.5 font-sans text-xs tabular-nums ${range === days ? 'bg-emerald-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>{days}D</button>)}</div></header>

    <section aria-label="Key performance indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{kpis.map((kpi) => <Panel key={kpi.label} className="flex min-h-[112px] flex-col justify-between"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{kpi.label}</p><div className="mt-1 flex min-w-0 items-baseline gap-2"><p className="truncate font-sans text-2xl font-semibold tabular-nums tracking-tight text-zinc-950">{kpi.value}</p>{kpi.secondary && <span className="shrink-0 font-sans text-sm font-medium tabular-nums text-zinc-500">{kpi.secondary}</span>}</div></div><Sparkline values={kpi.values} accent={kpi.accent} /></div><p className="mt-2 text-xs text-zinc-500"><span className="font-sans tabular-nums text-emerald-700">{kpi.delta}</span> <span className="ml-1">vs previous period</span></p></Panel>)}</section>

    <section aria-label="Analytics and actions" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Panel className="lg:col-span-4"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-zinc-900">Spend &amp; delivery growth</h2><span className="font-sans text-xs tabular-nums text-zinc-500">{range}D</span></div><RangeBars values={dailySpend} range={range} /></Panel>
      <Panel className="lg:col-span-4"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold text-zinc-900">Performance trend</h2><div role="tablist" aria-label="Performance metric" className="flex gap-0.5">{(['Impressions', 'Clicks', 'Spend'] as Metric[]).map((item) => <button key={item} type="button" role="tab" aria-selected={metric === item} onClick={() => setMetric(item)} className={`rounded-md px-2 py-1 text-xs ${metric === item ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-zinc-500 hover:bg-zinc-100'}`}>{item}</button>)}</div></div><PerformanceChart metric={metric} range={range} values={trendValues} /></Panel>
      <Panel className="lg:col-span-4"><h2 className="text-sm font-semibold text-zinc-900">Action stack</h2><ul className="mt-2 divide-y divide-zinc-100">{actions.map((item) => <li key={item.title} className="flex min-h-11 items-center gap-2.5 py-3"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} aria-hidden="true" /><span className="min-w-0 flex-1 truncate text-[13px] text-zinc-700">{item.title}</span><Link href={item.href} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-zinc-600 hover:text-emerald-700">{item.action} →</Link></li>)}</ul></Panel>
    </section>

    <section aria-label="Breakdown and operations" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Panel className="overflow-hidden p-0 lg:col-span-5"><div className="flex items-center justify-between px-4 py-3"><div><h2 className="text-sm font-semibold text-zinc-900">Active campaigns</h2><p className="mt-0.5 text-[13px] text-zinc-500">Campaign delivery snapshot</p></div><Link href="/campaigns" className="text-[11px] font-medium text-zinc-600 hover:text-emerald-700">View all →</Link></div><table className="w-full table-fixed text-left text-[13px]"><colgroup><col className="w-[37%]" /><col className="w-[18%]" /><col className="w-[19%]" /><col className="w-[13%]" /><col className="w-[13%]" /></colgroup><thead><tr className="border-y border-zinc-200 bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-500"><th className="px-1.5 py-2.5 font-medium">Campaign</th><th className="px-1 py-2.5 font-medium">Status</th><th className="px-1 py-2.5 text-right font-medium">Spend</th><th className="px-1 py-2.5 text-right font-medium">CTR</th><th className="px-1.5 py-2.5 text-right font-medium">ROAS</th></tr></thead><tbody>{campaigns.slice(0, 5).map((campaign) => { const rowCtr = campaign.impressions ? campaign.clicks / campaign.impressions * 100 : 0; const rowRoas = campaign.spend ? campaign.conversions * 100 / campaign.spend : 0; return <tr key={campaign.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"><td className="px-1.5 py-2.5"><Link href={`/campaigns/${campaign.id}`} className="block truncate font-medium text-zinc-800 hover:text-emerald-700">{campaign.name}</Link></td><td className="px-1 py-2.5"><span className="inline-flex max-w-full items-center gap-1 text-[13px] text-zinc-600"><i className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[campaign.status]}`} /><span className="truncate">{campaign.status}</span></span></td><td className="whitespace-nowrap px-1 py-2.5 text-right font-sans tabular-nums">{inr(campaign.spend)}</td><td className="whitespace-nowrap px-1 py-2.5 text-right font-sans tabular-nums">{rowCtr.toFixed(2)}%</td><td className="whitespace-nowrap px-1.5 py-2.5 text-right font-sans tabular-nums">{rowRoas.toFixed(2)}x</td></tr> })}</tbody></table></Panel>
      <Panel className="lg:col-span-4"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-zinc-900">Spend by ad format</h2><span className="font-sans text-[13px] tabular-nums text-zinc-500">{inr(spend * scale)}</span></div><ul className="mt-3 space-y-3">{formatSpend.map((format, index) => { const share = spend ? format.spend / spend * 100 : 0; return <li key={format.name}><div className="mb-1 flex items-center justify-between gap-2 text-[13px]"><span className="text-zinc-700">{format.name}</span><span className="font-sans tabular-nums text-zinc-500">{inr(format.spend * scale)} <span className="ml-1 text-zinc-500">{share.toFixed(1)}%</span></span></div><div className="h-2 rounded-full bg-zinc-100"><div className={`h-full rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-zinc-400'}`} style={{ width: `${format.spend / formatMax * 100}%` }} /></div></li> })}</ul></Panel>
      <Panel className="lg:col-span-3"><h2 className="text-sm font-semibold text-zinc-900">Budget &amp; activity</h2><div className="mt-3 flex items-baseline justify-between gap-2"><span className="text-[13px] text-zinc-500">Monthly budget</span><span className="font-sans text-[13px] tabular-nums text-zinc-900">{inr(spend)} / {inr(22000)}</span></div><div className="mt-1.5 h-2 rounded-full bg-zinc-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, spend / 22000 * 100)}%` }} /></div><ul className="mt-3 divide-y divide-zinc-100 border-t border-zinc-100">{activity.map((item) => <li key={item.label} className="flex items-center justify-between gap-2 py-2"><span className="truncate text-[13px] text-zinc-600">{item.label}</span><time className="shrink-0 font-sans text-xs tabular-nums text-zinc-500">{item.date}</time></li>)}</ul></Panel>
    </section>
  </main>
}
