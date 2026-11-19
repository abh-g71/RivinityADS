'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Check, X } from 'lucide-react'
import { mockAdminActivity, mockAdminSupportTickets, mockAdminUsers } from '@/data/admin'

const R = '\u20B9'
const inr = (n: number) => `${R}${Math.round(n).toLocaleString('en-IN')}`
const num = (n: number) => Math.round(n).toLocaleString('en-IN')
const compact = (n: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

type Item = { id: string; kind: 'Website' | 'Campaign'; name: string; owner: string; submitted: string; state: 'Pending' | 'Approved' | 'Rejected' }
const QUEUE: Item[] = [
  { id: 'q1', kind: 'Website', name: 'gadgetreviews.example', owner: 'Publisher: Neha S.', submitted: '17 Nov', state: 'Pending' },
  { id: 'q2', kind: 'Campaign', name: 'Product awareness demo', owner: 'Advertiser: Abhi', submitted: '17 Nov', state: 'Pending' },
  { id: 'q3', kind: 'Website', name: 'travelnotes.example', owner: 'Publisher: Rohan K.', submitted: '16 Nov', state: 'Pending' },
  { id: 'q4', kind: 'Campaign', name: 'App launch · India', owner: 'Advertiser: Meera J.', submitted: '16 Nov', state: 'Pending' },
]
const SPLIT = [
  { name: 'Paid to publishers', value: 68, color: '#ACBCFF' },
  { name: 'Platform revenue', value: 24, color: '#6EE0A9' },
  { name: 'Fees and refunds', value: 8, color: '#6B6B75' },
]

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

function LineChart({ cur, prev, labels }: { cur: number[]; prev: number[]; labels: string[] }) {
  const on = useMounted()
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const W = 1100, H = 240, L = 56, Rt = 16, T = 16, B = 28
  const n = cur.length
  const max = Math.max(...cur, ...prev) * 1.1
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
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto max-h-[260px] w-full" role="img" aria-label={`Platform revenue over the last ${n} days`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      {[0, 1 / 3, 2 / 3, 1].map((t) => {
        const gy = T + (1 - t) * (H - T - B)
        return (
          <g key={t}>
            <line x1={L} x2={W - Rt} y1={gy} y2={gy} stroke="#D9D9E2" strokeDasharray="3 4" />
            <text x={L - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="#6B6B75">{`${R}${compact(max * t)}`}</text>
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
      <text x={bx + 12} y={T + 30} fontSize="12" fill="white">This period {inr(cur[idx])}</text>
      <text x={bx + 12} y={T + 46} fontSize="12" fill="#6B6B75">Previous {inr(prev[idx])}</text>
    </svg>
  )
}

function SplitBars() {
  const on = useMounted()
  return (
    <ul className="space-y-4">
      {SPLIT.map((r, i) => (
        <li key={r.name}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-foreground">{r.name}</span>
            <span className="tabular-nums text-foreground">{r.value}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full" style={{ width: on ? `${r.value}%` : '0%', background: r.color, transition: `width 800ms ease-out ${i * 80}ms` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState<7 | 30>(30)
  const [queue, setQueue] = useState<Item[]>(QUEUE)

  const scale = range === 7 ? 0.26 : 1
  const pending = queue.filter((q) => q.state === 'Pending').length
  const openTickets = mockAdminSupportTickets.filter((t) => t.status !== 'Resolved').length

  const cur = useMemo(() => makeSeries(4200, range, 9 + range), [range])
  const prev = useMemo(() => makeSeries(4200 * 0.9, range, 33 + range, 0.04), [range])
  const labels = useMemo(() => dayLabels(range), [range])
  const total = cur.reduce((t, v) => t + v, 0)

  function decide(id: string, state: 'Approved' | 'Rejected') {
    setQueue((list) => list.map((q) => (q.id === id ? { ...q, state } : q)))
  }

  const kpis = [
    { label: 'Platform revenue', value: 126000 * scale, format: inr, delta: range === 7 ? 6.2 : 11.8 },
    { label: 'Users', value: mockAdminUsers.length, format: num, delta: 4.0 },
    { label: 'In review', value: pending, format: num, delta: null as number | null },
    { label: 'Open tickets', value: openTickets, format: num, delta: null as number | null },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Admin / Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
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
                {k.delta !== null && <Trend value={k.delta} />}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <div className="col-span-12 xl:col-span-8">
          <Reveal delay={300}>
            <section className={CARD} aria-label="Platform revenue">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">Platform revenue</h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-[#ACBCFF]" aria-hidden="true" />This period</span>
                  <span className="inline-flex items-center gap-2"><span className="h-0 w-4 border-t-2 border-dashed border-border" aria-hidden="true" />Previous</span>
                </div>
              </div>
              <p className="mt-3 text-xl font-semibold tabular-nums text-foreground">{inr(total)} <span className="text-xs font-normal text-muted-foreground">in the last {range} days</span></p>
              <div className="mt-2"><LineChart key={range} cur={cur} prev={prev} labels={labels} /></div>
            </section>
          </Reveal>
        </div>
        <div className="col-span-12 xl:col-span-4">
          <Reveal delay={380}>
            <section className={CARD} aria-label="Where the money goes">
              <h2 className="mb-4 text-base font-semibold text-foreground">Where the money goes</h2>
              <SplitBars />
            </section>
          </Reveal>
        </div>
      </div>

      <Reveal delay={460}>
        <section className="overflow-hidden rounded-lg border border-border bg-white" aria-label="Review queue">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">Review queue</h2>
            <div className="flex gap-2 text-sm">
              <Link href="/admin/websites" className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground hover:bg-muted">Websites</Link>
              <Link href="/admin/campaigns" className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground hover:bg-muted">Campaigns</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-3 py-3 font-medium">Owner</th>
                  <th className="px-3 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 text-right font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q) => (
                  <tr key={q.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3"><p className="font-medium text-foreground">{q.name}</p><p className="text-xs text-muted-foreground">{q.kind}</p></td>
                    <td className="px-3 py-3 text-foreground">{q.owner}</td>
                    <td className="px-3 py-3 text-foreground">{q.submitted}</td>
                    <td className="px-4 py-3">
                      {q.state === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => decide(q.id, 'Approved')} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"><Check className="h-3.5 w-3.5" aria-hidden="true" />Approve</button>
                          <button type="button" onClick={() => decide(q.id, 'Rejected')} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"><X className="h-3.5 w-3.5" aria-hidden="true" />Reject</button>
                        </div>
                      ) : (
                        <p className="text-right text-xs font-medium text-muted-foreground"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${q.state === 'Approved' ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true" />{q.state}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      <Reveal delay={540}>
        <section className={CARD} aria-label="Recent activity">
          <h2 className="text-base font-semibold text-foreground">Recent activity</h2>
          {mockAdminActivity.length ? (
            <ul className="mt-2 divide-y divide-border">
              {mockAdminActivity.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="text-sm text-foreground">{a.description}</span>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No recent activity.</p>
          )}
        </section>
      </Reveal>
    </div>
  )
}