'use client'

import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Select } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs'
import { mockDailyEarnings, mockWebsiteEarnings, type EarningsRow } from '@/data/publisher'

type EarningsView = 'daily' | 'website'

export default function PublisherEarningsPage() {
  const [range, setRange] = useState('7-days')
  const [view, setView] = useState<EarningsView>('daily')
  const rows = view === 'daily' ? mockDailyEarnings : mockWebsiteEarnings

  const columns: DataTableColumn<EarningsRow>[] = [
    { key: 'date', header: view === 'daily' ? 'Date' : 'Website', render: (row) => row.date },
    { key: 'impressions', header: 'Impressions', render: (row) => row.impressions },
    { key: 'clicks', header: 'Clicks', render: (row) => row.clicks },
    { key: 'ctr', header: 'CTR', render: (row) => row.ctr },
    { key: 'earnings', header: 'Earnings', render: (row) => row.earnings },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Publisher workspace', href: '/publisher' }, { label: 'Earnings' }]}
        title="Earnings"
        description="Mock reporting; no actual earnings are shown."
      />
      <div className="mt-6 flex justify-end">
        <div className="w-full sm:w-56">
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
        </div>
      </div>

      <Tabs value={view} onValueChange={(value) => {
        if (value === 'daily' || value === 'website') setView(value)
      }} className="mt-6">
      <TabsList variant="line" aria-label="Earnings breakdown" className="border-b border-slate-200">
        {([
          { id: 'daily', label: 'Daily' },
          { id: 'website', label: 'By Website' },
        ] as const).map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-t-xl px-4 py-3 data-[state=active]:text-brand-700 after:bg-brand-600"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={view} id="earnings-panel" className="mt-5">
        <DataTable label={`${view === 'daily' ? 'Daily' : 'Website'} earnings`} columns={columns} rows={rows} />
        {rows.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title="No earnings for this period"
              description="Earnings will appear here when mock reporting data is available."
            />
          </div>
        )}
      </TabsContent>
      </Tabs>
    </div>
  )
}
