'use client'

import { useEffect, useMemo, useState } from 'react'
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

export function StatCard({ label, value, detail = 'Mock data' }: StatCardProps) {
  const number = useMemo(() => getNumericParts(value), [value])
  const [count, setCount] = useState(0)

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
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-navy-900" aria-label={`${label}: ${value}`}>{displayValue}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </Card>
  )
}
