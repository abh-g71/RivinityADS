'use client'

import { useEffect, useMemo, useState } from 'react'
import type { IconType } from 'react-icons'
import { FiBarChart2, FiCreditCard, FiEye, FiMousePointer, FiPercent, FiTarget } from 'react-icons/fi'
import { Card } from '@/components/ui/Card'

type StatCardProps = {
  label: string
  value: string
  detail?: string
}

function getNumericParts(value: string) {
  const match = value.match(/^([^0-9-]*)(-?\d[\d,]*(?:\.\d+)?)(.*)$/)
  if (!match) return null

  const digits = match[2].replaceAll(',', '')
  const amount = Number(digits)
  if (!Number.isFinite(amount)) return null

  const decimals = digits.split('.')[1]?.length ?? 0
  return { prefix: match[1], suffix: match[3], amount, decimals }
}

// Picks an icon from the label, so no extra props are needed.
function iconFor(label: string): IconType {
  const l = label.toLowerCase()
  if (/(spend|earn|revenue|balance|budget|payout|fund)/.test(l)) return FiCreditCard
  if (/(impression|view|traffic|visitor)/.test(l)) return FiEye
  if (/click/.test(l)) return FiMousePointer
  if (/(ctr|rate|%)/.test(l)) return FiPercent
  if (/(conversion|lead|goal)/.test(l)) return FiTarget
  return FiBarChart2
}

// Decorative mini chart. Mock shape only, generated from the label.
function sparkPath(seed: string) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const ys: number[] = []
  for (let i = 0; i < 8; i++) {
    h = (h * 1664525 + 1013904223) >>> 0
    ys.push(30 - (4 + ((h % 1000) / 1000) * 20) - i * 0.8)
  }
  const step = 80 / 7
  const line = ys.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${y.toFixed(1)}`).join(' ')
  return { line, area: `${line} L80,32 L0,32 Z` }
}

export function StatCard({ label, value, detail = 'Mock data' }: StatCardProps) {
  const number = useMemo(() => getNumericParts(value), [value])
  const [count, setCount] = useState(0)
  const Icon = iconFor(label)
  const spark = useMemo(() => sparkPath(label), [label])

  useEffect(() => {
    if (!number) return

    let frame = 0
    let startedAt: number | undefined
    const duration = 800
    const target = number.amount

    function tick(now: number) {
      if (startedAt === undefined) startedAt = now
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setCount(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame = requestAnimationFrame(() => setCount(target))
    } else {
      frame = requestAnimationFrame(tick)
    }

    return () => cancelAnimationFrame(frame)
  }, [number])

  const displayValue = number
    ? `${number.prefix}${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: number.decimals,
      maximumFractionDigits: number.decimals,
    }).format(count)}${number.suffix}`
    : value

  return (
    <Card className="group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{label}</p>
          <p
            className="mt-2 text-2xl font-bold tabular-nums text-navy-900"
            aria-label={`${label}: ${value}`}
          >
            {displayValue}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/25 transition group-hover:scale-105">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <svg
        viewBox="0 0 80 32"
        preserveAspectRatio="none"
        className="mt-3 h-8 w-full text-brand-500"
        aria-hidden="true"
      >
        <path d={spark.area} fill="currentColor" opacity="0.12" />
        <path d={spark.line} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </Card>
  )
}