'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Select } from '@/components/ui/Select'
import { advertiserAdUnits, advertiserCountries, advertiserDevices, advertiserTrafficTypes, mockAdvertiserTraffic, type TrafficSample } from '@/data/advertiser'

function TrafficBarChart({ rows }: { rows: TrafficSample[] }) {
  const values = rows.map((row) => Number(row.dailyImpressions.replaceAll(',', '')))
  const maxValue = Math.max(1, ...values)
  const chartWidth = Math.max(420, rows.length * 140)
  const chartHeight = 220
  const plotHeight = 150
  const barWidth = 56

  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label="Mock daily impressions by country"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-56 min-w-[420px] w-full"
      >
        <title>Mock daily impressions by country</title>
        <line x1="20" y1={plotHeight} x2={chartWidth - 20} y2={plotHeight} className="stroke-slate-300" />
        {rows.map((row, index) => {
          const value = Number(row.dailyImpressions.replaceAll(',', ''))
          const height = Math.max(2, (value / maxValue) * (plotHeight - 22))
          const x = 56 + index * 140
          const y = plotHeight - height
          return (
            <g key={row.id}>
              <title>{`${row.country}: ${row.dailyImpressions} mock daily impressions`}</title>
              <rect x={x} y={y} width={barWidth} height={height} rx="8" className="fill-brand-600" />
              <text x={x + barWidth / 2} y={y - 7} textAnchor="middle" className="fill-navy-900 text-xs">{row.dailyImpressions}</text>
              <text x={x + barWidth / 2} y="196" textAnchor="middle" className="fill-slate-600 text-xs">{row.country}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function TrafficChartPage() {
  const [adUnit, setAdUnit] = useState('')
  const [traffic, setTraffic] = useState('')
  const [device, setDevice] = useState('')
  const [country, setCountry] = useState('')
  const [os, setOs] = useState('')

  const visibleRows = mockAdvertiserTraffic.filter((row) => !country || row.country === country)
  const illustrativeFilters = Boolean(traffic || device || os)
  const columns: DataTableColumn<TrafficSample>[] = [
    { key: 'country', header: 'Country', render: (row) => row.country },
    { key: 'impressions', header: 'Daily impressions', render: (row) => row.dailyImpressions },
    { key: 'cpm', header: 'Recommended CPM (₹)', render: (row) => row.recommendedCpm },
    {
      key: 'campaign',
      header: 'Action',
      render: (row) => (
        <Link
          href={`/campaigns/new?${new URLSearchParams({ country: row.country, adUnit }).toString()}`}
          className="font-semibold text-brand-700 hover:underline"
        >
          Create campaign
        </Link>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser' }, { label: 'Traffic Chart' }]}
        title="Traffic Chart"
        description="Mock sample view only. It does not represent live traffic or pricing."
        action={<Link href="/campaigns/new" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Create campaign</Link>}
      />

      <Card className="mt-6 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Select label="Ad unit" value={adUnit} onChange={(event) => setAdUnit(event.target.value)} options={[{ value: '', label: 'Any ad unit' }, ...advertiserAdUnits.map((value) => ({ value, label: value }))]} />
          <Select label="Traffic type" value={traffic} onChange={(event) => setTraffic(event.target.value)} options={[{ value: '', label: 'Any traffic type' }, ...advertiserTrafficTypes.map((value) => ({ value, label: value }))]} />
          <Select label="Device format" value={device} onChange={(event) => setDevice(event.target.value)} options={[{ value: '', label: 'Any device' }, ...advertiserDevices.map((value) => ({ value, label: value }))]} />
          <Select label="Country" value={country} onChange={(event) => setCountry(event.target.value)} options={[{ value: '', label: 'Any country' }, ...advertiserCountries.map((value) => ({ value, label: value }))]} />
          <Select label="OS" value={os} onChange={(event) => setOs(event.target.value)} options={[{ value: '', label: 'Any OS' }, ...['Android', 'iOS', 'Windows', 'macOS'].map((value) => ({ value, label: value }))]} />
        </div>
        <p className="mt-3 text-xs text-slate-500">Country narrows this mock sample. Traffic type, device, and OS are illustrative only because those dimensions are not included in the mock data. No live inventory lookup is performed.</p>
      </Card>

      <section aria-label="Mock traffic samples" className="mt-6">
        {visibleRows.length ? (
          <div className="space-y-5">
            <Card className="p-4 sm:p-5">
              <h2 className="mb-3 text-lg font-semibold text-navy-900">Daily impressions by country</h2>
              <TrafficBarChart rows={visibleRows} />
              <p className="mt-2 text-xs text-slate-500">Illustrative mock figures only; not a forecast or live delivery estimate.</p>
            </Card>
            {illustrativeFilters && <p className="text-sm text-slate-600">Selected illustrative filter values are not applied to the mock rows.</p>}
            <DataTable label="Mock traffic chart" columns={columns} rows={visibleRows} />
          </div>
        ) : (
          <EmptyState title="No mock samples for this country" description="Choose another country to view the sample rows." />
        )}
      </section>
    </div>
  )
}
