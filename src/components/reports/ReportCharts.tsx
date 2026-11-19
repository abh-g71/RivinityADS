'use client'

import type { ReportRow } from '@/data/reports'

export type ReportMetric = 'impressions' | 'clicks' | 'spend' | 'earnings'

function metricValue(row: ReportRow, metric: ReportMetric) {
  return row[metric]
}

function formatMetric(value: number, metric: ReportMetric) {
  return metric === 'spend' || metric === 'earnings'
    ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    : value.toLocaleString('en-IN')
}

export function ReportLineChart({ rows, metric, title }: { rows: ReportRow[]; metric: ReportMetric; title: string }) {
  const width = Math.max(560, rows.length * 110)
  const height = 240
  const padding = 34
  const maxValue = Math.max(1, ...rows.map((row) => metricValue(row, metric)))
  const points = rows.map((row, index) => {
    const x = rows.length === 1 ? width / 2 : padding + index * ((width - padding * 2) / (rows.length - 1))
    const y = height - padding - (metricValue(row, metric) / maxValue) * (height - padding * 2)
    return { x, y, row }
  })

  return (
    <div className="overflow-x-auto">
      <svg role="img" aria-label={title} viewBox={`0 0 ${width} ${height}`} className="h-60 min-w-[560px] w-full">
        <title>{title}</title>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + line * ((height - padding * 2) / 3)
          return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-slate-200" />
        })}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-slate-300" />
        {points.length > 1 && (
          <polyline
            points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="text-foreground"
          />
        )}
        {points.map(({ x, y, row }) => (
          <g key={row.id}>
            <title>{`${row.date}: ${formatMetric(metricValue(row, metric), metric)}`}</title>
            <circle cx={x} cy={y} r="5" className="fill-brand-600" />
            <text x={x} y={height - 8} textAnchor="middle" className="fill-slate-600 text-xs">{row.date}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function ReportBarChart({ rows, metric, title }: { rows: ReportRow[]; metric: ReportMetric; title: string }) {
  const width = Math.max(560, rows.length * 120)
  const height = 240
  const padding = 34
  const slot = (width - padding * 2) / Math.max(rows.length, 1)
  const barWidth = Math.min(56, slot * 0.6)
  const maxValue = Math.max(1, ...rows.map((row) => metricValue(row, metric)))

  return (
    <div className="overflow-x-auto">
      <svg role="img" aria-label={title} viewBox={`0 0 ${width} ${height}`} className="h-60 min-w-[560px] w-full">
        <title>{title}</title>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + line * ((height - padding * 2) / 3)
          return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-slate-200" />
        })}
        {rows.map((row, index) => {
          const value = metricValue(row, metric)
          const barHeight = Math.max(2, (value / maxValue) * (height - padding * 2))
          const x = padding + index * slot + (slot - barWidth) / 2
          const y = height - padding - barHeight
          return (
            <g key={row.id}>
              <title>{`${row.dimensionValue}: ${formatMetric(value, metric)}`}</title>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="8" className="fill-brand-600" />
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className="fill-slate-600 text-xs">{row.dimensionValue.slice(0, 12)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
