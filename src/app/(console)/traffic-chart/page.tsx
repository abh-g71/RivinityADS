'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Select } from '@/components/ui/Select'
import { advertiserAdUnits, advertiserCountries, advertiserDevices, advertiserTrafficTypes, mockAdvertiserTraffic, type TrafficSample } from '@/data/advertiser'

export default function TrafficChartPage() {
  const [adUnit, setAdUnit] = useState('')
  const [traffic, setTraffic] = useState('')
  const [device, setDevice] = useState('')
  const [country, setCountry] = useState('')
  const [os, setOs] = useState('')

  const visibleRows = mockAdvertiserTraffic.filter((row) => !country || row.country === country)
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
      <header>
        <p className="text-sm font-medium text-brand-700">Advertiser workspace</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900">Traffic Chart</h1>
        <p className="mt-2 text-sm text-slate-600">Mock sample view only. It does not represent live traffic or pricing.</p>
      </header>

      <Card className="mt-6 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Select label="Ad unit" value={adUnit} onChange={(event) => setAdUnit(event.target.value)} options={[{ value: '', label: 'Any ad unit' }, ...advertiserAdUnits.map((value) => ({ value, label: value }))]} />
          <Select label="Traffic type" value={traffic} onChange={(event) => setTraffic(event.target.value)} options={[{ value: '', label: 'Any traffic type' }, ...advertiserTrafficTypes.map((value) => ({ value, label: value }))]} />
          <Select label="Device format" value={device} onChange={(event) => setDevice(event.target.value)} options={[{ value: '', label: 'Any device' }, ...advertiserDevices.map((value) => ({ value, label: value }))]} />
          <Select label="Country" value={country} onChange={(event) => setCountry(event.target.value)} options={[{ value: '', label: 'Any country' }, ...advertiserCountries.map((value) => ({ value, label: value }))]} />
          <Select label="OS" value={os} onChange={(event) => setOs(event.target.value)} options={[{ value: '', label: 'Any OS' }, ...['Android', 'iOS', 'Windows', 'macOS'].map((value) => ({ value, label: value }))]} />
        </div>
        <p className="mt-3 text-xs text-slate-500">Filters are illustrative. No live inventory lookup is performed.</p>
      </Card>

      <section aria-label="Mock traffic samples" className="mt-6">
        {visibleRows.length ? (
          <DataTable label="Mock traffic chart" columns={columns} rows={visibleRows} />
        ) : (
          <EmptyState title="No mock samples for this country" description="Choose another country to view the sample rows." />
        )}
      </section>
    </div>
  )
}
