'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Select } from '@/components/ui/Select'
import { publisherAdFormats, mockPublisherStatistics, type PublisherStatisticsRow } from '@/data/publisher'
import { usePublisherData } from '@/components/shared/PublisherDataProvider'

function ImpressionsLineChart({ rows }: { rows: PublisherStatisticsRow[] }) {
  const width = 720
  const height = 240
  const padding = 32
  const maxImpressions = Math.max(1, ...rows.map((row) => row.impressions))
  const points = rows.map((row, index) => {
    const x = rows.length === 1
      ? width / 2
      : padding + index * ((width - padding * 2) / (rows.length - 1))
    const y = height - padding - (row.impressions / maxImpressions) * (height - padding * 2)
    return { x, y, row }
  })

  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label="Mock impressions by date"
        viewBox={`0 0 ${width} ${height}`}
        className="h-60 min-w-[560px] w-full"
      >
        <title>Mock impressions by date</title>
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
            <title>{`${row.date}: ${row.impressions.toLocaleString('en-IN')} mock impressions`}</title>
            <circle cx={x} cy={y} r="5" className="fill-brand-600" />
            <text x={x} y={height - 8} textAnchor="middle" className="fill-slate-600 text-xs">{row.date}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function PublisherStatisticsPage() {
  const { websites } = usePublisherData()
  const [range, setRange] = useState('7-days')
  const [website, setWebsite] = useState('')
  const [format, setFormat] = useState('')
  const rows = useMemo(
    () => {
      const start = new Date()
      if (range === '7-days') start.setDate(start.getDate() - 6)
      else if (range === '30-days') start.setDate(start.getDate() - 29)
      else start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return mockPublisherStatistics.filter((row) => {
        const rowDate = new Date(`${row.date}T00:00:00`)
        return (!website || row.website === website)
          && (!format || row.format === format)
          && rowDate >= start
          && rowDate <= end
      })
    },
    [format, range, website],
  )

  const columns: DataTableColumn<PublisherStatisticsRow>[] = [
    { key: 'date', header: 'Date', render: (row) => row.date },
    { key: 'website', header: 'Website', render: (row) => row.website },
    { key: 'format', header: 'Ad unit', render: (row) => row.format },
    { key: 'impressions', header: 'Impressions', render: (row) => row.impressions.toLocaleString('en-IN') },
    { key: 'clicks', header: 'Clicks', render: (row) => row.clicks.toLocaleString('en-IN') },
    { key: 'ctr', header: 'CTR', render: (row) => row.ctr },
    { key: 'earnings', header: 'Earnings', render: (row) => row.earnings },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Publisher', href: '/publisher' }, { label: 'Statistics' }]}
        title="Statistics"
        description="Review mock delivery and earnings breakdowns. No real tracking data is shown."
        action={<Link href="/publisher/earnings" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View earnings</Link>}
      />

      <Card className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
        <Select
          label="Date range"
          value={range}
          onChange={(event) => setRange(event.target.value)}
          options={[
            { value: '7-days', label: 'Last 7 days' },
            { value: '30-days', label: 'Last 30 days' },
            { value: 'this-month', label: 'This month' },
          ]}
        />
        <Select
          label="Website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          options={[
            { value: '', label: 'All websites' },
            ...websites.map((site) => ({ value: site.domain, label: site.domain })),
          ]}
        />
        <Select
          label="Ad unit"
          value={format}
          onChange={(event) => setFormat(event.target.value)}
          options={[
            { value: '', label: 'All ad units' },
            ...publisherAdFormats.map((item) => ({ value: item, label: item })),
          ]}
        />
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Impressions over time</h2>
        <ImpressionsLineChart rows={rows} />
        {!rows.length && (
          <p role="status" className="mt-2 text-sm text-muted-foreground">
            No mock time-series data is configured. The chart does not infer or invent data points.
          </p>
        )}
      </Card>

      <section aria-label="Publisher statistics">
        {rows.length ? (
          <DataTable label="Publisher statistics" columns={columns} rows={rows} />
        ) : (
          <EmptyState
            title="No statistics available"
            description="There are no mock rows for this selection. Try another filter or return when sample data is provided."
          />
        )}
      </section>
    </div>
  )
}
