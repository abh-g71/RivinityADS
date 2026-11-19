'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Clock, Plus, Wallet } from 'lucide-react'

/* ---------- Sample data ---------- */
const R = '\u20B9' // rupee sign written as an escape so file encoding can never garble it
type SiteStatus = 'Approved' | 'In review'
const SITES: { name: string; status: SiteStatus; impressions: number; clicks: number; earnings: number }[] = [
  { name: 'techbuzz.example', status: 'Approved', impressions: 48200, clicks: 1180, earnings: 3920 },
  { name: 'recipes.example', status: 'Approved', impressions: 31600, clicks: 790, earnings: 2540 },
  { name: 'localnews.example', status: 'Approved', impressions: 19400, clicks: 410, earnings: 1400 },
  { name: 'gadgetreviews.example', status: 'In review', impressions: 0, clicks: 0, earnings: 0 },
]
const FORMATS = [
  { name: 'Native Banner', value: 4180, color: '#ACBCFF' },
  { name: 'Interstitial', value: 2650, color: '#6EE0A9' },
  { name: 'Social Bar', value: 1920, color: '#6B6B75' },
  { name: 'In-Page Push', value: 1110, color: '#101012' },
]
const COUNTRIES = [
  { name: 'India', value: 5240, color: '#ACBCFF' },
  { name: 'United States', value: 2310, color: '#ACBCFF' },
  { name: 'United Kingdom', value: 1280, color: '#ACBCFF' },
  { name: 'Canada', value: 1030, color: '#ACBCFF' },
]
const PAYOUT_MIN = 10000
const DELTAS: Record<7 | 30, Record<string, number>> = {
  7: { Earnings: 7.4, Impressions: 10.2, Clicks: 6.8, eCPM: 2.1 },
  30: { Earnings: 12.6, Impressions: 15.9, Clicks: 9.4, eCPM: -1.3 },
}
type Metric = 'Earnings' | 'Impressions' | 'Clicks'

const inr = (n: number) => `${R}${Math.round(n).toLocaleString('en-IN')}`
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
const CARD = 'rounded-lg border border-border bg-white p-4'

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
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${value === it ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
          {typeof it === 'number' ? `${it} days` : it}
        </button>
      ))}
    </div>
  )
}
function HBars({ rows }: { rows: { name: string; value: number; color: string }[] }) {
  const on = useMounted()
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="space-y-4">
      {rows.map((r, i) => (
        <li key={r.name}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-foreground">{r.name}</span>
            <span className="tabular-nums text-foreground">{inr(r.value)}</span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full" style={{ width: on ? `${(r.value / max) * 100}%` : '0%', background: r.color, transition: `width 800ms ease-out ${i * 80}ms` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
function Donut({ parts }: { parts: { name: string; value: number; color: string }[] }) {
  const on = useMounted()
  const total = parts.reduce((a, p) => a + p.value, 0)
  const r = 70
  const C = 2 * Math.PI * r
  const segments = parts.map((p, i) => {
    const before = parts.slice(0, i).reduce((s, q) => s + (q.value / total) * C, 0)
    return { ...p, len: Math.max(0, (p.value / total) * C - 2), offset: -before }
  })
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label="Earnings by ad format">
          <circle cx="90" cy="90" r={r} fill="none" stroke="#F6F8FC" strokeWidth="22" />
          {segments.map((s) => (
            <circle
              key={s.name}
              cx="90"
              cy="90"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="22"
              strokeDasharray={`${on ? s.len : 0} ${C}`}
              strokeDashoffset={s.offset}
              style={{ transition: 'stroke-dasharray 900ms ease-out' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold tabular-nums text-foreground"><Count value={total} format={inr} /></p>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2.5 text-sm">
        {parts.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-foreground"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: p.color }} aria-hidden="true" /><span className="truncate">{p.name}</span></span>
            <span className="tabular-nums text-foreground">{Math.round((p.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
function LineChart({ cur, prev, labels, money }: { cur: number[]; prev: number[]; labels: string[]; money: boolean }) {
  const on = useMounted()
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const W = 1100, H = 240, L = 52, Rt = 16, T = 16, B = 28
  const n = cur.length
  const max = Math.max(...cur, ...prev) * 1.1
  const fmt = (v: number) => (money ? inr(v) : num(v))
  const x = (i: number) => L + (i / (n - 1)) * (W - L - Rt)
  const y = (v: number) => T + (1 - v / max) * (H - T - B)
  const pc = cur.map((v, i) => [x(i), y(v)] as [number, number])
  const pp = prev.map((v, i) => [x(i), y(v)] as [number, number])
  const step = n > 10 ? 5 : 1
  const idx = hover ?? n - 1
  const bx = Math.min(Math.max(x(idx) - 80, L), W - Rt - 160)
  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((e.clientX - rect.left) / rect.width) * W
    setHover(Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - Rt)) * (n - 1)))))
  }
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto max-h-[260px] w-full" role="img" aria-label={`Trend over the last ${n} days`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      {[0, 1 / 3, 2 / 3, 1].map((t) => {
        const gy = T + (1 - t) * (H - T - B)
        return (
          <g key={t}>
            <line x1={L} x2={W - Rt} y1={gy} y2={gy} stroke="#D9D9E2" strokeDasharray="3 4" />
            <text x={L - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="#6B6B75">{money ? `${R}${compact(max * t)}` : compact(max * t)}</text>
          </g>
        )
      })}
      <path d={`${smooth(pc)} L${x(n - 1)},${H - B} L${x(0)},${H - B} Z`} fill="#ACBCFF" fillOpacity={on ? 0.06 : 0} style={{ transition: 'fill-opacity 900ms ease-out 400ms' }} />
      <path d={smooth(pp)} fill="none" stroke="#6B6B75" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
      <path d={smooth(pc)} pathLength={1} fill="none" stroke="#ACBCFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={1} strokeDashoffset={on ? 0 : 1} style={{ transition: 'stroke-dashoffset 1100ms ease-out' }} />
      {labels.map((l, i) => (i % step === 0 ? <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6B6B75">{l}</text> : null))}
      <line x1={x(idx)} x2={x(idx)} y1={T} y2={H - B} stroke="#6B6B75" strokeOpacity="0.5" />
      <circle cx={x(idx)} cy={y(cur[idx])} r="4.5" fill="white" stroke="#ACBCFF" strokeWidth="2.5" />
      <rect x={bx} y={T - 2} width="160" height="54" rx="6" fill="#101012" />
      <text x={bx + 12} y={T + 14} fontSize="10" fill="#6B6B75">{labels[idx]}</text>
      <text x={bx + 12} y={T + 30} fontSize="12" fill="white">This period {fmt(cur[idx])}</text>
      <text x={bx + 12} y={T + 46} fontSize="12" fill="#6B6B75">Previous {fmt(prev[idx])}</text>
    </svg>
  )
}

/* ---------- Page ---------- */
export default function PublisherDashboardPage() {
  const [range, setRange] = useState<7 | 30>(30)
  const [metric, setMetric] = useState<Metric>('Earnings')
  const on = useMounted()

  const scale = range === 7 ? 0.26 : 1
  const totalEarn = SITES.reduce((a, s) => a + s.earnings, 0)
  const totalImp = SITES.reduce((a, s) => a + s.impressions, 0)
  const totalClk = SITES.reduce((a, s) => a + s.clicks, 0)
  const ecpm = totalImp ? (totalEarn / totalImp) * 1000 : 0
  const payoutPct = Math.min(100, Math.round((totalEarn / PAYOUT_MIN) * 100))

  const base = metric === 'Earnings' ? totalEarn / 30 : metric === 'Impressions' ? totalImp / 30 : totalClk / 30
  const money = metric === 'Earnings'
  const cur = useMemo(() => makeSeries(base, range, 5 + range), [base, range])
  const prev = useMemo(() => makeSeries(base * 0.88, range, 29 + range, 0.04), [base, range])
  const labels = useMemo(() => dayLabels(range), [range])
  const total = cur.reduce((t, v) => t + v, 0)

  const kpis = [
    { label: 'Earnings', value: totalEarn * scale, format: inr },
    { label: 'Impressions', value: totalImp * scale, format: num },
    { label: 'Clicks', value: totalClk * scale, format: num },
    { label: 'eCPM', value: ecpm, format: (n: number) => `${R}${n.toFixed(2)}` },
  ]
  const inReview = SITES.find((s) => s.status === 'In review')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Publisher / Home</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Home</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs label="Date range" items={[7, 30] as (7 | 30)[]} value={range} onChange={setRange} />
          <Link href="/publisher/websites" className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add website
          </Link>
        </div>
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
                <Tabs label="Metric" items={['Earnings', 'Impressions', 'Clicks'] as Metric[]} value={metric} onChange={setMetric} />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-[#ACBCFF]" aria-hidden="true" />This period</span>
                  <span className="inline-flex items-center gap-2"><span className="h-0 w-4 border-t-2 border-dashed border-border" aria-hidden="true" />Previous</span>
                </div>
              </div>
              <p className="mt-3 text-xl font-semibold tabular-nums text-foreground">{money ? inr(total) : num(total)} <span className="text-xs font-normal text-muted-foreground">in the last {range} days</span></p>
              <div className="mt-2"><LineChart key={`${metric}-${range}`} cur={cur} prev={prev} labels={labels} money={money} /></div>
            </section>
          </Reveal>
        </div>

        <div className="col-span-12 space-y-4 xl:col-span-4">
          <Reveal delay={380}>
            <section className={CARD} aria-label="Next payout">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-foreground">Next payout</h2>
                <p className="text-sm tabular-nums text-foreground">{inr(totalEarn)} / {inr(PAYOUT_MIN)}</p>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-progress" style={{ width: on ? `${payoutPct}%` : '0%', transition: 'width 800ms ease-out' }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{payoutPct}% of the minimum payout. {inr(PAYOUT_MIN - totalEarn)} to go.</p>
            </section>
          </Reveal>
          <Reveal delay={460}>
            <section className={CARD} aria-label="Tasks to complete">
              <h2 className="text-base font-semibold text-foreground">Tasks to complete</h2>
              <ul className="mt-2 divide-y divide-border">
                {inReview && (
                  <li className="flex items-center gap-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><Clock className="h-4 w-4" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{inReview.name} is in review</p><p className="text-xs text-muted-foreground">Usually a day or two</p></div>
                    <Link href="/publisher/websites" className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">View</Link>
                  </li>
                )}
                <li className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><Wallet className="h-4 w-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">Add a payout method</p><p className="text-xs text-muted-foreground">Needed to get paid</p></div>
                  <Link href="/publisher/payments" className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">Add</Link>
                </li>
              </ul>
            </section>
          </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal delay={540}>
          <section className={`${CARD} h-full`} aria-label="Earnings by ad format">
            <h2 className="mb-4 text-base font-semibold text-foreground">Earnings by ad format</h2>
            <Donut parts={FORMATS} />
          </section>
        </Reveal>
        <Reveal delay={620}>
          <section className={`${CARD} h-full`} aria-label="Earnings by country">
            <h2 className="mb-4 text-base font-semibold text-foreground">Earnings by country</h2>
            <HBars rows={COUNTRIES} />
          </section>
        </Reveal>
      </div>

      <Reveal delay={700}>
        <section className="overflow-hidden rounded-lg border border-border bg-white" aria-label="Websites">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">Websites</h2>
            <Link href="/publisher/websites" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">Manage</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Website</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Impressions</th>
                  <th className="px-3 py-3 text-right font-medium">Clicks</th>
                  <th className="px-4 py-3 text-right font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {SITES.map((s) => (
                  <tr key={s.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-3 py-3"><span className="inline-flex items-center gap-2 text-foreground"><span className={`h-2 w-2 rounded-full ${s.status === 'Approved' ? 'bg-green-500' : 'bg-primary'}`} aria-hidden="true" />{s.status}</span></td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.impressions ? num(s.impressions * scale) : '\u2014'}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.clicks ? num(s.clicks * scale) : '\u2014'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.earnings ? inr(s.earnings * scale) : '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
