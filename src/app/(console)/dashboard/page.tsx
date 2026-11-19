'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { ArrowRight, Eye, MousePointer2, Percent, Target, Wallet, type LucideIcon } from 'lucide-react'
import { Switch } from '@/components/primitives/switch'
import { ButtonLink } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { DashboardFrame, DashboardHeader, DashboardMetric, DashboardPanel, DashboardSectionTitle } from '@/components/shared/DashboardPrimitives'
import { mockAdvertiserCampaigns, mockAdvertiserTraffic } from '@/data/advertiser'
import { campaignDraftStorageKey } from '@/features/advertiser/campaignTemplates'

type DraftSummary = { headline?: string; objective?: string }
type CampaignRow = (typeof mockAdvertiserCampaigns)[number]
type ReportingPeriod = '14d' | '30d' | 'all'

const campaignStatusClasses: Record<CampaignRow['status'], string> = {
  Active: 'border border-[#82B3BC]/30 bg-[#82B3BC]/10 text-[#A8D5D1]',
  Pending: 'border border-amber-300/20 bg-amber-300/10 text-amber-200',
  Paused: 'border border-white/10 bg-white/5 text-[#AAB8BC]',
  Draft: 'border border-white/10 bg-transparent text-[#AAB8BC]',
}
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
const number = new Intl.NumberFormat('en-IN')

function parseAmount(value: string) {
  const amount = Number(value.replace(/[^\d.-]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function formatCampaignDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

function getCampaignsForPeriod(period: ReportingPeriod) {
  if (period === 'all') return mockAdvertiserCampaigns
  const days = period === '14d' ? 14 : 30
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffDate = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`
  return mockAdvertiserCampaigns.filter((campaign) => campaign.updatedDate >= cutoffDate)
}

const performanceSamples = [
  { date: 'Nov 11', impressions: 26400, clicks: 288 },
  { date: 'Nov 12', impressions: 31800, clicks: 341 },
  { date: 'Nov 13', impressions: 29200, clicks: 325 },
  { date: 'Nov 14', impressions: 38600, clicks: 402 },
  { date: 'Nov 15', impressions: 42100, clicks: 446 },
  { date: 'Nov 16', impressions: 36700, clicks: 401 },
  { date: 'Nov 17', impressions: 51300, clicks: 552 },
]
const chartBounds = { left: 64, right: 650, top: 28, bottom: 220 }
const chartX = (index: number) => chartBounds.left + (index * (chartBounds.right - chartBounds.left)) / (performanceSamples.length - 1)
const chartY = (value: number, max: number) => chartBounds.bottom - (value / max) * (chartBounds.bottom - chartBounds.top)
function makeChartPath(metric: 'impressions' | 'clicks', max: number) {
  return performanceSamples.map((sample, index) => `${index === 0 ? 'M' : 'L'} ${chartX(index)} ${chartY(sample[metric], max)}`).join(' ')
}

function CampaignPerformanceChart() {
  return (
    <DashboardPanel className="h-full p-4 sm:p-5 lg:p-6">
      <DashboardSectionTitle eyebrow="Performance / sample data" title="Campaign performance" detail="Daily impressions and clicks / Nov 11-17, 2026" />
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#AAB8BC]" aria-label="Chart legend">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 bg-[#82B3BC]" aria-hidden="true" />Impressions / left axis</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 bg-[#F3F4EF]" aria-hidden="true" />Clicks / right axis</span>
      </div>
      <div className="mt-3 w-full overflow-x-auto">
        <svg viewBox="0 0 720 280" role="img" aria-label="Sample campaign performance line chart showing daily impressions and clicks from November 11 through November 17, 2026." className="h-64 min-w-[560px] w-full">
          {[0, 1, 2, 3].map((tick) => {
            const y = chartBounds.top + (tick * (chartBounds.bottom - chartBounds.top)) / 3
            return <g key={tick}><line x1={chartBounds.left} x2={chartBounds.right} y1={y} y2={y} stroke="#30434C" strokeWidth="1" /><text x={chartBounds.left - 10} y={y + 4} textAnchor="end" fill="#AAB8BC" fontSize="10">{number.format(60000 - tick * 20000)}</text><text x={chartBounds.right + 10} y={y + 4} textAnchor="start" fill="#AAB8BC" fontSize="10">{number.format(600 - tick * 200)}</text></g>
          })}
          <text x={chartBounds.left} y="14" fill="#AAB8BC" fontSize="10">Impressions</text><text x={chartBounds.right} y="14" textAnchor="end" fill="#AAB8BC" fontSize="10">Clicks</text>
          <path d={makeChartPath('impressions', 60000)} fill="none" stroke="#82B3BC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={makeChartPath('clicks', 600)} fill="none" stroke="#F3F4EF" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {performanceSamples.map((sample, index) => <g key={sample.date}><circle cx={chartX(index)} cy={chartY(sample.impressions, 60000)} r="4" fill="#82B3BC" stroke="#172630" strokeWidth="1.5"><title>{`${sample.date}, 2026: ${number.format(sample.impressions)} impressions`}</title></circle><circle cx={chartX(index)} cy={chartY(sample.clicks, 600)} r="3.5" fill="#F3F4EF" stroke="#172630" strokeWidth="1.5"><title>{`${sample.date}, 2026: ${number.format(sample.clicks)} clicks`}</title></circle><text x={chartX(index)} y="250" textAnchor="middle" fill="#AAB8BC" fontSize="10">{sample.date}</text></g>)}
          <text x="357" y="272" textAnchor="middle" fill="#AAB8BC" fontSize="10">Date</text>
        </svg>
      </div>
    </DashboardPanel>
  )
}

function TrafficInsights() {
  const traffic = [...mockAdvertiserTraffic].sort((first, second) => parseAmount(second.dailyImpressions) - parseAmount(first.dailyImpressions))
  const maxImpressions = Math.max(...traffic.map((sample) => parseAmount(sample.dailyImpressions)), 1)
  return (
    <DashboardPanel className="h-full p-4 sm:p-5 lg:p-6">
      <DashboardSectionTitle eyebrow="Audience / inventory estimate" title="Traffic by country" detail="Daily inventory estimates and recommended CPM" />
      <div className="mt-5 hidden grid-cols-[minmax(110px,.8fr)_minmax(100px,1.3fr)_100px] gap-3 border-b border-[#30434C] pb-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#AAB8BC] sm:grid"><span>Country</span><span>Daily impressions</span><span>CPM</span></div>
      <ol className="mt-2 divide-y divide-[#30434C]" aria-label="Country traffic rankings">
        {traffic.map((sample, index) => {
          const impressions = parseAmount(sample.dailyImpressions)
          return <li key={sample.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(110px,.8fr)_minmax(100px,1.3fr)_100px] sm:gap-3"><div className="min-w-0"><span className="mr-2 text-[10px] tabular-nums text-[#82B3BC]">{String(index + 1).padStart(2, '0')}</span><span className="text-sm font-medium">{sample.country}</span></div><div className="col-span-2 row-start-2 flex min-w-0 items-center gap-2 sm:col-span-1 sm:col-start-2 sm:row-start-1"><span className="text-[10px] text-[#AAB8BC] sm:hidden">Daily impressions</span><div className="h-1.5 min-w-0 flex-1 bg-[#1D303A]" role="meter" aria-label={`${number.format(impressions)} estimated daily impressions in ${sample.country}`} aria-valuemin={0} aria-valuemax={maxImpressions} aria-valuenow={impressions}><div className="h-full bg-[#82B3BC]" style={{ width: `${(impressions / maxImpressions) * 100}%` }} /></div><span className="shrink-0 text-xs tabular-nums">{number.format(impressions)}</span></div><div className="text-right sm:text-left"><span className="block text-[10px] text-[#AAB8BC] sm:hidden">Recommended CPM</span><span className="text-xs font-medium tabular-nums">{currency.format(parseAmount(sample.recommendedCpm))}</span></div></li>
        })}
      </ol>
      <p className="mt-2 text-[10px] leading-5 text-[#AAB8BC]">Illustrative country-level traffic estimates; not live inventory.</p>
    </DashboardPanel>
  )
}

function CampaignRows({ campaigns, setCampaigns }: { campaigns: CampaignRow[]; setCampaigns: Dispatch<SetStateAction<CampaignRow[]>> }) {
  return <>
    <ul className="mt-4 divide-y divide-[#30434C] border-y border-[#30434C] lg:hidden" aria-label="Recent campaigns">
      {campaigns.map((campaign) => {
        const canToggleDelivery = campaign.status === 'Active' || campaign.status === 'Paused'
        const isEnabled = campaign.status === 'Active'
        return <li key={campaign.id} className="py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{campaign.name}</p><p className="mt-1 text-xs text-[#AAB8BC]">{campaign.campaignType}</p></div><span className={`shrink-0 px-2 py-1 text-[10px] font-medium ${campaignStatusClasses[campaign.status]}`}>{campaign.status}</span></div><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3"><div><dt className="text-[10px] text-[#AAB8BC]">Spend / budget</dt><dd className="mt-1 text-sm font-medium tabular-nums">{currency.format(parseAmount(campaign.spent))}</dd><dd className="text-xs tabular-nums text-[#AAB8BC]">of {currency.format(parseAmount(campaign.totalBudget))}</dd></div><div><dt className="text-[10px] text-[#AAB8BC]">Impressions</dt><dd className="mt-1 text-sm font-medium tabular-nums">{number.format(campaign.impressions)}</dd></div><div><dt className="text-[10px] text-[#AAB8BC]">CTR</dt><dd className="mt-1 text-sm font-medium tabular-nums">{campaign.ctr}</dd></div><div><dt className="text-[10px] text-[#AAB8BC]">Last updated</dt><dd className="mt-1 text-sm">{formatCampaignDate(campaign.updatedDate)}</dd></div></dl><div className="mt-3 flex min-h-10 items-center justify-between border-t border-[#30434C] pt-3"><span className="text-xs text-[#AAB8BC]">{canToggleDelivery ? (isEnabled ? 'Delivery on' : 'Delivery off') : campaign.status === 'Pending' ? 'Awaiting review' : 'Not published'}</span>{canToggleDelivery && <Switch checked={isEnabled} onCheckedChange={(checked) => setCampaigns((current) => current.map((item) => item.id === campaign.id && (item.status === 'Active' || item.status === 'Paused') ? { ...item, status: checked ? 'Active' : 'Paused' } : item))} aria-label={`${isEnabled ? 'Pause' : 'Resume'} ${campaign.name}`} />}</div></li>
      })}
    </ul>
    <div className="mt-4 hidden max-w-full overflow-x-auto lg:block"><table className="w-full min-w-[900px] text-left text-sm" aria-label="Recent campaigns"><thead className="border-b border-[#30434C] text-[10px] font-semibold uppercase tracking-[.12em] text-[#AAB8BC]"><tr>{['Campaign', 'Status', 'Spend / budget', 'Impressions', 'CTR', 'Last updated', 'Delivery'].map((heading) => <th key={heading} scope="col" className="px-3 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#30434C] text-[#D8E0E0]">{campaigns.map((campaign) => { const canToggleDelivery = campaign.status === 'Active' || campaign.status === 'Paused'; const isEnabled = campaign.status === 'Active'; return <tr key={campaign.id}><td className="px-3 py-3"><p className="font-medium text-[#F3F4EF]">{campaign.name}</p><p className="mt-1 text-xs text-[#AAB8BC]">{campaign.campaignType}</p></td><td className="px-3 py-3"><span className={`inline-flex px-2 py-1 text-[10px] font-medium ${campaignStatusClasses[campaign.status]}`}>{campaign.status}</span></td><td className="px-3 py-3 tabular-nums"><p className="font-medium">{currency.format(parseAmount(campaign.spent))}</p><p className="mt-1 text-xs text-[#AAB8BC]">of {currency.format(parseAmount(campaign.totalBudget))}</p></td><td className="px-3 py-3 tabular-nums">{number.format(campaign.impressions)}</td><td className="px-3 py-3 tabular-nums">{campaign.ctr}</td><td className="whitespace-nowrap px-3 py-3">{formatCampaignDate(campaign.updatedDate)}</td><td className="px-3 py-3">{canToggleDelivery ? <div className="flex items-center gap-2"><span className="text-xs text-[#AAB8BC]">{isEnabled ? 'On' : 'Off'}</span><Switch checked={isEnabled} onCheckedChange={(checked) => setCampaigns((current) => current.map((item) => item.id === campaign.id && (item.status === 'Active' || item.status === 'Paused') ? { ...item, status: checked ? 'Active' : 'Paused' } : item))} aria-label={`${isEnabled ? 'Pause' : 'Resume'} ${campaign.name}`} /></div> : <span className="text-xs text-[#AAB8BC]">{campaign.status === 'Pending' ? 'Awaiting review' : 'Not published'}</span>}</td></tr> })}</tbody></table></div>
  </>
}

export default function AdvertiserDashboardPage() {
  const [hasDraft, setHasDraft] = useState(false)
  const [draftSummary, setDraftSummary] = useState<DraftSummary>({})
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(mockAdvertiserCampaigns)
  const [reportingPeriod, setReportingPeriod] = useState<ReportingPeriod>('all')
  const reportingCampaigns = getCampaignsForPeriod(reportingPeriod)
  const recentCampaigns = [...campaigns].sort((first, second) => second.updatedDate.localeCompare(first.updatedDate))
  const totals = reportingCampaigns.reduce((summary, campaign) => ({ spend: summary.spend + parseAmount(campaign.spent), impressions: summary.impressions + campaign.impressions, clicks: summary.clicks + campaign.clicks, conversions: summary.conversions + campaign.conversions }), { spend: 0, impressions: 0, clicks: 0, conversions: 0 })
  const ctr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(campaignDraftStorageKey)
        if (!saved) return
        const draft: unknown = JSON.parse(saved)
        if (draft && typeof draft === 'object') { const summary = draft as DraftSummary; setHasDraft(true); setDraftSummary(summary) }
      } catch (error) { console.error('Unable to read saved campaign draft', error) }
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])

  const stats: Array<{ title: string; value: string; detail: string; icon: LucideIcon }> = [
    { title: 'Spend', value: currency.format(totals.spend), detail: 'Campaign spend', icon: Wallet },
    { title: 'Impressions', value: number.format(totals.impressions), detail: 'Total ad views', icon: Eye },
    { title: 'Clicks', value: number.format(totals.clicks), detail: 'Total clicks', icon: MousePointer2 },
    { title: 'CTR', value: `${ctr.toFixed(2)}%`, detail: 'Clicks / impressions', icon: Percent },
    { title: 'Conversions', value: number.format(totals.conversions), detail: 'Recorded conversions', icon: Target },
  ]

  return <DashboardFrame>
    <DashboardHeader eyebrow="Advertiser / Overview" title="Campaigns at a glance" description="Performance, delivery and audience estimates from your campaign workspace." action={<ButtonLink href="/campaigns/new" className="!rounded-none !bg-[#82B3BC] !text-[#0B151D] hover:!bg-[#93C6C7] focus-visible:!ring-[#82B3BC]">Create campaign <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>} />
    <div className="flex flex-col gap-3 border-b border-[#30434C] pb-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-sm font-semibold">Performance summary</h2><p className="mt-1 text-xs text-[#AAB8BC]">{reportingPeriod === 'all' ? 'Lifetime totals across all campaigns.' : `Lifetime totals for campaigns updated in the last ${reportingPeriod === '14d' ? '14' : '30'} days.`} Simulated campaign data.</p></div><div className="w-full sm:w-52"><Select label="Reporting period" labelClassName="text-xs text-[#AAB8BC]" className="!h-10 !rounded-none !border-[#30434C] !bg-[#172630] !text-[#F3F4EF] focus-visible:!ring-[#82B3BC]" value={reportingPeriod} onChange={(event) => setReportingPeriod(event.target.value as ReportingPeriod)} options={[{ value: '14d', label: 'Last 14 days' }, { value: '30d', label: 'Last 30 days' }, { value: 'all', label: 'All time' }]} /></div></div>
    <section aria-label="Campaign performance summary" className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">{stats.map((stat, index) => <DashboardMetric key={stat.title} label={stat.title} value={stat.value} detail={stat.detail} icon={stat.icon} featured={index === 0} />)}</section>
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5"><div className="min-w-0 lg:col-span-8"><CampaignPerformanceChart /></div>
      <DashboardPanel className="p-4 sm:p-5 lg:col-span-4 lg:p-6"><DashboardSectionTitle eyebrow="Saved progress" title="Continue where you left off" detail="Campaign drafts are saved in this browser." /><div className="mt-5 border-l-2 border-[#82B3BC] bg-[#1D303A] p-4">{hasDraft ? <><p className="text-sm font-semibold">{draftSummary.headline || draftSummary.objective || 'Campaign draft'}</p><p className="mt-1 text-xs text-[#AAB8BC]">Continue editing your saved draft.</p></> : <><p className="text-sm font-semibold">No saved draft yet</p><p className="mt-1 text-xs text-[#AAB8BC]">Your progress will appear here when you start a campaign.</p></>}<Link href="/campaigns/new/manual" className="mt-4 inline-flex min-h-10 items-center gap-2 border border-[#82B3BC]/50 px-3 text-xs font-semibold text-[#A8D5D1] transition-colors hover:bg-[#82B3BC]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82B3BC]">{hasDraft ? 'Continue draft' : 'Start a campaign'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></DashboardPanel>
      <div className="min-w-0 lg:col-span-5"><TrafficInsights /></div>
      <DashboardPanel className="p-4 sm:p-5 lg:col-span-7 lg:p-6"><DashboardSectionTitle eyebrow="Delivery / campaign list" title="Recent campaigns" detail="Review campaign delivery and performance." action={<Link href="/campaigns" className="text-xs font-semibold text-[#82B3BC] hover:underline">View all <ArrowRight className="inline h-3.5 w-3.5" aria-hidden="true" /></Link>} /><CampaignRows campaigns={recentCampaigns} setCampaigns={setCampaigns} /></DashboardPanel>
    </div>
  </DashboardFrame>
}
