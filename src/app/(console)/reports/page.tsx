'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Download } from 'lucide-react'

/* ---------- Sample data ---------- */
type Campaign = { name: string; objective: string; status: string; spend: number; impressions: number; clicks: number; results: number }
const CAMPAIGNS: Campaign[] = [
  { name: 'Diwali sale · Delhi', objective: 'Website visits', status: 'Active', spend: 14200, impressions: 182400, clicks: 5110, results: 5110 },
  { name: 'Salon bookings · Pune', objective: 'Leads', status: 'Active', spend: 9800, impressions: 96300, clicks: 2140, results: 312 },
  { name: 'Winter collection · Online', objective: 'Sales', status: 'Active', spend: 21400, impressions: 143800, clicks: 3920, results: 188 },
  { name: 'Event tickets · Mumbai', objective: 'Awareness', status: 'Paused', spend: 4600, impressions: 211500, clicks: 1650, results: 1650 },
]
const COLORS = ['#ACBCFF', '#6EE0A9', '#6B6B75', '#101012']
const DELTAS: Record<7 | 30, number[]> = { 7: [12.4, 9.1, -2.1, 8.2], 30: [18.9, 11.2, -1.4, 14.6] }
const TEMPLATES = {
  Performance: { key: 'impressions', label: 'Impressions', base: 21000, money: false },
  Spend: { key: 'spend', label: 'Spend', base: 2400, money: true },
  Conversions: { key: 'results', label: 'Results', base: 300, money: false },
} as const
type Template = keyof typeof TEMPLATES
type MetricKey = 'impressions' | 'spend' | 'results'

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
  useEffect(() => {
    const r = requestAnimationFrame(() => setOn(true))
    return () => cancelAnimationFrame(r)
  }, [])
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
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const on = useMounted()
  return (
    <div className={`transition-all duration-500 ease-out motion-reduce:transition-none ${on ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
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

function Kpi({ label, value, format, delta, delay }: { label: string; value: number; format: (n: number) => string; delta: number; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className={CARD}>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="truncate text-2xl font-semibold tabular-nums text-foreground"><Count value={value} format={format} /></p>
          <Trend value={delta} />
        </div>
      </div>
    </Reveal>
  )
}

/* ---------- Line chart (draws itself) ---------- */
function LineChart({ cur, prev, labels, money }: { cur: number[]; prev: number[] | null; labels: string[]; money: boolean }) {
  const on = useMounted()
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const W = 1100, H = 240, L = 48, R = 16, T = 16, B = 28
  const n = cur.length
  const max = Math.max(...cur, ...(prev ?? [0])) * 1.1
  const fmt = (v: number) => (money ? inr(v) : num(v))
  const x = (i: number) => L + (i / (n - 1)) * (W - L - R)
  const y = (v: number) => T + (1 - v / max) * (H - T - B)
  const pc = cur.map((v, i) => [x(i), y(v)] as [number, number])
  const pp = prev ? prev.map((v, i) => [x(i), y(v)] as [number, number]) : null
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
            <line x1={L} x2={W - R} y1={gy} y2={gy} stroke="#D9D9E2" strokeDasharray="3 4" />
            <text x={L - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="#6B6B75">{money ? `₹${compact(max * t)}` : compact(max * t)}</text>
          </g>
        )
      })}
      <path d={`${smooth(pc)} L${x(n - 1)},${H - B} L${x(0)},${H - B} Z`} fill="#ACBCFF" fillOpacity={on ? 0.06 : 0} style={{ transition: 'fill-opacity 900ms ease-out 400ms' }} />
      {pp && <path d={smooth(pp)} fill="none" stroke="#6B6B75" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />}
      <path d={smooth(pc)} pathLength={1} fill="none" stroke="#ACBCFF" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={1} strokeDashoffset={on ? 0 : 1} style={{ transition: 'stroke-dashoffset 1100ms ease-out' }} />
      {labels.map((l, i) => (i % step === 0 ? <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6B6B75">{l}</text> : null))}
      <line x1={x(idx)} x2={x(idx)} y1={T} y2={H - B} stroke="#6B6B75" strokeOpacity="0.5" />
      <circle cx={x(idx)} cy={y(cur[idx])} r="4.5" fill="white" stroke="#ACBCFF" strokeWidth="2.5" />
      <rect x={bx} y={T - 2} width="160" height={prev ? 54 : 40} rx="6" fill="#101012" />
      <text x={bx + 12} y={T + 14} fontSize="10" fill="#6B6B75">{labels[idx]}</text>
      <text x={bx + 12} y={T + 30} fontSize="12" fill="white">This period {fmt(cur[idx])}</text>
      {prev && <text x={bx + 12} y={T + 46} fontSize="12" fill="#6B6B75">Previous {fmt(prev[idx])}</text>}
    </svg>
  )
}

/* ---------- Donut (segments grow in) ---------- */
function Donut({ parts, centerLabel, total, format }: { parts: { name: string; value: number; color: string }[]; centerLabel: string; total: number; format: (n: number) => string }) {
  const on = useMounted()
  const r = 70
  const C = 2 * Math.PI * r
  const segments = parts.map((p, i) => {
    const before = parts.slice(0, i).reduce((s, q) => s + (q.value / total) * C, 0)
    return { ...p, len: Math.max(0, (p.value / total) * C - 2), offset: -before }
  })
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label="Share by campaign">
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
          <p className="text-xs text-muted-foreground">{centerLabel}</p>
          <p className="text-lg font-semibold tabular-nums text-foreground"><Count value={total} format={format} /></p>
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

/* ---------- Horizontal bars (grow in) ---------- */
function HBars({ rows, format }: { rows: { name: string; value: number; color: string }[]; format: (n: number) => string }) {
  const on = useMounted()
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="space-y-4">
      {rows.map((r, i) => (
        <li key={r.name}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-foreground">{r.name}</span>
            <span className="tabular-nums text-foreground">{format(r.value)}</span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full" style={{ width: on ? `${(r.value / max) * 100}%` : '0%', background: r.color, transition: `width 800ms ease-out ${i * 80}ms` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Weekday columns (grow up) ---------- */
function Columns({ values }: { values: number[] }) {
  const on = useMounted()
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const max = Math.max(...values)
  const best = values.indexOf(max)
  return (
    <div className="flex h-44 items-end justify-between gap-2" role="img" aria-label="Results by day of week">
      {values.map((v, i) => (
        <div key={days[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">{v}</span>
          <div className="w-full rounded-t" style={{ height: on ? `${(v / max) * 100}%` : '0%', background: i === best ? '#ACBCFF' : '#D9D9E2', transition: `height 700ms ease-out ${i * 60}ms`, minHeight: 2 }} />
          <span className="text-xs text-muted-foreground">{days[i]}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Page ---------- */
export default function ReportsPage() {
  const [range, setRange] = useState<7 | 30>(7)
  const [template, setTemplate] = useState<Template>('Performance')
  const [compare, setCompare] = useState(true)

  const scale = range === 7 ? 0.26 : 1
  const t = TEMPLATES[template]
  const mk = t.key as MetricKey
  const fmt = t.money ? inr : num

  const rows = useMemo(() => CAMPAIGNS.map((c) => ({ ...c, spend: c.spend * scale, impressions: c.impressions * scale, clicks: c.clicks * scale, results: c.results * scale })), [scale])
  const sum = (k: 'spend' | 'impressions' | 'clicks' | 'results') => rows.reduce((a, c) => a + c[k], 0)
  const imp = sum('impressions'), clk = sum('clicks'), spd = sum('spend')
  const ctr = imp ? (clk / imp) * 100 : 0

  const cur = useMemo(() => makeSeries(t.base, range, 7 + range), [t.base, range])
  const prev = useMemo(() => makeSeries(t.base * 0.88, range, 31 + range, 0.04), [t.base, range])
  const labels = useMemo(() => dayLabels(range), [range])
  const delta = DELTAS[range]

  const total = rows.reduce((a, c) => a + c[mk], 0)
  const parts = rows.map((c, i) => ({ name: c.name, value: c[mk], color: COLORS[i % COLORS.length] }))
  const byObjective = Object.entries(rows.reduce<Record<string, number>>((a, c) => ({ ...a, [c.objective]: (a[c.objective] ?? 0) + c[mk] }), {}))
    .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
  const devices = [
    { name: 'Mobile', value: total * 0.64, color: '#ACBCFF' },
    { name: 'Desktop', value: total * 0.28, color: '#6EE0A9' },
    { name: 'Tablet', value: total * 0.08, color: '#6B6B75' },
  ]
  const weekday = [62, 71, 68, 80, 94, 118, 105]
  const sorted = [...rows].sort((a, b) => b[mk] - a[mk])

  function exportCsv() {
    const q = (s: string) => `"${s.replace(/"/g, '""')}"`
    const lines = ['Campaign,Objective,Status,Impressions,Clicks,CTR %,Spend (INR),Results']
    rows.forEach((c) => lines.push([q(c.name), q(c.objective), c.status, Math.round(c.impressions), Math.round(c.clicks), c.impressions ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0', Math.round(c.spend), Math.round(c.results)].join(',')))
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `rivinityads-report-${range}-days.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Advertiser / Reports</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
        </div>
        <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-5">
        <Tabs label="Date range" items={[7, 30] as (7 | 30)[]} value={range} onChange={setRange} />
        <Tabs label="Report template" items={Object.keys(TEMPLATES) as Template[]} value={template} onChange={setTemplate} />
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <button type="button" role="switch" aria-checked={compare} aria-label="Compare previous period" onClick={() => setCompare((c) => !c)}
            className={`relative h-5 w-9 rounded-full transition-colors ${compare ? 'bg-primary' : 'bg-muted-foreground'}`}>
            <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${compare ? 'translate-x-4' : ''}`} />
          </button>
          Compare previous period
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Impressions" value={imp} format={num} delta={delta[0]} delay={0} />
        <Kpi label="Clicks" value={clk} format={num} delta={delta[1]} delay={80} />
        <Kpi label="CTR" value={ctr} format={(n) => `${n.toFixed(2)}%`} delta={delta[2]} delay={160} />
        <Kpi label="Spend" value={spd} format={inr} delta={delta[3]} delay={240} />
      </div>

      <Reveal delay={300}>
        <section className={CARD} aria-label={`${t.label} over time`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">{t.label} over time</h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-[#ACBCFF]" aria-hidden="true" />This period</span>
              {compare && <span className="inline-flex items-center gap-2"><span className="h-0 w-4 border-t-2 border-dashed border-border" aria-hidden="true" />Previous period</span>}
            </div>
          </div>
          <div className="mt-2">
            <LineChart key={`${template}-${range}`} cur={cur} prev={compare ? prev : null} labels={labels} money={t.money} />
          </div>
        </section>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal delay={380}>
          <section className={`${CARD} h-full`} aria-label="Share by campaign">
            <h2 className="mb-4 text-base font-semibold text-foreground">{t.label} by campaign</h2>
            <Donut key={`d-${template}-${range}`} parts={parts} centerLabel="Total" total={total} format={fmt} />
          </section>
        </Reveal>
        <Reveal delay={460}>
          <section className={`${CARD} h-full`} aria-label="By objective">
            <h2 className="mb-4 text-base font-semibold text-foreground">{t.label} by goal</h2>
            <HBars key={`o-${template}-${range}`} rows={byObjective} format={fmt} />
          </section>
        </Reveal>
        <Reveal delay={540}>
          <section className={`${CARD} h-full`} aria-label="By device">
            <h2 className="mb-4 text-base font-semibold text-foreground">{t.label} by device</h2>
            <HBars key={`v-${template}-${range}`} rows={devices} format={fmt} />
          </section>
        </Reveal>
        <Reveal delay={620}>
          <section className={`${CARD} h-full`} aria-label="By day of week">
            <h2 className="mb-4 text-base font-semibold text-foreground">Best days to run ads</h2>
            <Columns values={weekday} />
          </section>
        </Reveal>
      </div>

      <Reveal delay={700}>
        <section className="overflow-hidden rounded-lg border border-border bg-white" aria-label="Campaign breakdown">
          <h2 className="px-4 py-3 text-base font-semibold text-foreground">Campaign breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="px-3 py-3 text-right font-medium">Impressions</th>
                  <th className="px-3 py-3 text-right font-medium">Clicks</th>
                  <th className="px-3 py-3 text-right font-medium">CTR</th>
                  <th className="px-3 py-3 text-right font-medium">Results</th>
                  <th className="px-4 py-3 text-right font-medium">Spend</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3"><p className="font-medium text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.objective}</p></td>
                    <td className="px-3 py-3 text-right tabular-nums">{num(c.impressions)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{num(c.clicks)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{((c.clicks / c.impressions) * 100).toFixed(2)}%</td>
                    <td className="px-3 py-3 text-right tabular-nums">{num(c.results)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{inr(c.spend)}</td>
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