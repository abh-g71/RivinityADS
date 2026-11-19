'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Clock, Pencil, Wallet } from 'lucide-react'
import { mockAdvertiserCampaigns, type CampaignStatus } from '@/data/advertiser'

/* ---------- Data (same campaigns as the Campaign manager) ---------- */
type Row = { id: string; name: string; objective: string; status: CampaignStatus; spend: number; budget: number; impressions: number; clicks: number; results: number; enabled: boolean }
const amount = (v: string) => { const n = Number(v.replace(/[^\d.-]/g, '')); return Number.isFinite(n) ? n : 0 }
const INITIAL: Row[] = mockAdvertiserCampaigns.map((c) => ({
  id: c.id, name: c.name, objective: c.campaignType, status: c.status,
  spend: amount(c.spent), budget: amount(c.totalBudget), impressions: c.impressions, clicks: c.clicks, results: c.conversions,
  enabled: c.status === 'Active',
}))

const BALANCE = 0
const DELTAS: Record<7 | 30, Record<string, number>> = {
  7: { Spend: 8.2, Impressions: 12.4, Clicks: 9.1, Results: 6.7 },
  30: { Spend: 14.6, Impressions: 18.9, Clicks: 11.2, Results: 10.3 },
}
type Metric = 'Impressions' | 'Clicks' | 'Spend'
const DOT: Record<CampaignStatus, string> = { Active: 'bg-green-500', Paused: 'bg-muted-foreground', Pending: 'bg-amber-500', Draft: 'bg-muted-foreground' }

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
const num = (n: number) => Math.round(n).toLocaleString('en-IN')
const compact = (n: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

function makeSeries(base: number, n: number, seed: number, drift = 0.18) {
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
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

/* ---------- Animation helpers ---------- */
function useMounted() {
  const [on, setOn] = useState(false)
  useEffect(() => { const r = requestAnimationFrame(() => setOn(true)); return () => cancelAnimationFrame(r) }, [])
  return on
}
function useCountUp(target: number) {
  const [v, setV] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const dur = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 900
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const val = a + (target - a) * (1 - Math.pow(1 - p, 3))
      from.current = val
      setV(val)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return v
}
function Count({ value, format }: { value: number; format: (n: number) => string }) {
  return <>{format(useCountUp(value))}</>
}
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const on = useMounted()
  return (
    <div className={`transition-all duration-500 ease-out motion-reduce:transition-none ${on ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ---------- Small parts ---------- */
const CARD = 'rounded-lg border border-border bg-card p-4'

function Trend({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
      {up ? <ArrowUpRight className="h-3 w-3" aria-hidden="true" /> : <ArrowDownRight className="h-3 w-3" aria-hidden="true" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}
function Tabs<T extends string | number>({ items, value, onChange, label }: { items: T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-md bg-muted p-0.5">
      {items.map((it) => (
        <button key={String(it)} type="button" role="tab" aria-selected={value === it} onClick={() => onChange(it)}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${value === it ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          {typeof it === 'number' ? `${it} days` : it}
        </button>
      ))}
    </div>
  )
}
function Bar({ value, max }: { value: number; max: number }) {
  const on = useMounted()
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div className="h-1.5 rounded-full bg-progress" style={{ width: on ? `${Math.min(100, max ? (value / max) * 100 : 0)}%` : '0%', transition: 'width 800ms ease-out' }} />
    </div>
  )
}

/* ---------- One-metric line chart (draws itself) ---------- */
function LineChart({ cur, prev, labels, money }: { cur: number[]; prev: number[]; labels: string[]; money: boolean }) {
  const on = useMounted()
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const W = 1100, H = 240, L = 52, R = 16, T = 16, B = 28
  const n = cur.length
  const max = Math.max(...cur, ...prev) * 1.1
  const fmt = (v: number) => (money ? inr(v) : num(v))
  const x = (i: number) => L + (i / (n - 1)) * (W - L - R)
  const y = (v: number) => T + (1 - v / max) * (H - T - B)
  const pc = cur.map((v, i) => [x(i), y(v)] as [number, number])
  const pp = prev.map((v, i) => [x(i), y(v)] as [number, number])
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
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto max-h-[260px] w-full" role="img" aria-label={`Trend over the last ${n} days`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      {[0, 1 / 3, 2 / 3, 1].map((t) => {
        const gy = T + (1 - t) * (H - T - B)
        return (
          <g key={t}>
            <line x1={L} x2={W - R} y1={gy} y2={gy} stroke="var(--border)" strokeDasharray="3 4" />
            <text x={L - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">{money ? `₹${compact(max * t)}` : compact(max * t)}</text>
          </g>
        )
      })}
      <path d={`${smooth(pc)} L${x(n - 1)},${H - B} L${x(0)},${H - B} Z`} fill="var(--chart-1)" fillOpacity={on ? 0.06 : 0} style={{ transition: 'fill-opacity 900ms ease-out 400ms' }} />
      <path d={smooth(pp)} fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
      <path d={smooth(pc)} pathLength={1} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={1} strokeDashoffset={on ? 0 : 1} style={{ transition: 'stroke-dashoffset 1100ms ease-out' }} />
      {labels.map((l, i) => (i % step === 0 ? <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">{l}</text> : null))}
      <line x1={x(idx)} x2={x(idx)} y1={T} y2={H - B} stroke="var(--muted-foreground)" strokeOpacity="0.5" />
      <circle cx={x(idx)} cy={y(cur[idx])} r="4.5" fill="white" stroke="var(--chart-1)" strokeWidth="2.5" />
      <rect x={bx} y={T - 2} width="160" height="54" rx="6" fill="var(--dark-card)" />
      <text x={bx + 12} y={T + 14} fontSize="10" fill="var(--muted-foreground)">{labels[idx]}</text>
      <text x={bx + 12} y={T + 30} fontSize="12" fill="white">This period {fmt(cur[idx])}</text>
      <text x={bx + 12} y={T + 46} fontSize="12" fill="var(--muted-foreground)">Previous {fmt(prev[idx])}</text>
    </svg>
  )
}

/* ---------- Page ---------- */
export default function AdvertiserHome() {
  const [rows, setRows] = useState<Row[]>(INITIAL)
  const [range, setRange] = useState<7 | 30>(30)
  const [metric, setMetric] = useState<Metric>('Impressions')

  const scale = range === 7 ? 0.26 : 1
  const sum = (k: 'spend' | 'impressions' | 'clicks' | 'results' | 'budget') => rows.reduce((t, c) => t + c[k], 0)
  const spendAll = sum('spend')
  const budgetAll = sum('budget')
  const usedPct = budgetAll ? Math.round((spendAll / budgetAll) * 100) : 0

  const base = metric === 'Impressions' ? sum('impressions') / 30 : metric === 'Clicks' ? sum('clicks') / 30 : spendAll / 30
  const money = metric === 'Spend'
  const cur = useMemo(() => makeSeries(base, range, 7 + range), [base, range])
  const prev = useMemo(() => makeSeries(base * 0.88, range, 31 + range, 0.04), [base, range])
  const labels = useMemo(() => dayLabels(range), [range])
  const total = cur.reduce((t, v) => t + v, 0)

  const pending = rows.find((c) => c.status === 'Pending')
  const draft = rows.find((c) => c.status === 'Draft')

  function toggle(id: string) {
    setRows((list) => list.map((c) => (c.id === id && (c.status === 'Active' || c.status === 'Paused') ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active', enabled: c.status !== 'Active' } : c)))
  }

  const kpis = [
    { label: 'Spend', value: spendAll * scale, format: inr },
    { label: 'Impressions', value: sum('impressions') * scale, format: num },
    { label: 'Clicks', value: sum('clicks') * scale, format: num },
    { label: 'Results', value: sum('results') * scale, format: num },
  ]

  const tasks: { icon: typeof Clock; title: string; meta: string; href: string; cta: string }[] = []
  if (BALANCE <= 0) tasks.push({ icon: Wallet, title: 'Your balance is ₹0', meta: 'Add funds so ads can deliver', href: '/add-funds', cta: 'Add funds' })
  if (pending) tasks.push({ icon: Clock, title: `${pending.name} is in review`, meta: 'Usually a few hours', href: `/campaigns/${pending.id}`, cta: 'View' })
  if (draft) tasks.push({ icon: Pencil, title: `Finish draft: ${draft.name}`, meta: 'Saved automatically', href: '/campaigns/new/manual', cta: 'Continue' })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Advertiser / Home</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Home</h1>
        </div>
        <Tabs label="Date range" items={[7, 30] as (7 | 30)[]} value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 80}>
            <div className={CARD}>
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="truncate text-2xl font-semibold tabular-nums text-foreground"><Count value={k.value} format={k.format} /></p>
                <Trend value={DELTAS[range][k.label]} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <div className="col-span-12 xl:col-span-8">
          <Reveal delay={300}>
            <section className={CARD} aria-label={metric}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs label="Metric" items={['Impressions', 'Clicks', 'Spend'] as Metric[]} value={metric} onChange={setMetric} />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-chart-1" aria-hidden="true" />This period</span>
                  <span className="inline-flex items-center gap-2"><span className="h-0 w-4 border-t-2 border-dashed border-border" aria-hidden="true" />Previous</span>
                </div>
              </div>
              <p className="mt-3 text-xl font-semibold tabular-nums text-foreground">{money ? inr(total) : num(total)} <span className="text-xs font-normal text-muted-foreground">in the last {range} days</span></p>
              <div className="mt-2">
                <LineChart key={`${metric}-${range}`} cur={cur} prev={prev} labels={labels} money={money} />
              </div>
            </section>
          </Reveal>
        </div>

        <div className="col-span-12 space-y-4 xl:col-span-4">
          <Reveal delay={380}>
            <section className={CARD} aria-label="Budget">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-foreground">Total budget</h2>
                <p className="text-sm tabular-nums text-foreground">{inr(spendAll)} / {inr(budgetAll)}</p>
              </div>
              <div className="mt-3"><Bar value={spendAll} max={budgetAll} /></div>
              <p className="mt-2 text-xs text-muted-foreground">{usedPct}% used across all campaigns</p>
            </section>
          </Reveal>
          <Reveal delay={460}>
            <section className={CARD} aria-label="Tasks to complete">
              <h2 className="text-base font-semibold text-foreground">Tasks to complete</h2>
              {tasks.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Nothing needs your attention.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border">
                  {tasks.map((t) => (
                    <li key={t.title} className="flex items-center gap-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><t.icon className="h-4 w-4" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.meta}</p>
                      </div>
                      <Link href={t.href} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">{t.cta}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        </div>
      </div>

      <Reveal delay={540}>
        <section className="overflow-hidden rounded-lg border border-border bg-white" aria-label="Campaigns">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">Campaigns</h2>
            <Link href="/campaigns" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">See all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Delivery</th>
                  <th className="px-3 py-3 font-medium">Spend</th>
                  <th className="px-3 py-3 text-right font-medium">Results</th>
                  <th className="px-4 py-3 text-right font-medium">CTR</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const canToggle = c.status === 'Active' || c.status === 'Paused'
                  const ctr = c.impressions ? `${((c.clicks / c.impressions) * 100).toFixed(2)}%` : '—'
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/campaigns/${c.id}`} className="font-medium text-foreground hover:underline">{c.name}</Link>
                        <p className="text-xs text-muted-foreground">{c.objective}</p>
                      </td>
                      <td className="px-3 py-3"><span className="inline-flex items-center gap-2 text-foreground"><span className={`h-2 w-2 rounded-full ${DOT[c.status]}`} aria-hidden="true" />{c.status}</span></td>
                      <td className="px-3 py-3">
                        <button type="button" role="switch" aria-checked={c.status === 'Active'} aria-label={`Delivery for ${c.name}`} disabled={!canToggle}
                          title={canToggle ? undefined : `${c.status} campaigns cannot be switched on`} onClick={() => toggle(c.id)}
                          className={`relative h-5 w-9 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${c.status === 'Active' ? 'bg-primary' : 'bg-muted-foreground'}`}>
                          <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${c.status === 'Active' ? 'translate-x-4' : ''}`} />
                        </button>
                      </td>
                      <td className="w-44 px-3 py-3">
                        <p className="text-xs tabular-nums text-foreground">{inr(c.spend)} <span className="text-muted-foreground">/ {inr(c.budget)}</span></p>
                        <div className="mt-1.5"><Bar value={c.spend} max={c.budget} /></div>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{c.results ? num(c.results) : '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{ctr}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
