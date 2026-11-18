'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleHelp, Eye, MousePointer2, Percent, Target, Wallet, type LucideIcon } from 'lucide-react'
import { Switch } from '@/components/primitives/switch'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { mockAdvertiserCampaigns, mockAdvertiserTraffic } from '@/data/advertiser'
import { campaignDraftStorageKey } from '@/features/advertiser/campaignTemplates'

type DraftSummary = { headline?: string; objective?: string }
type CampaignRow = (typeof mockAdvertiserCampaigns)[number]
type ReportingPeriod = '14d' | '30d' | 'all'

const campaignStatusClasses: Record<CampaignRow['status'], string> = {
  Active: 'bg-green-50 text-green-800',
  Pending: 'bg-amber-50 text-amber-800',
  Paused: 'bg-slate-100 text-slate-700',
  Draft: 'border border-slate-200 bg-white text-slate-600',
}

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
const number = new Intl.NumberFormat('en-IN')

type AdvertiserMetricCardProps = {
  title: string
  value: string
  detail: string
  icon: LucideIcon
}

function AdvertiserMetricCard({ title, value, detail, icon: Icon }: AdvertiserMetricCardProps) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 items-center gap-2 text-navy-800">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="block text-sm text-slate-500">{title}</span>
      </div>
      <h3 className="mt-3 break-words text-2xl font-bold tracking-tight tabular-nums text-navy-900">{value}</h3>
      <p className="mt-1 min-h-4 text-xs leading-4 text-slate-500">{detail}</p>
    </div>
  )
}

function parseAmount(value: string) {
  const amount = Number(value.replace(/[^\d.-]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function formatCampaignDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T12:00:00`))
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

function chartX(index: number) {
  return chartBounds.left + (index * (chartBounds.right - chartBounds.left)) / (performanceSamples.length - 1)
}

function chartY(value: number, max: number) {
  return chartBounds.bottom - (value / max) * (chartBounds.bottom - chartBounds.top)
}

function makeChartPath(metric: 'impressions' | 'clicks', max: number) {
  return performanceSamples.map((sample, index) =>
    `${index === 0 ? 'M' : 'L'} ${chartX(index)} ${chartY(sample[metric], max)}`,
  ).join(' ')
}

function CampaignPerformanceChart() {
  const ticks = [0, 1, 2, 3]

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-navy-900">Campaign performance</h2>
          <p className="mt-1 text-xs text-slate-500">Daily impressions and clicks · Nov 11-17, 2026</p>
        </div>
        <span className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600">Sample data</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600" aria-label="Chart legend">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden="true" />Impressions (left axis)</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-500" aria-hidden="true" />Clicks (right axis)</span>
      </div>

      <div className="mt-3 w-full overflow-x-auto">
        <svg
          viewBox="0 0 720 280"
          role="img"
          aria-label="Sample campaign performance line chart showing daily impressions and clicks from November 11 through November 17, 2026."
          className="h-64 min-w-[560px] w-full"
        >
          {ticks.map((tick) => {
            const y = chartBounds.top + (tick * (chartBounds.bottom - chartBounds.top)) / 3
            return (
              <g key={tick}>
                <line x1={chartBounds.left} x2={chartBounds.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x={chartBounds.left - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">
                  {number.format(60000 - tick * 20000)}
                </text>
                <text x={chartBounds.right + 10} y={y + 4} textAnchor="start" fill="#64748b" fontSize="10">
                  {number.format(600 - tick * 200)}
                </text>
              </g>
            )
          })}

          <text x={chartBounds.left} y="14" fill="#475569" fontSize="10">Impressions</text>
          <text x={chartBounds.right} y="14" textAnchor="end" fill="#475569" fontSize="10">Clicks</text>

          <path d={makeChartPath('impressions', 60000)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={makeChartPath('clicks', 600)} fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {performanceSamples.map((sample, index) => (
            <g key={sample.date}>
              <circle cx={chartX(index)} cy={chartY(sample.impressions, 60000)} r="4" fill="#2563eb" stroke="white" strokeWidth="1.5">
                <title>{`${sample.date}, 2026: ${number.format(sample.impressions)} impressions`}</title>
              </circle>
              <circle cx={chartX(index)} cy={chartY(sample.clicks, 600)} r="4" fill="#64748b" stroke="white" strokeWidth="1.5">
                <title>{`${sample.date}, 2026: ${number.format(sample.clicks)} clicks`}</title>
              </circle>
              <text x={chartX(index)} y="250" textAnchor="middle" fill="#64748b" fontSize="10">{sample.date}</text>
            </g>
          ))}
          <text x="357" y="272" textAnchor="middle" fill="#64748b" fontSize="10">Date</text>
        </svg>
      </div>
    </Card>
  )
}

function TrafficInsights() {
  const traffic = [...mockAdvertiserTraffic].sort(
    (first, second) => parseAmount(second.dailyImpressions) - parseAmount(first.dailyImpressions),
  )
  const maxImpressions = Math.max(...traffic.map((sample) => parseAmount(sample.dailyImpressions)), 1)

  return (
    <Card className="h-full p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-navy-900">Traffic by country</h2>
          <p className="mt-1 text-xs text-slate-500">Daily inventory estimates and recommended CPM</p>
        </div>
        <span className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600">Sample data</span>
      </div>

      <div className="mt-5 hidden border-b border-slate-200 pb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:grid sm:grid-cols-[minmax(130px,0.8fr)_minmax(160px,1.6fr)_140px] sm:gap-5">
        <span>Country</span>
        <span>Daily impressions</span>
        <span>Recommended CPM</span>
      </div>
      <ol className="mt-2 divide-y divide-slate-100" aria-label="Country traffic rankings">
        {traffic.map((sample, index) => {
          const impressions = parseAmount(sample.dailyImpressions)
          const recommendedCpm = currency.format(parseAmount(sample.recommendedCpm))
          const barWidth = `${(impressions / maxImpressions) * 100}%`

          return (
            <li key={sample.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(130px,0.8fr)_minmax(160px,1.6fr)_140px] sm:gap-5">
              <div className="min-w-0">
                <span className="mr-2 text-xs tabular-nums text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-sm font-medium text-navy-900">{sample.country}</span>
              </div>

              <div className="col-span-2 row-start-2 flex min-w-0 items-center gap-3 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                <span className="shrink-0 text-[10px] text-slate-500 sm:hidden">Daily impressions</span>
                <div
                  className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100"
                  role="meter"
                  aria-label={`${number.format(impressions)} estimated daily impressions in ${sample.country}`}
                  aria-valuemin={0}
                  aria-valuemax={maxImpressions}
                  aria-valuenow={impressions}
                >
                  <div className="h-full rounded-full bg-brand-600" style={{ width: barWidth }} />
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums text-navy-900">{number.format(impressions)}</span>
              </div>

              <div className="text-right sm:text-left">
                <span className="block text-[10px] text-slate-500 sm:hidden">Recommended CPM</span>
                <span className="text-sm font-medium tabular-nums text-navy-900">{recommendedCpm}</span>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-xs text-slate-500">Illustrative country-level traffic estimates; not live inventory.</p>
    </Card>
  )
}

export default function AdvertiserDashboardPage() {
  const [hasDraft, setHasDraft] = useState(false)
  const [draftSummary, setDraftSummary] = useState<DraftSummary>({})
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(mockAdvertiserCampaigns)
  const [reportingPeriod, setReportingPeriod] = useState<ReportingPeriod>('all')

  const reportingCampaigns = getCampaignsForPeriod(reportingPeriod)
  const recentCampaigns = [...campaigns].sort((first, second) => second.updatedDate.localeCompare(first.updatedDate))
  const totals = reportingCampaigns.reduce((summary, campaign) => ({
    spend: summary.spend + parseAmount(campaign.spent),
    impressions: summary.impressions + campaign.impressions,
    clicks: summary.clicks + campaign.clicks,
    conversions: summary.conversions + campaign.conversions,
  }), { spend: 0, impressions: 0, clicks: 0, conversions: 0 })
  const ctr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0

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
    <div className="mx-auto min-w-0 max-w-7xl space-y-5">
      <header className="flex min-h-11 flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy-900">Advertiser Overview</h1>
        <ButtonLink href="/campaigns/new">Create campaign <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-navy-900">Performance summary</h2>
          <p className="mt-1 text-sm text-slate-600">
            {reportingPeriod === 'all'
              ? 'Lifetime totals across all campaigns.'
              : `Lifetime totals for campaigns updated in the last ${reportingPeriod === '14d' ? '14' : '30'} days.`}
          </p>
        </div>
        <div className="w-full sm:w-52">
          <Select
            label="Reporting period"
            value={reportingPeriod}
            onChange={(event) => setReportingPeriod(event.target.value as ReportingPeriod)}
            options={[
              { value: '14d', label: 'Last 14 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: 'all', label: 'All time' },
            ]}
          />
        </div>
      </div>

      <section aria-label="Campaign performance summary" className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { title: 'Spend', value: currency.format(totals.spend), detail: 'Campaign spend', icon: Wallet },
          { title: 'Impressions', value: number.format(totals.impressions), detail: 'Total ad views', icon: Eye },
          { title: 'Clicks', value: number.format(totals.clicks), detail: 'Total clicks', icon: MousePointer2 },
          { title: 'CTR', value: `${ctr.toFixed(2)}%`, detail: 'Clicks / impressions', icon: Percent },
          { title: 'Conversions', value: number.format(totals.conversions), detail: 'Recorded conversions', icon: Target },
        ].map((stat) => (
          <AdvertiserMetricCard key={stat.title} {...stat} />
        ))}
      </section>
      <p className="-mt-3 text-xs text-slate-500">Simulated campaign data. Period filters campaigns by last updated date.</p>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="min-w-0 lg:col-span-8">
          <CampaignPerformanceChart />
        </div>
        <Card className="min-w-0 p-4 lg:col-span-4">
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

        <div className="min-w-0 lg:col-span-5">
          <TrafficInsights />
        </div>

      <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-7" aria-labelledby="recent-campaigns-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="recent-campaigns-title" className="font-semibold text-navy-900">Recent campaigns</h2>
            <p className="mt-1 text-xs text-slate-500">Review campaign delivery and performance.</p>
          </div>
          <Link href="/campaigns" className="text-sm font-semibold text-brand-700 hover:underline">View all campaigns</Link>
        </div>

        <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 lg:hidden" aria-label="Recent campaigns">
          {recentCampaigns.map((campaign) => {
            const canToggleDelivery = campaign.status === 'Active' || campaign.status === 'Paused'
            const isEnabled = campaign.status === 'Active'

            return (
              <li key={campaign.id} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900">{campaign.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{campaign.campaignType}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${campaignStatusClasses[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-[11px] text-slate-500">Spend / budget</dt>
                    <dd className="mt-1 text-sm font-medium tabular-nums text-navy-900">{currency.format(parseAmount(campaign.spent))}</dd>
                    <dd className="text-xs tabular-nums text-slate-500">of {currency.format(parseAmount(campaign.totalBudget))}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500">Impressions</dt>
                    <dd className="mt-1 text-sm font-medium tabular-nums text-navy-900">{number.format(campaign.impressions)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500">CTR</dt>
                    <dd className="mt-1 text-sm font-medium tabular-nums text-navy-900">{campaign.ctr}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500">Last updated</dt>
                    <dd className="mt-1 text-sm text-navy-900">{formatCampaignDate(campaign.updatedDate)}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex min-h-10 items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">
                    {canToggleDelivery ? (isEnabled ? 'Delivery on' : 'Delivery off') : campaign.status === 'Pending' ? 'Awaiting review' : 'Not published'}
                  </span>
                  {canToggleDelivery && (
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => setCampaigns((current) => current.map((item) =>
                        item.id === campaign.id && (item.status === 'Active' || item.status === 'Paused')
                          ? { ...item, status: checked ? 'Active' : 'Paused' }
                          : item,
                      ))}
                      aria-label={`${isEnabled ? 'Pause' : 'Resume'} ${campaign.name}`}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 hidden max-w-full overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] text-left text-sm" aria-label="Recent campaigns">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Campaign</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Spend / budget</th>
                <th scope="col" className="px-4 py-3">Impressions</th>
                <th scope="col" className="px-4 py-3">CTR</th>
                <th scope="col" className="px-4 py-3">Last updated</th>
                <th scope="col" className="px-4 py-3">Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentCampaigns.map((campaign) => {
                const canToggleDelivery = campaign.status === 'Active' || campaign.status === 'Paused'
                const isEnabled = campaign.status === 'Active'

                return (
                  <tr key={campaign.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{campaign.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{campaign.campaignType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${campaignStatusClasses[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <p className="font-medium text-navy-900">{currency.format(parseAmount(campaign.spent))}</p>
                      <p className="mt-1 text-xs text-slate-500">of {currency.format(parseAmount(campaign.totalBudget))}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{number.format(campaign.impressions)}</td>
                    <td className="px-4 py-3 tabular-nums">{campaign.ctr}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatCampaignDate(campaign.updatedDate)}</td>
                    <td className="px-4 py-3">
                      {canToggleDelivery ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{isEnabled ? 'On' : 'Off'}</span>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => setCampaigns((current) => current.map((item) =>
                              item.id === campaign.id && (item.status === 'Active' || item.status === 'Paused')
                                ? { ...item, status: checked ? 'Active' : 'Paused' }
                                : item,
                            ))}
                            aria-label={`${isEnabled ? 'Pause' : 'Resume'} ${campaign.name}`}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">{campaign.status === 'Pending' ? 'Awaiting review' : 'Not published'}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </div>
  )
}
