'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown, MoreHorizontal, Search, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/primitives/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/primitives/sheet'
import { Switch } from '@/components/primitives/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/Toast'
import { Select } from '@/components/ui/Select'
import {
  advertiserAdUnits,
  advertiserCountries,
  mockAdvertiserAdSets,
  mockAdvertiserAds,
  mockAdvertiserCampaigns,
  type CampaignManagerEntity,
  type CampaignManagerItem,
  type CampaignStatus,
} from '@/data/advertiser'

type ManagerTab = 'campaigns' | 'ad-sets' | 'ads'
type ColumnKey =
  | 'name'
  | 'id'
  | 'parent'
  | 'status'
  | 'delivery'
  | 'budget'
  | 'impressions'
  | 'clicks'
  | 'ctr'
  | 'conversions'
  | 'spend'
  | 'country'
  | 'adUnit'
type ParentFilter = { id: string; name: string; entity: 'campaign' | 'ad-set' }
type BulkAction = '' | 'turn-on' | 'turn-off' | 'duplicate' | 'delete'

const tabEntities: Record<ManagerTab, CampaignManagerEntity> = {
  campaigns: 'campaign',
  'ad-sets': 'ad-set',
  ads: 'ad',
}

const columns: { key: ColumnKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'id', label: 'ID' },
  { key: 'parent', label: 'Parent ID' },
  { key: 'status', label: 'Status' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'budget', label: 'Budget' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'ctr', label: 'CTR' },
  { key: 'conversions', label: 'Conversions' },
  { key: 'spend', label: 'Spend' },
  { key: 'country', label: 'Country' },
  { key: 'adUnit', label: 'Ad unit' },
]

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
})

function createInitialItems(): CampaignManagerItem[] {
  const campaigns: CampaignManagerItem[] = mockAdvertiserCampaigns.map((campaign) => ({
    id: campaign.id,
    entity: 'campaign',
    parentId: null,
    campaignId: campaign.id,
    name: campaign.name,
    enabled: campaign.status !== 'Paused' && campaign.status !== 'Draft',
    status: campaign.status,
    budget: campaign.totalBudget,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    ctr: campaign.ctr,
    conversions: campaign.conversions,
    spend: campaign.spent,
    country: campaign.country,
    adUnit: campaign.campaignType,
    createdDate: campaign.createdDate,
  }))

  return [...campaigns, ...mockAdvertiserAdSets, ...mockAdvertiserAds]
}

function currencyAmount(value: string) {
  const amount = Number(value.replace(/[^\d.-]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function deliveryFor(item: CampaignManagerItem, itemsById: Map<string, CampaignManagerItem>) {
  // This is a mock display rule only; real delivery and permissions must be enforced by the backend.
  let parent = item.parentId ? itemsById.get(item.parentId) : undefined
  while (parent) {
    if (!parent.enabled) {
      return parent.entity === 'campaign' ? 'Paused by campaign' : 'Paused by ad set'
    }
    parent = parent.parentId ? itemsById.get(parent.parentId) : undefined
  }
  if (!item.enabled) return 'Off'
  if (item.status === 'Pending') return 'In review'
  if (item.status === 'Draft') return 'Draft'
  return 'Active'
}

function statusFor(item: CampaignManagerItem): CampaignStatus {
  if (item.status === 'Pending' || item.status === 'Draft') return item.status
  return item.enabled ? 'Active' : 'Paused'
}

function statusTone(status: CampaignStatus) {
  if (status === 'Active') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Draft') return 'brand'
  return 'neutral'
}

function isWithinDateRange(date: string, range: string) {
  if (range === 'all') return true
  const created = new Date(`${date}T00:00:00`)
  if (Number.isNaN(created.getTime())) return true

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (range === 'month') {
    return created.getFullYear() === today.getFullYear() && created.getMonth() === today.getMonth()
  }

  const days = range === '7-days' ? 7 : 30
  const start = new Date(today)
  start.setDate(start.getDate() - days + 1)
  return created >= start
}

function getSortValue(
  item: CampaignManagerItem,
  key: ColumnKey,
  delivery: string,
): string | number {
  switch (key) {
    case 'name': return item.name
    case 'id': return item.id
    case 'parent': return item.parentId ?? ''
    case 'status': return statusFor(item)
    case 'delivery': return delivery
    case 'budget': return currencyAmount(item.budget)
    case 'impressions': return item.impressions
    case 'clicks': return item.clicks
    case 'ctr': return Number.parseFloat(item.ctr) || 0
    case 'conversions': return item.conversions
    case 'spend': return currencyAmount(item.spend)
    case 'country': return item.country
    case 'adUnit': return item.adUnit
  }
}

export default function CampaignsPage() {
  const toast = useToast()
  const [items, setItems] = useState(createInitialItems)
  const [tab, setTab] = useState<ManagerTab>('campaigns')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('all')
  const [country, setCountry] = useState('')
  const [adUnit, setAdUnit] = useState('')
  const [applied, setApplied] = useState({ dateRange: 'all', country: '', adUnit: '' })
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(columns.map((column) => column.key))
  const [sortKey, setSortKey] = useState<ColumnKey>('name')
  const [sortAscending, setSortAscending] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<BulkAction>('')
  const [parentFilter, setParentFilter] = useState<ParentFilter | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingItem, setEditingItem] = useState<CampaignManagerItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [editAdUnit, setEditAdUnit] = useState('')
  const [editNameTouched, setEditNameTouched] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])
  const filteredRows = useMemo(() => {
    const parent = parentFilter ? itemsById.get(parentFilter.id) : undefined
    const campaignId = parent?.entity === 'campaign' ? parent.id : parent?.campaignId

    return items
      .filter((item) => item.entity === tabEntities[tab])
      .filter((item) => {
        if (!parentFilter || !parent) return true
        if (tab === 'campaigns') return item.id === campaignId
        if (parent.entity === 'ad-set') {
          return tab === 'ad-sets' ? item.id === parent.id : item.parentId === parent.id
        }
        return item.campaignId === campaignId
      })
      .filter((item) => isWithinDateRange(item.createdDate, applied.dateRange))
      .filter((item) => !applied.country || item.country === applied.country)
      .filter((item) => !applied.adUnit || item.adUnit === applied.adUnit)
      .filter((item) => {
        const query = search.trim().toLocaleLowerCase()
        return !query || item.name.toLocaleLowerCase().includes(query) || item.id.toLocaleLowerCase().includes(query)
      })
      .sort((left, right) => {
        const leftValue = getSortValue(left, sortKey, deliveryFor(left, itemsById))
        const rightValue = getSortValue(right, sortKey, deliveryFor(right, itemsById))
        const comparison = typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue))
        return sortAscending ? comparison : -comparison
      })
  }, [applied, items, itemsById, parentFilter, search, sortAscending, sortKey, tab])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)
  const selectedOnPage = pageRows.length > 0 && pageRows.every((row) => selectedIds.includes(row.id))
  const activeColumns = columns.filter((column) => visibleColumns.includes(column.key))

  function applyFilters() {
    setApplied({ dateRange, country, adUnit })
    setPage(1)
    setSelectedIds([])
    toast({ title: 'Filters applied', description: 'The manager reflects your selected filters.', variant: 'success' })
  }

  function resetFilters() {
    setDateRange('all')
    setCountry('')
    setAdUnit('')
    setApplied({ dateRange: 'all', country: '', adUnit: '' })
    setPage(1)
    setSelectedIds([])
    toast({ title: 'Filters reset', description: 'The campaign manager is showing its default filter range.', variant: 'success' })
  }

  function updateItem(itemId: string, update: Partial<CampaignManagerItem>) {
    setItems((current) => current.map((item) => item.id === itemId ? { ...item, ...update } : item))
  }

  function toggleItem(item: CampaignManagerItem, enabled: boolean) {
    updateItem(item.id, { enabled })
    toast({
      title: `${item.entity === 'campaign' ? 'Campaign' : item.entity === 'ad-set' ? 'Ad set' : 'Ad'} ${enabled ? 'turned on' : 'turned off'}`,
      description: `${item.name} own delivery switch was updated.`,
      variant: 'success',
      action: {
        label: 'Undo',
        onClick: () => updateItem(item.id, { enabled: item.enabled }),
      },
    })
  }

  function drillInto(item: CampaignManagerItem) {
    if (item.entity === 'campaign') {
      setParentFilter({ id: item.id, name: item.name, entity: 'campaign' })
      setTab('ad-sets')
      setPage(1)
      setSelectedIds([])
    } else if (item.entity === 'ad-set') {
      setParentFilter({ id: item.id, name: item.name, entity: 'ad-set' })
      setTab('ads')
      setPage(1)
      setSelectedIds([])
    }
  }

  function handleSelectPage(checked: boolean) {
    const idsOnPage = pageRows.map((row) => row.id)
    setSelectedIds((current) => checked
      ? [...new Set([...current, ...idsOnPage])]
      : current.filter((id) => !idsOnPage.includes(id)),
    )
  }

  function duplicateItems(ids: string[]) {
    const copies = items.filter((item) => ids.includes(item.id)).map((item, index) => ({
      ...item,
      id: `${item.id}-COPY-${Date.now()}-${index}`,
      name: `${item.name} copy`,
      enabled: false,
      status: 'Draft' as const,
      impressions: 0,
      clicks: 0,
      ctr: '0.00%',
      conversions: 0,
      spend: '₹0.00',
    }))
    setItems((current) => [...current, ...copies])
    setSelectedIds([])
    setBulkAction('')
    toast({ title: 'Mock items duplicated', description: `${copies.length} draft copy${copies.length === 1 ? '' : 'ies'} added.`, variant: 'success' })
  }

  function applyBulkAction() {
    if (!bulkAction || selectedIds.length === 0) return
    if (bulkAction === 'delete') {
      setPendingDeleteIds(selectedIds)
      setDeleteDialogOpen(true)
      return
    }
    if (bulkAction === 'duplicate') {
      duplicateItems(selectedIds)
      return
    }

    const enabled = bulkAction === 'turn-on'
    setItems((current) => current.map((item) =>
      selectedIds.includes(item.id) ? { ...item, enabled } : item,
    ))
    toast({
      title: `Selected items turned ${enabled ? 'on' : 'off'}`,
      description: `Updated ${selectedIds.length} mock item${selectedIds.length === 1 ? '' : 's'}.`,
      variant: 'success',
    })
    setSelectedIds([])
    setBulkAction('')
  }

  function confirmDelete() {
    const idsToDelete = new Set(pendingDeleteIds)
    let addedDescendant = true
    while (addedDescendant) {
      addedDescendant = false
      for (const item of items) {
        if (item.parentId && idsToDelete.has(item.parentId) && !idsToDelete.has(item.id)) {
          idsToDelete.add(item.id)
          addedDescendant = true
        }
      }
    }
    const deletedItems = items.filter((item) => idsToDelete.has(item.id))
    setItems((current) => current.filter((item) => !idsToDelete.has(item.id)))
    if (parentFilter && idsToDelete.has(parentFilter.id)) setParentFilter(null)
    setSelectedIds([])
    setBulkAction('')
    setPendingDeleteIds([])
    setDeleteDialogOpen(false)
    setPage(1)
    toast({
      title: 'Mock items deleted',
      description: 'The selected items and their child rows were removed.',
      variant: 'success',
      action: {
        label: 'Undo',
        onClick: () => setItems((current) => {
          const currentIds = new Set(current.map((item) => item.id))
          return [...current, ...deletedItems.filter((item) => !currentIds.has(item.id))]
        }),
      },
    })
  }

  function openEditor(item: CampaignManagerItem) {
    setEditingItem(item)
    setEditName(item.name)
    setEditCountry(item.country)
    setEditAdUnit(item.adUnit)
    setEditNameTouched(false)
  }

  function saveEdit() {
    if (!editName.trim()) {
      setEditNameTouched(true)
      return
    }
    if (!editingItem) return
    updateItem(editingItem.id, {
      name: editName.trim(),
      country: editCountry,
      adUnit: editAdUnit,
    })
    setEditingItem(null)
    toast({ title: 'Mock item updated', description: 'Your changes are saved in this prototype session.', variant: 'success' })
  }

  function handleSort(key: ColumnKey) {
    if (sortKey === key) setSortAscending((current) => !current)
    else {
      setSortKey(key)
      setSortAscending(true)
    }
    setPage(1)
  }

  function renderCell(item: CampaignManagerItem, key: ColumnKey) {
    const delivery = deliveryFor(item, itemsById)
    switch (key) {
      case 'name':
        return item.entity === 'ad'
          ? <span className="font-medium text-navy-900">{item.name}</span>
          : (
            <button
              type="button"
              onClick={() => drillInto(item)}
              className="rounded-sm text-left font-semibold text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={`View ${item.entity === 'campaign' ? 'ad sets' : 'ads'} for ${item.name}`}
            >
              {item.name}
            </button>
          )
      case 'id': return <span className="font-mono text-xs">{item.id}</span>
      case 'parent': return item.parentId ?? '—'
      case 'status': {
        const status = statusFor(item)
        return <Badge tone={statusTone(status)}>{status}</Badge>
      }
      case 'delivery':
        return <span className={delivery === 'Active' ? 'font-medium text-success-600' : 'text-slate-600'}>{delivery}</span>
      case 'budget': return item.budget
      case 'impressions': return item.impressions.toLocaleString('en-IN')
      case 'clicks': return item.clicks.toLocaleString('en-IN')
      case 'ctr': return item.ctr
      case 'conversions': return item.conversions.toLocaleString('en-IN')
      case 'spend': return item.spend
      case 'country': return item.country
      case 'adUnit': return item.adUnit
    }
  }

  function renderTotal(key: ColumnKey) {
    const sum = (pick: (item: CampaignManagerItem) => number) => filteredRows.reduce((total, item) => total + pick(item), 0)
    switch (key) {
      case 'name': return ''
      case 'budget': return currency.format(sum((item) => currencyAmount(item.budget)))
      case 'impressions': return sum((item) => item.impressions).toLocaleString('en-IN')
      case 'clicks': return sum((item) => item.clicks).toLocaleString('en-IN')
      case 'ctr': {
        const impressions = sum((item) => item.impressions)
        return impressions ? `${((sum((item) => item.clicks) / impressions) * 100).toFixed(2)}%` : '0.00%'
      }
      case 'conversions': return sum((item) => item.conversions).toLocaleString('en-IN')
      case 'spend': return currency.format(sum((item) => currencyAmount(item.spend)))
      default: return ''
    }
  }

  function exportCsv() {
    const exportColumns = columns.filter((column) => visibleColumns.includes(column.key))
    const lines = [
      exportColumns.map((column) => column.label).join(','),
      ...filteredRows.map((item) => exportColumns.map((column) => {
        const value = column.key === 'status'
          ? statusFor(item)
          : column.key === 'delivery'
            ? deliveryFor(item, itemsById)
            : column.key === 'parent'
              ? item.parentId ?? ''
              : column.key === 'name'
                ? item.name
                : String(item[column.key])
        return `"${value.replaceAll('"', '""')}"`
      }).join(',')),
    ]
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `rivinityads-${tab}.csv`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    toast({ title: 'CSV exported', description: `The filtered ${tab} view was downloaded.`, variant: 'success' })
  }

  function changeTab(value: string) {
    if (value === 'campaigns' || value === 'ad-sets' || value === 'ads') {
      setTab(value)
      setPage(1)
      setSelectedIds([])
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser workspace', href: '/dashboard' }, { label: 'Campaign manager' }]}
        title="Campaign manager"
        description="Manage campaign delivery and review mock performance across campaigns, ad sets, and ads."
        action={<ButtonLink href="/campaigns/new">Create campaign</ButtonLink>}
      />

      <Card className="mt-6 space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="relative min-w-[min(100%,16rem)] flex-1">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Search</span>
            <Search className="absolute left-3 top-10 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search by name or ID"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            />
          </label>
          <div className="w-full sm:w-48">
            <Select
              label="Date range"
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              options={[
                { value: 'all', label: 'All dates' },
                { value: '7-days', label: 'Last 7 days' },
                { value: '30-days', label: 'Last 30 days' },
                { value: 'month', label: 'This month' },
              ]}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Columns
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={(checked) => setVisibleColumns((current) => (
                    checked ? [...current, column.key] : current.filter((key) => key !== column.key)
                  ))}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" variant="outline" onClick={() => setMoreFiltersOpen((open) => !open)} aria-expanded={moreFiltersOpen}>
            {moreFiltersOpen ? 'Hide filters' : 'More filters'}
          </Button>
          <div className="w-full sm:w-44">
            <Select
              label="Bulk action"
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value as BulkAction)}
              options={[
                { value: '', label: 'Bulk actions' },
                { value: 'turn-on', label: 'Turn on' },
                { value: 'turn-off', label: 'Turn off' },
                { value: 'duplicate', label: 'Duplicate' },
                { value: 'delete', label: 'Delete' },
              ]}
            />
          </div>
          <Button type="button" variant="outline" onClick={applyBulkAction} disabled={!bulkAction || selectedIds.length === 0}>
            Apply action
          </Button>
          <Button type="button" variant="outline" onClick={exportCsv}>Export CSV</Button>
        </div>

        {moreFiltersOpen && (
          <div className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
            <Select
              label="Country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              options={[{ value: '', label: 'All countries' }, ...advertiserCountries.map((value) => ({ value, label: value }))]}
            />
            <Select
              label="Ad unit"
              value={adUnit}
              onChange={(event) => setAdUnit(event.target.value)}
              options={[{ value: '', label: 'All ad units' }, ...advertiserAdUnits.map((value) => ({ value, label: value }))]}
            />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="button" onClick={applyFilters}>Apply filters</Button>
              <Button type="button" variant="outline" onClick={resetFilters}>Reset filters</Button>
            </div>
          </div>
        )}
      </Card>

      {parentFilter && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="brand">Filtered by parent: {parentFilter.name}</Badge>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1 text-xs"
            onClick={() => { setParentFilter(null); setPage(1) }}
            aria-label="Remove parent filter"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear parent filter
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={changeTab} className="mt-6">
        <TabsList aria-label="Campaign hierarchy" className="w-full justify-start overflow-x-auto rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="campaigns" className="rounded-t-xl px-4 py-3 data-[state=active]:text-brand-700">Campaigns</TabsTrigger>
          <TabsTrigger value="ad-sets" className="rounded-t-xl px-4 py-3 data-[state=active]:text-brand-700">Ad Sets</TabsTrigger>
          <TabsTrigger value="ads" className="rounded-t-xl px-4 py-3 data-[state=active]:text-brand-700">Ads</TabsTrigger>
        </TabsList>
        {(['campaigns', 'ad-sets', 'ads'] as ManagerTab[]).map((currentTab) => (
          <TabsContent key={currentTab} value={currentTab} className="mt-4">
            {tab === currentTab && filteredRows.length > 0 ? (
              <>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1500px] text-left text-sm" aria-label={`${currentTab} manager`}>
                      <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th scope="col" className="px-4 py-3">
                            <input
                              type="checkbox"
                              aria-label="Select all rows on this page"
                              checked={selectedOnPage}
                              onChange={(event) => handleSelectPage(event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                          </th>
                          <th scope="col" className="whitespace-nowrap px-4 py-3">On / Off</th>
                          {activeColumns.map((column) => (
                            <th
                              key={column.key}
                              scope="col"
                              aria-sort={sortKey === column.key ? (sortAscending ? 'ascending' : 'descending') : 'none'}
                              className="whitespace-nowrap px-4 py-3"
                            >
                              <button type="button" onClick={() => handleSort(column.key)} className="inline-flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                                {column.label}
                                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </th>
                          ))}
                          <th scope="col" className="px-4 py-3"><span className="sr-only">Row actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {pageRows.map((item) => {
                          const delivery = deliveryFor(item, itemsById)
                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${item.entity} ${item.name}`}
                                  checked={selectedIds.includes(item.id)}
                                  onChange={(event) => setSelectedIds((current) => event.target.checked
                                    ? [...current, item.id]
                                    : current.filter((id) => id !== item.id),
                                  )}
                                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Switch
                                  checked={item.enabled}
                                  onCheckedChange={(checked) => toggleItem(item, checked)}
                                  aria-label={`Turn ${item.enabled ? 'off' : 'on'} ${item.entity} ${item.name}`}
                                />
                              </td>
                              {activeColumns.map((column) => (
                                <td key={column.key} className="whitespace-nowrap px-4 py-3">
                                  {column.key === 'delivery' && delivery === 'Paused by campaign'
                                    ? <span aria-label="Paused by campaign">{renderCell(item, column.key)}</span>
                                    : renderCell(item, column.key)}
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                                    aria-label={`Actions for ${item.name}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => openEditor(item)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => duplicateItems([item.id])}>Duplicate</DropdownMenuItem>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onSelect={() => { setPendingDeleteIds([item.id]); setDeleteDialogOpen(true) }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold text-navy-900">
                        <tr>
                          <td colSpan={2} className="px-4 py-3">Totals ({filteredRows.length})</td>
                          {activeColumns.map((column) => (
                            <td key={column.key} className="whitespace-nowrap px-4 py-3">{renderTotal(column.key)}</td>
                          ))}
                          <td className="px-4 py-3" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                  <p aria-live="polite">
                    Showing {filteredRows.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} mock {currentTab}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      label="Rows per page"
                      value={String(pageSize)}
                      onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}
                      options={[{ value: '5', label: '5 rows' }, { value: '10', label: '10 rows' }, { value: '20', label: '20 rows' }]}
                    />
                    <Button type="button" variant="outline" className="px-3 py-2" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>Previous</Button>
                    <span>Page {page} of {pageCount}</span>
                    <Button type="button" variant="outline" className="px-3 py-2" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount}>Next</Button>
                  </div>
                </div>
              </>
            ) : tab === currentTab ? (
              <EmptyState
                title="No matching items"
                description="Adjust the search or filters, or create a campaign to see it in this manager."
              />
            ) : null}
          </TabsContent>
        ))}
      </Tabs>

      <Sheet open={Boolean(editingItem)} onOpenChange={(open) => { if (!open) setEditingItem(null) }}>
        <SheetContent side="right" className="w-full gap-0 border-l border-slate-200 bg-white p-0 sm:max-w-md">
          <div className="border-b border-slate-200 p-6">
            <SheetTitle className="text-lg text-navy-900">Edit {editingItem?.entity ?? 'item'}</SheetTitle>
            <SheetDescription className="mt-2">Changes apply to this mock manager view only.</SheetDescription>
          </div>
          {editingItem && (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Name
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  onBlur={() => setEditNameTouched(true)}
                  aria-invalid={editNameTouched && !editName.trim()}
                  aria-describedby={editNameTouched && !editName.trim() ? 'edit-name-error' : undefined}
                  className="h-11 rounded-xl border border-slate-300 px-3 text-sm text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                />
                {editNameTouched && !editName.trim() && <span id="edit-name-error" role="alert" className="text-xs text-danger-600">Enter a name.</span>}
              </label>
              <Select
                label="Country"
                value={editCountry}
                onChange={(event) => setEditCountry(event.target.value)}
                options={advertiserCountries.map((value) => ({ value, label: value }))}
              />
              <Select
                label="Ad unit"
                value={editAdUnit}
                onChange={(event) => setEditAdUnit(event.target.value)}
                options={advertiserAdUnits.map((value) => ({ value, label: value }))}
              />
              <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <Button type="button" onClick={saveEdit}>Save changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete selected items?</DialogTitle>
            <DialogDescription>
              This removes {pendingDeleteIds.length} selected mock item{pendingDeleteIds.length === 1 ? '' : 's'} and any child rows from this view. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button type="button" className="bg-danger-600 hover:bg-danger-700" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
