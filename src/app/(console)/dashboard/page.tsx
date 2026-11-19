'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Clock, Eye, MousePointerClick, Pencil, Plus, Wallet } from 'lucide-react'

/* ---------- Sample data (replace with real data later) ---------- */
type Status = 'Active' | 'Paused' | 'Pending' | 'Draft'
type Campaign = {
  id: string
  name: string
  objective: string
  status: Status
  spend: number
  budget: number
  impressions: number
  clicks: number
  results: number
}

const INITIAL: Campaign[] = [
  { id: 'c1', name: 'Diwali sale · Delhi', objective: 'Website visits', status: 'Active', spend: 14200, budget: 20000, impressions: 182400, clicks: 5110, results: 5110 },
  { id: 'c2', name: 'Salon bookings · Pune', objective: 'Leads', status: 'Active', spend: 9800, budget: 15000, impressions: 96300, clicks: 2140, results: 312 },
  { id: 'c3', name: 'Winter collection · Online', objective: 'Sales', status: 'Active', spend: 21400, budget: 30000, impressions: 143800, clicks: 3920, results: 188 },
  { id: 'c4', name: 'Event tickets · Mumbai', objective: 'Awareness', status: 'Paused', spend: 4600, budget: 10000, impressions: 211500, clicks: 1650, results: 1650 },
  { id: 'c5', name: 'App launch · India', objective: 'Website visits', status: 'Pending', spend: 0, budget: 12000, impressions: 0, clicks: 0, results: 0 },
  { id: 'c6', name: 'Local cafe offer · Jaipur', objective: 'Leads', status: 'Draft', spend: 0, budget: 5000, impressions: 0, clicks: 0, results: 0 },
]

const MONTHLY_BUDGET = 60000
const DELTAS: Record<7 | 30, { spend: number; impressions: number; clicks: number }> = {
  7: { spend: 8.2, impressions: 12.4, clicks: 9.1 },
  30: { spend: 14.6, impressions: 18.9, clicks: 11.2 },
}
const PERIODS = { Today: 0.04, Week: 0.26, Month: 1 } as const
type Period = keyof typeof PERIODS
type Metric = 'Impressions' | 'Clicks' | 'Spend'
const METRICS: Record<Metric, { base: number; money: boolean }> = {
  Impressions: { base: 21000, money: false },
  Clicks: { base: 600, money: false },
  Spend: { base: 2400, money: true },
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
const num = (n: number) => Math.round(n).toLocaleString('en-IN')
const compact = (n: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

// Gentle series: small daily noise on top of a slow trend (drift)
function makeSeries(base: number, n: number, seed: number, drift = 0.18) {
  let s = seed
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  return Array.from({ length: n }, (_, i) => Math.round(base * (0.9 + drift * (i / Math.max(1, n - 1)) + (rand() - 0.5) * 0.08)))
}

function dayLabels(n: number) {
  const end = new Date(2026, 10, 17)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end)
    d.setDate(end.getDate() - (n - 1 - i))
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  })
}

function smooth(points: [number, number][]) {
  return points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = points[i - 1]
    const cx = (px + x) / 2
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`
  }, '')
}

/* ---------- Building blocks ---------- */
const CARD = 'rounded-2xl border border-slate-200 bg-white p-5 md:p-6'
const DOT: Record<Status, string> = { Active: 'bg-green-500', Paused: 'bg-amber-500', Pending: 'bg-brand-600', Draft: 'bg-slate-400' }

function Trend({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
      {up ? <ArrowUpRight className="h-3 w-3" aria-hidden="true" /> : <ArrowDownRight className="h-3 w-3" aria-hidden="true" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function MetricCard({ label, value, delta }: { icon?: LucideIcon; label: string; value: string; delta: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="truncate text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        <Trend value={delta} />
      </div>
    </div>
  )
}

function PillTabs<T extends string | number>({ items, value, onChange, label }: { items: T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-lg bg-slate-100 p-0.5">
      {items.map((it) => (
        <button
          key={String(it)}
          type="button"
          role="tab"
          aria-selected={value === it}
          onClick={() => onChange(it)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === it ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          {typeof it === 'number' ? `${it} days` : it}
        </button>
      ))}
    </div>
  )
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  )
}

function Spark({ values, stroke }: { values: number[]; stroke: string }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 26 - ((v - min) / (max - min || 1)) * 22] as [number, number])
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-8 w-24 shrink-0" aria-hidden="true">
      <path d={smooth(pts)} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* ---------- One-metric line chart with previous period ---------- */
function LineChart({ cur, prev, labels, name, money }: { cur: number[]; prev: number[]; labels: string[]; name: string; money: boolean }) {
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const W = 760, H = 280, L = 48, R = 16, T = 16, B = 30
  const n = cur.length
  const max = Math.max(...cur, ...prev) * 1.1
  const fmt = (v: number) => (money ? inr(v) : num(v))
  const x = (i: number) => L + (i / (n - 1)) * (W - L - R)
  const y = (v: number) => T + (1 - v / max) * (H - T - B)
  const ptsC = cur.map((v, i) => [x(i), y(v)] as [number, number])
  const ptsP = prev.map((v, i) => [x(i), y(v)] as [number, number])
  const step = n > 10 ? 5 : 1
  const idx = hover ?? n - 1
  const bx = Math.min(Math.max(x(idx) - 80, L), W - R - 160)

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((e.clientX - rect.left) / rect.width) * W
    setHover(Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1)))))
  }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${name} over the last ${n} days. Latest: ${fmt(cur[n - 1])}.`}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      {[0, 1 / 3, 2 / 3, 1].map((t) => {
        const gy = T + (1 - t) * (H - T - B)
        return (
          <g key={t}>
            <line x1={L} x2={W - R} y1={gy} y2={gy} stroke="#E4E7EC" strokeDasharray="3 4" />
            <text x={L - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="#667085">{money ? `₹${compact((max * t) / 1.0)}` : compact(max * t)}</text>
          </g>
        )
      })}
      <path d={`${smooth(ptsC)} L${x(n - 1)},${H - B} L${x(0)},${H - B} Z`} fill="#465FFF" fillOpacity="0.06" />
      <path d={smooth(ptsP)} fill="none" stroke="#98A2B3" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
      <path d={smooth(ptsC)} fill="none" stroke="#465FFF" strokeWidth="2.5" strokeLinecap="round" />
      {labels.map((l, i) => (i % step === 0 ? <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#667085">{l}</text> : null))}
      <line x1={x(idx)} x2={x(idx)} y1={T} y2={H - B} stroke="#98A2B3" strokeOpacity="0.5" />
      <circle cx={x(idx)} cy={y(cur[idx])} r="4.5" fill="white" stroke="#465FFF" strokeWidth="2.5" />
      <g>
        <rect x={bx} y={T - 2} width="160" height="54" rx="8" fill="#101828" />
        <text x={bx + 12} y={T + 14} fontSize="10" fill="#98A2B3">{labels[idx]}</text>
        <text x={bx + 12} y={T + 30} fontSize="12" fill="white">This period {fmt(cur[idx])}</text>
        <text x={bx + 12} y={T + 46} fontSize="12" fill="#98A2B3">Previous {fmt(prev[idx])}</text>
      </g>
    </svg>
  )
}

/* ---------- Page ---------- */
export default function AdvertiserHome() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL)
  const [range, setRange] = useState<7 | 30>(30)
  const [period, setPeriod] = useState<Period>('Week')
  const [metric, setMetric] = useState<Metric>('Impressions')

  const scale = range === 7 ? 0.26 : 1
  const sum = (key: 'spend' | 'impressions' | 'clicks' | 'results') => campaigns.reduce((t, c) => t + c[key], 0)
  const spendAll = sum('spend')
  const usedPct = Math.round((spendAll / MONTHLY_BUDGET) * 100)

  const m = METRICS[metric]
  const cur = useMemo(() => makeSeries(m.base, range, 7 + range, 0.18), [m.base, range])
  const prev = useMemo(() => makeSeries(m.base * 0.88, range, 31 + range, 0.04), [m.base, range])
  const labels = useMemo(() => dayLabels(range), [range])
  const total = cur.reduce((t, v) => t + v, 0)
  const metricDelta = DELTAS[range][metric.toLowerCase() as 'spend' | 'impressions' | 'clicks']

  const draft = campaigns.find((c) => c.status === 'Draft')
  const pending = campaigns.find((c) => c.status === 'Pending')

  function toggle(id: string) {
    setCampaigns((list) => list.map((c) => (c.id === id && (c.status === 'Active' || c.status === 'Paused') ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c)))
  }

  const p = PERIODS[period]
  const stats = [
    { label: 'Clicks', value: num(sum('clicks') * p), delta: 9.1, series: makeSeries(40, 12, 3), stroke: '#12B76A' },
    { label: 'Results', value: num(sum('results') * p), delta: 6.7, series: makeSeries(30, 12, 5), stroke: '#465FFF' },
    { label: 'Cost per result', value: inr(sum('results') ? spendAll / sum('results') : 0), delta: -3.2, series: makeSeries(50, 12, 9, -0.1), stroke: '#F04438' },
  ]

  const tasks: { icon: LucideIcon; title: string; meta: string; href: string; cta: string }[] = []
  if (usedPct >= 70) tasks.push({ icon: Wallet, title: `${usedPct}% of the monthly budget is used`, meta: `${inr(MONTHLY_BUDGET - spendAll)} left`, href: '/add-funds', cta: 'Add funds' })
  if (pending) tasks.push({ icon: Clock, title: `${pending.name} is in review`, meta: 'Usually a few hours', href: '/campaigns', cta: 'View' })
  if (draft) tasks.push({ icon: Pencil, title: `Finish draft: ${draft.name}`, meta: 'Saved automatically', href: '/campaigns/new/manual', cta: 'Continue' })

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">Advertiser / Home</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Home</h1>
          
        </div>
        <Link href="/campaigns/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Create campaign
        </Link>
      </div>

      <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
        {/* Left: metrics + chart */}
        <div className="col-span-12 space-y-4 md:space-y-6 xl:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
            <MetricCard icon={Wallet} label="Spend" value={inr(spendAll * scale)} delta={DELTAS[range].spend} />
            <MetricCard icon={Eye} label="Impressions" value={num(sum('impressions') * scale)} delta={DELTAS[range].impressions} />
            <MetricCard icon={MousePointerClick} label="Clicks" value={num(sum('clicks') * scale)} delta={DELTAS[range].clicks} />
          </div>

          <section className={CARD} aria-label={metric}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <PillTabs label="Metric" items={['Impressions', 'Clicks', 'Spend'] as Metric[]} value={metric} onChange={setMetric} />
              <PillTabs label="Date range" items={[7, 30] as (7 | 30)[]} value={range} onChange={setRange} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold tabular-nums text-slate-900">{m.money ? inr(total) : num(total)}</span>
              <Trend value={metricDelta} />
              <span className="text-xs text-slate-500">vs previous {range} days</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-[#465FFF]" aria-hidden="true" />This period</span>
              <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" aria-hidden="true" />Previous period</span>
            </div>
            <div className="mt-3">
              <LineChart cur={cur} prev={prev} labels={labels} name={metric} money={m.money} />
            </div>
          </section>
        </div>

        {/* Right: traffic stats + tasks */}
        <div className="col-span-12 space-y-4 md:space-y-6 xl:col-span-4">
          <section className={CARD} aria-label="Traffic stats">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Traffic stats</h2>
              <PillTabs label="Period" items={Object.keys(PERIODS) as Period[]} value={period} onChange={setPeriod} />
            </div>
            <ul className="mt-5 divide-y divide-slate-100">
              {stats.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">{s.label}</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{s.value}</p>
                  </div>
                  <Spark values={s.series} stroke={s.stroke} />
                  <Trend value={s.delta} />
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-slate-100 pt-5">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-slate-500">Monthly budget</p>
                <p className="text-sm font-medium tabular-nums text-slate-900">{inr(spendAll)} / {inr(MONTHLY_BUDGET)}</p>
              </div>
              <div className="mt-2"><Bar value={spendAll} max={MONTHLY_BUDGET} /></div>
            </div>
          </section>

          <section className={CARD} aria-label="Tasks to complete">
            <h2 className="text-lg font-semibold text-slate-900">Tasks to complete</h2>
            {tasks.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Nothing needs your attention right now.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {tasks.map((t) => (
                  <li key={t.title} className="flex items-center gap-3 py-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <t.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
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

      {/* Campaigns table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-label="Campaigns">
        <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Campaigns</h2>
          <Link href="/campaigns" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">See all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-xs text-slate-500">
                <th className="px-5 py-3 font-medium md:px-6">Campaign</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Delivery</th>
                <th className="px-3 py-3 font-medium">Spend</th>
                <th className="px-3 py-3 text-right font-medium">Results</th>
                <th className="px-5 py-3 text-right font-medium md:px-6">CTR</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const canToggle = c.status === 'Active' || c.status === 'Paused'
                const ctr = c.impressions ? `${((c.clicks / c.impressions) * 100).toFixed(2)}%` : '—'
                return (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3.5 md:px-6">
                      <Link href="/campaigns" className="font-medium text-slate-900 hover:underline">{c.name}</Link>
                      <p className="text-xs text-slate-500">{c.objective}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-2 text-slate-700"><span className={`h-2 w-2 rounded-full ${DOT[c.status]}`} aria-hidden="true" />{c.status}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={c.status === 'Active'}
                        aria-label={`Delivery for ${c.name}`}
                        disabled={!canToggle}
                        title={canToggle ? undefined : `${c.status} campaigns cannot be switched on`}
                        onClick={() => toggle(c.id)}
                        className={`relative h-5 w-9 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${c.status === 'Active' ? 'bg-brand-600' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${c.status === 'Active' ? 'translate-x-4' : ''}`} />
                      </button>
                    </td>
                    <td className="w-40 px-3 py-3.5">
                      <p className="text-xs tabular-nums text-slate-700">{inr(c.spend)} <span className="text-slate-400">/ {inr(c.budget)}</span></p>
                      <div className="mt-1.5"><Bar value={c.spend} max={c.budget} /></div>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums">{c.results ? num(c.results) : '—'}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums md:px-6">{ctr}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}