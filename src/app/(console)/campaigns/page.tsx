'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/Toast'
import { Select } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs'
import {
  advertiserAdUnits,
  advertiserCountries,
  mockAdvertiserCampaigns,
  type AdvertiserCampaign,
  type CampaignStatus,
} from '@/data/advertiser'

type ViewTab = 'campaigns' | 'statistics'

export default function CampaignsPage() {
  const toast = useToast()
  const [tab, setTab] = useState<ViewTab>('campaigns')
  const [campaigns, setCampaigns] = useState(mockAdvertiserCampaigns)
  const [dateRange, setDateRange] = useState('30-days')
  const [country, setCountry] = useState('')
  const [adUnit, setAdUnit] = useState('')
  const [status, setStatus] = useState('')
  const [applied, setApplied] = useState({ country: '', adUnit: '', status: '' })
  const [groupBy, setGroupBy] = useState('campaign')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(
    () => campaigns.filter((campaign) =>
      (!applied.country || campaign.country === applied.country)
      && (!applied.adUnit || campaign.campaignType === applied.adUnit)
      && (!applied.status || campaign.status === applied.status),
    ),
    [applied, campaigns],
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const shownRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const campaignColumns: DataTableColumn<AdvertiserCampaign>[] = [
    { key: 'name', header: 'Name', render: (row) => <Link className="font-semibold text-brand-700 hover:underline" href={`/campaigns/${row.id}`}>{row.name}</Link> },
    { key: 'id', header: 'ID', render: (row) => row.id },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'neutral'}>{row.status}</Badge> },
    { key: 'type', header: 'Campaign type', render: (row) => row.campaignType },
    { key: 'budget', header: 'Total budget', render: (row) => row.totalBudget },
    { key: 'left', header: 'Budget left', render: (row) => row.budgetLeft },
    { key: 'created', header: 'Created date', render: (row) => row.createdDate },
    { key: 'updated', header: 'Updated date', render: (row) => row.updatedDate },
  ]

  const statisticsColumns: DataTableColumn<AdvertiserCampaign>[] = [
    { key: 'name', header: 'Campaign', render: (row) => row.name },
    { key: 'id', header: 'ID', render: (row) => row.id },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'neutral'}>{row.status}</Badge> },
    { key: 'impressions', header: 'Impressions', render: (row) => row.impressions.toLocaleString() },
    { key: 'clicks', header: 'Clicks', render: (row) => row.clicks.toLocaleString() },
    { key: 'ctr', header: 'CTR', render: (row) => row.ctr },
    { key: 'conversions', header: 'Conversions', render: (row) => row.conversions },
    { key: 'ecpa', header: 'eCPA', render: (row) => row.ecpa },
    { key: 'cpm', header: 'CPM', render: (row) => row.cpm },
    { key: 'spent', header: 'Spent', render: (row) => row.spent },
    { key: 'total', header: 'Total budget', render: (row) => row.totalBudget },
    { key: 'daily', header: 'Daily budget', render: (row) => row.dailyBudget },
  ]

  function applyFilters() {
    setApplied({ country, adUnit, status })
    setPage(1)
    setSelectedIds([])
    toast({ title: 'Filters applied', description: 'Campaign data reflects your selected filters.', variant: 'success' })
  }

  function resetFilters() {
    setCountry('')
    setAdUnit('')
    setStatus('')
    setDateRange('30-days')
    setApplied({ country: '', adUnit: '', status: '' })
    setPage(1)
    setSelectedIds([])
  }

  function downloadCsv() {
    const columns = tab === 'campaigns'
      ? ['Name', 'ID', 'Status', 'Campaign type', 'Total budget', 'Budget left', 'Created date', 'Updated date']
      : ['Campaign', 'ID', 'Status', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'eCPA', 'CPM', 'Spent', 'Total budget', 'Daily budget']
    const lines = [
      columns.join(','),
      ...shownRows.map((row) => (tab === 'campaigns'
        ? [row.name, row.id, row.status, row.campaignType, row.totalBudget, row.budgetLeft, row.createdDate, row.updatedDate]
        : [row.name, row.id, row.status, String(row.impressions), String(row.clicks), row.ctr, String(row.conversions), row.ecpa, row.cpm, row.spent, row.totalBudget, row.dailyBudget]
      ).map((value) => `"${value.replaceAll('"', '""')}"`).join(',')),
    ]
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `rivinityads-${tab}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast({ title: 'CSV exported', description: 'The current campaign view was downloaded.', variant: 'success' })
  }

  function applyBulkAction() {
    if (bulkAction && selectedIds.length > 0) {
      const nextStatus: CampaignStatus = bulkAction === 'pause' ? 'Paused' : 'Active'
      setCampaigns((current) => current.map((campaign) =>
        selectedIds.includes(campaign.id) ? { ...campaign, status: nextStatus } : campaign,
      ))
      setSelectedIds([])
      setBulkAction('')
      toast({ title: 'Campaigns updated', description: `${selectedIds.length} mock campaign${selectedIds.length === 1 ? '' : 's'} updated.`, variant: 'success' })
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser workspace', href: '/dashboard' }, { label: 'Campaigns' }]}
        title="Campaigns & Statistics"
        description="The displayed sample records are mock data."
        action={<ButtonLink href="/campaigns/new">Create Campaign</ButtonLink>}
      />

      <Card className="mt-6 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Select label="Date range" value={dateRange} onChange={(event) => setDateRange(event.target.value)} options={[
            { value: '7-days', label: 'Last 7 days' }, { value: '30-days', label: 'Last 30 days' }, { value: 'this-month', label: 'This month' },
          ]} />
          <Select label="Country" value={country} onChange={(event) => setCountry(event.target.value)} options={[
            { value: '', label: 'All countries' }, ...advertiserCountries.map((value) => ({ value, label: value })),
          ]} />
          <Select label="Ad unit" value={adUnit} onChange={(event) => setAdUnit(event.target.value)} options={[
            { value: '', label: 'All ad units' }, ...advertiserAdUnits.map((value) => ({ value, label: value })),
          ]} />
          <Select label="Campaign status" value={status} onChange={(event) => setStatus(event.target.value)} options={[
            { value: '', label: 'All statuses' }, ...(['Active', 'Pending', 'Paused', 'Draft'] as CampaignStatus[]).map((value) => ({ value, label: value })),
          ]} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" onClick={applyFilters}>Apply</Button>
          <Button type="button" variant="outline" onClick={resetFilters}>Reset</Button>
          <div className="ml-auto w-full sm:w-52">
            <Select label="Group by" value={groupBy} onChange={(event) => setGroupBy(event.target.value)} options={[
              { value: 'campaign', label: 'Campaign' }, { value: 'country', label: 'Country' }, { value: 'ad-unit', label: 'Ad unit' },
            ]} />
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={(value) => {
        if (value === 'campaigns' || value === 'statistics') setTab(value)
      }} className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <TabsList variant="line" aria-label="Campaign data" className="min-w-0 flex-1 overflow-x-auto">
          {(['campaigns', 'statistics'] as ViewTab[]).map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-t-xl px-4 py-3 capitalize data-[state=active]:text-brand-700 after:bg-brand-600"
            >
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <Select
            id="campaign-bulk-action"
            label="Bulk action"
            className="h-10 min-w-40"
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value)}
            options={[
              { value: '', label: 'Bulk actions' },
              { value: 'pause', label: 'Pause selected' },
              { value: 'activate', label: 'Activate selected' },
            ]}
          />
          <Button type="button" variant="outline" onClick={applyBulkAction} disabled={!bulkAction || selectedIds.length === 0}>
            Apply action
          </Button>
          <Button type="button" variant="outline" onClick={downloadCsv}>Download CSV</Button>
        </div>
      </div>

      <TabsContent value={tab} id="campaign-data-panel" className="mt-4">
        {shownRows.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm" aria-label={tab === 'campaigns' ? 'Campaigns' : 'Campaign statistics'}>
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all shown campaigns"
                        checked={shownRows.length > 0 && shownRows.every((row) => selectedIds.includes(row.id))}
                        onChange={(event) => setSelectedIds(event.target.checked ? shownRows.map((row) => row.id) : [])}
                      />
                    </th>
                    {(tab === 'campaigns' ? campaignColumns : statisticsColumns).map((column) => (
                      <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-3">{column.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {shownRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select campaign ${row.name}`}
                          checked={selectedIds.includes(row.id)}
                          onChange={(event) => setSelectedIds((current) =>
                            event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id),
                          )}
                        />
                      </td>
                      {(tab === 'campaigns' ? campaignColumns : statisticsColumns).map((column) => (
                        <td key={column.key} className="whitespace-nowrap px-4 py-3">{column.render(row)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState title="No data. Check your filters or create a new campaign." description="Try adjusting the selected filters or create a campaign to get started." />
        )}
      </TabsContent>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p>Showing {shownRows.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} mock campaigns · Grouped by {groupBy}</p>
        <div className="flex items-center gap-2">
          <Select label="Rows per page" value={String(pageSize)} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} options={[
            { value: '5', label: '5 rows' }, { value: '10', label: '10 rows' }, { value: '20', label: '20 rows' },
          ]} />
          <Button type="button" variant="outline" className="px-3 py-2" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>Previous</Button>
          <span aria-live="polite">Page {page} of {pageCount}</span>
          <Button type="button" variant="outline" className="px-3 py-2" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount}>Next</Button>
        </div>
      </div>
      </Tabs>
    </div>
  )
}
