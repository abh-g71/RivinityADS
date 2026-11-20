'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
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
import { Button } from '@/components/ui/Button'
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

// Only the essentials show by default so the table fits on one screen.
const defaultColumns: ColumnKey[] = ['name', 'status', 'budget', 'impressions', 'ctr', 'spend']

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
    dailyBudget: campaign.dailyBudget,
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
  return 'neutral'
}

type ManagerView = 'table' | 'board'
type LifecycleColumn = { status: CampaignStatus; title: string; dotClass: string }

const lifecycleColumns: LifecycleColumn[] = [
  { status: 'Draft', title: 'Draft', dotClass: 'bg-zinc-400' },
  { status: 'Pending', title: 'In Review', dotClass: 'bg-amber-500' },
  { status: 'Active', title: 'Active', dotClass: 'bg-emerald-500' },
  { status: 'Paused', title: 'Paused', dotClass: 'bg-zinc-400' },
]

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
    case 'budget': return currencyAmount(item.dailyBudget ?? item.budget)
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
  const [managerView, setManagerView] = useState<ManagerView>('table')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('all')
  const [country, setCountry] = useState('')
  const [adUnit, setAdUnit] = useState('')
  const [applied, setApplied] = useState({ dateRange: 'all', country: '', adUnit: '' })
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(defaultColumns)
  const [sortKey, setSortKey] = useState<ColumnKey>('name')
  const [sortAscending, setSortAscending] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<BulkAction>('')
  const [parentFilter, setParentFilter] = useState<ParentFilter | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingItem, setEditingItem] = useState<CampaignManagerItem | null>(null)
  const [inspectorId, setInspectorId] = useState<string | null>(null)
  const [inspectorBudget, setInspectorBudget] = useState('')
  const [inspectorStatus, setInspectorStatus] = useState<CampaignStatus>('Active')
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
  const inspectorItem = inspectorId ? itemsById.get(inspectorId) : undefined

  function openInspector(item: CampaignManagerItem) {
    if (item.entity !== 'campaign') return
    setInspectorId(item.id)
    setInspectorBudget(String(currencyAmount(item.dailyBudget ?? item.budget)))
    setInspectorStatus(statusFor(item))
  }

  function updateCampaignStatus(item: CampaignManagerItem, status: CampaignStatus) {
    updateItem(item.id, { status, enabled: status === 'Active' })
  }

  function applyInspectorChanges() {
    if (!inspectorItem) return
    const dailyBudget = Number(inspectorBudget)
    if (!Number.isFinite(dailyBudget) || dailyBudget < 0) return
    updateItem(inspectorItem.id, {
      dailyBudget: currency.format(dailyBudget),
      status: inspectorStatus,
      enabled: inspectorStatus === 'Active',
    })
    toast({ title: 'Campaign updated', description: 'Budget and status were updated in this manager view.', variant: 'success' })
  }

  function formatFor(item: CampaignManagerItem) {
    if (/video/i.test(item.adUnit)) return 'Video'
    if (/native/i.test(item.adUnit)) return 'Native'
    return 'Display'
  }

  function reachFor(item: CampaignManagerItem) {
    return Math.max(item.impressions * 3, 18000).toLocaleString('en-IN')
  }

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
        return (
          <div className="min-w-0">
            {item.entity === 'campaign' ? (
              <button type="button" onClick={() => openInspector(item)} className="rounded-sm text-left font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {item.name}
              </button>
            ) : item.entity === 'ad-set' ? (
              <button
                type="button"
                onClick={() => drillInto(item)}
                className="rounded-sm text-left font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`View ads for ${item.name}`}
              >
                {item.name}
              </button>
            ) : (
              <span className="font-medium text-foreground">{item.name}</span>
            )}
            <p className="mt-0.5 font-mono text-sm text-muted-foreground">{item.id}</p>
          </div>
        )
      case 'id': return <span className="font-mono text-sm">{item.id}</span>
      case 'parent': return item.parentId ?? '—'
      case 'status': {
        const status = statusFor(item)
        return <Badge tone={statusTone(status)}>{status === 'Pending' ? 'In Review' : status}</Badge>
      }
      case 'delivery':
        return <span className={delivery === 'Active' ? 'font-medium text-success-600' : 'text-muted-foreground'}>{delivery}</span>
      case 'budget': return item.entity === 'campaign' && item.dailyBudget ? item.dailyBudget : item.budget
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
      case 'budget': return currency.format(sum((item) => currencyAmount(item.dailyBudget ?? item.budget)))
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
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser workspace', href: '/dashboard' }, { label: 'Campaign manager' }]}
        title="Campaign manager"
        description="Manage campaign delivery and review mock performance across campaigns, ad sets, and ads."
      />

      <Card className="mt-3 shrink-0 space-y-3 border-black/10 p-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="relative min-w-[min(100%,16rem)] flex-1">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Search</span>
            <Search className="absolute left-3 top-10 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search by name or ID"
              className="h-11 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <DropdownMenuTrigger className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
          <Button type="button" variant="outline" onClick={exportCsv}>Export CSV</Button>
          {tab === 'campaigns' && <div role="group" aria-label="Campaign view" className="inline-flex h-11 items-center rounded-lg border border-black/10 bg-white p-1">
            {(['table', 'board'] as ManagerView[]).map((view) => (
              <button key={view} type="button" aria-pressed={managerView === view} onClick={() => setManagerView(view)} className={`h-9 rounded-md px-3 text-sm font-medium capitalize transition-colors ${managerView === view ? 'bg-[#09090B] text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}>
                {view === 'table' ? 'Table' : 'Board'}
              </button>
            ))}
          </div>}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
            <p className="pb-3 text-sm font-medium text-foreground">{selectedIds.length} selected</p>
            <div className="w-full sm:w-44">
              <Select
                label="Bulk action"
                value={bulkAction}
                onChange={(event) => setBulkAction(event.target.value as BulkAction)}
                options={[
                  { value: '', label: 'Choose action' },
                  { value: 'turn-on', label: 'Turn on' },
                  { value: 'turn-off', label: 'Turn off' },
                  { value: 'duplicate', label: 'Duplicate' },
                  { value: 'delete', label: 'Delete' },
                ]}
              />
            </div>
            <Button type="button" onClick={applyBulkAction} disabled={!bulkAction}>Apply action</Button>
            <Button type="button" variant="ghost" onClick={() => { setSelectedIds([]); setBulkAction('') }}>Clear selection</Button>
          </div>
        )}

        {moreFiltersOpen && (
          <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
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
            className="px-2 py-1 text-sm"
            onClick={() => { setParentFilter(null); setPage(1) }}
            aria-label="Remove parent filter"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear parent filter
          </Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={changeTab} className="mt-3 flex min-h-0 flex-1 flex-col">
        <TabsList aria-label="Campaign hierarchy" className="w-full shrink-0 justify-start overflow-x-auto rounded-none border-b border-black/10 bg-white/70 p-0">
          <TabsTrigger value="campaigns" className="rounded-t-md px-4 py-3 text-zinc-700 data-[state=active]:bg-[#09090B] data-[state=active]:text-white">Campaigns</TabsTrigger>
          <TabsTrigger value="ad-sets" className="rounded-t-md px-4 py-3 text-zinc-700 data-[state=active]:bg-[#09090B] data-[state=active]:text-white">Ad Sets</TabsTrigger>
          <TabsTrigger value="ads" className="rounded-t-md px-4 py-3 text-zinc-700 data-[state=active]:bg-[#09090B] data-[state=active]:text-white">Ads</TabsTrigger>
        </TabsList>
        {(['campaigns', 'ad-sets', 'ads'] as ManagerTab[]).map((currentTab) => (
          <TabsContent key={currentTab} value={currentTab} className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
            {tab === currentTab && filteredRows.length > 0 && currentTab === 'campaigns' && managerView === 'board' ? (
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 md:grid-rows-2 xl:grid-cols-4 xl:grid-rows-1">
                {lifecycleColumns.map((column) => {
                  const columnItems = filteredRows.filter((item) => statusFor(item) === column.status)
                  return (
                    <section key={column.status} aria-label={`${column.title} campaigns`} className="flex min-h-0 min-w-0 flex-col">
                      <header className="flex h-11 shrink-0 items-center justify-between rounded-t-xl border border-black/10 bg-white px-4">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-950"><span className={`size-2 rounded-full ${column.dotClass}`} />{column.title}</h2>
                        <span className="rounded-full border border-black/10 px-2 py-0.5 font-mono text-sm tabular-nums text-zinc-700">{columnItems.length}</span>
                      </header>
                      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-b-xl border-x border-b border-black/10 bg-white/50 p-3">
                        {columnItems.map((item) => (
                          <article key={item.id} onClick={() => openInspector(item)} className="cursor-pointer rounded-xl border border-black/10 bg-white p-4 transition-colors hover:border-black/30">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-zinc-950"><button type="button" onClick={(event) => { event.stopPropagation(); openInspector(item) }} className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950">{item.name}</button></h3><p className="mt-1 font-mono text-sm tabular-nums text-zinc-600">{item.id}</p></div>
                              <Badge tone={statusTone(statusFor(item))}>{column.title}</Badge>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2"><span className="rounded-full border border-black/10 px-2 py-1 text-sm text-zinc-700">{formatFor(item)}</span><span className="font-mono text-sm tabular-nums text-zinc-700">{currency.format(currencyAmount(item.dailyBudget ?? item.budget))}/day</span></div>
                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/10 pt-3"><span className="text-sm text-zinc-600">Spend</span><span className="font-mono text-sm tabular-nums text-zinc-950">{item.spend}</span></div>
                            <div className="mt-3 flex items-center justify-between gap-2" onClick={(event) => event.stopPropagation()}>
                              <select aria-label={`Move ${item.name} to status`} value={statusFor(item)} onChange={(event) => updateCampaignStatus(item, event.target.value as CampaignStatus)} className="h-10 min-w-0 flex-1 rounded-md border border-black/10 bg-white px-2 text-sm text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950">
                                <option value="Draft">Draft</option><option value="Pending">In Review</option><option value="Active">Active</option><option value="Paused">Paused</option>
                              </select>
                              <Switch checked={item.enabled} disabled={statusFor(item) === 'Draft' || statusFor(item) === 'Pending'} onCheckedChange={(checked) => toggleItem(item, checked)} aria-label={`Turn ${item.enabled ? 'off' : 'on'} ${item.name}`} />
                            </div>
                          </article>
                        ))}
                        {columnItems.length === 0 && <p className="p-3 text-sm text-zinc-600">No campaigns</p>}
                      </div>
                    </section>
                  )
                })}
              </div>
            ) : tab === currentTab && filteredRows.length > 0 ? (
              <>
                <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <div className="min-h-0 flex-1 overflow-auto">
                    <table className="w-full min-w-[760px] text-left text-sm" aria-label={`${currentTab} manager`}>
                      <thead className="sticky top-0 z-10 border-b border-border bg-secondary text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th scope="col" className="w-10 px-3 py-3">
                            <input
                              type="checkbox"
                              aria-label="Select all rows on this page"
                              checked={selectedOnPage}
                              onChange={(event) => handleSelectPage(event.target.checked)}
                              className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
                            />
                          </th>
                          <th scope="col" className="whitespace-nowrap px-3 py-3">On / Off</th>
                          {activeColumns.map((column) => (
                            <th
                              key={column.key}
                              scope="col"
                              aria-sort={sortKey === column.key ? (sortAscending ? 'ascending' : 'descending') : 'none'}
                              className="whitespace-nowrap px-3 py-3"
                            >
                              <button type="button" onClick={() => handleSort(column.key)} className="inline-flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                {column.label}
                                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </th>
                          ))}
                          <th scope="col" className="w-12 px-3 py-3"><span className="sr-only">Row actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-foreground">
                        {pageRows.map((item) => {
                          const delivery = deliveryFor(item, itemsById)
                          return (
                            <tr key={item.id} onClick={() => openInspector(item)} onKeyDown={(event) => { if (event.key === 'Enter') openInspector(item) }} tabIndex={item.entity === 'campaign' ? 0 : undefined} className={`${item.entity === 'campaign' ? 'cursor-pointer' : ''} hover:bg-muted focus-visible:outline-none focus-visible:bg-zinc-50`}>
                              <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${item.entity} ${item.name}`}
                                  checked={selectedIds.includes(item.id)}
                                  onChange={(event) => setSelectedIds((current) => event.target.checked
                                    ? [...current, item.id]
                                    : current.filter((id) => id !== item.id),
                                  )}
                                  className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
                                />
                              </td>
                              <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                                <Switch
                                  checked={item.enabled}
                                  onCheckedChange={(checked) => toggleItem(item, checked)}
                                  aria-label={`Turn ${item.enabled ? 'off' : 'on'} ${item.entity} ${item.name}`}
                                />
                              </td>
                              {activeColumns.map((column) => (
                                <td key={column.key} className={`px-3 py-3 ${column.key === 'name' ? '' : 'whitespace-nowrap'}`}>
                                  {column.key === 'delivery' && delivery === 'Paused by campaign'
                                    ? <span aria-label="Paused by campaign">{renderCell(item, column.key)}</span>
                                    : renderCell(item, column.key)}
                                </td>
                              ))}
                              <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label={`Actions for ${item.name}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {item.entity === 'campaign' && (
                                      <DropdownMenuItem asChild>
                                        <Link href={`/campaigns/${item.id}`}>View details</Link>
                                      </DropdownMenuItem>
                                    )}
                                    {item.entity === 'campaign' && (
                                      <DropdownMenuItem onSelect={() => drillInto(item)}>View ad sets</DropdownMenuItem>
                                    )}
                                    {item.entity === 'ad-set' && (
                                      <DropdownMenuItem onSelect={() => drillInto(item)}>View ads</DropdownMenuItem>
                                    )}
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
                      <tfoot className="border-t border-border bg-secondary font-semibold text-foreground">
                        <tr>
                          <td colSpan={2} className="px-3 py-3">Totals ({filteredRows.length})</td>
                          {activeColumns.map((column) => (
                            <td key={column.key} className="whitespace-nowrap px-3 py-3">{renderTotal(column.key)}</td>
                          ))}
                          <td className="px-3 py-3" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>
                <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
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

      <Sheet open={Boolean(inspectorItem)} onOpenChange={(open) => { if (!open) setInspectorId(null) }}>
        <SheetContent side="right" className="w-full gap-0 border-l border-black/10 bg-white p-0 shadow-2xl sm:max-w-md">
          {inspectorItem && <>
            <div className="border-b border-black/10 p-5 pr-14">
              <div className="flex flex-wrap items-center gap-2"><Badge tone={statusTone(statusFor(inspectorItem))}>{statusFor(inspectorItem) === 'Pending' ? 'In Review' : statusFor(inspectorItem)}</Badge><span className="font-mono text-sm tabular-nums text-zinc-600">{inspectorItem.id}</span></div>
              <SheetTitle className="mt-3 block text-xl text-zinc-950">{inspectorItem.name}</SheetTitle>
              <SheetDescription className="mt-1">Campaign inspector · mock account data</SheetDescription>
            </div>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
              <section aria-labelledby="inspector-targeting-title">
                <h2 id="inspector-targeting-title" className="text-sm font-semibold text-zinc-950">Targeting summary</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-black/10 p-3"><dt className="text-sm text-zinc-600">Location</dt><dd className="mt-1 text-sm font-medium text-zinc-950">{inspectorItem.country} · 25 km radius</dd></div>
                  <div className="rounded-lg border border-black/10 p-3"><dt className="text-sm text-zinc-600">Format</dt><dd className="mt-1 text-sm font-medium text-zinc-950">{formatFor(inspectorItem)}</dd></div>
                  <div className="col-span-2 rounded-lg border border-black/10 p-3"><dt className="text-sm text-zinc-600">Estimated reach</dt><dd className="mt-1 font-mono text-sm font-medium tabular-nums text-zinc-950">{reachFor(inspectorItem)} people</dd></div>
                </dl>
              </section>

              <section aria-labelledby="inspector-financials-title">
                <h2 id="inspector-financials-title" className="text-sm font-semibold text-zinc-950">Financials</h2>
                <dl className="mt-3 divide-y divide-black/10 rounded-lg border border-black/10 px-3">
                  <div className="flex items-center justify-between gap-3 py-3"><dt className="text-sm text-zinc-600">Daily budget</dt><dd className="font-mono text-sm tabular-nums text-zinc-950">{currency.format(currencyAmount(inspectorItem.dailyBudget ?? inspectorItem.budget))}</dd></div>
                  <div className="flex items-center justify-between gap-3 py-3"><dt className="text-sm text-zinc-600">Spend to date</dt><dd className="font-mono text-sm tabular-nums text-zinc-950">{currency.format(currencyAmount(inspectorItem.spend))}</dd></div>
                  <div className="flex items-center justify-between gap-3 py-3"><dt className="text-sm text-zinc-600">Platform fee</dt><dd className="font-mono text-sm tabular-nums text-zinc-950">{currency.format(0)}</dd></div>
                </dl>
              </section>

              <section aria-labelledby="inspector-edit-title">
                <h2 id="inspector-edit-title" className="text-sm font-semibold text-zinc-950">Quick edit</h2>
                <div className="mt-3 space-y-3">
                  <label htmlFor="inspector-daily-budget" className="block text-sm font-medium text-zinc-800">Daily budget (₹)
                    <input id="inspector-daily-budget" type="number" min="0" step="0.01" value={inspectorBudget} onChange={(event) => setInspectorBudget(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-black/10 bg-white px-3 font-mono text-sm tabular-nums text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950" />
                  </label>
                  <label htmlFor="inspector-status" className="block text-sm font-medium text-zinc-800">Status
                    <select id="inspector-status" value={inspectorStatus} onChange={(event) => setInspectorStatus(event.target.value as CampaignStatus)} className="mt-1.5 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950">
                      <option value="Draft">Draft</option><option value="Pending">In Review</option><option value="Active">Active</option><option value="Paused">Paused</option>
                    </select>
                  </label>
                  <Button type="button" onClick={applyInspectorChanges} className="w-full bg-[#09090B] text-white hover:bg-zinc-800">Apply changes</Button>
                </div>
              </section>

              <div className="mt-auto flex flex-col gap-2 border-t border-black/10 pt-4">
                <Link href={`/campaigns/${inspectorItem.id}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#09090B] px-4 text-sm font-semibold text-white hover:bg-zinc-800">Open full details →</Link>
                <Link href="/ad-tester" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50">Open in Ad Tester</Link>
              </div>
            </div>
          </>}
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(editingItem)} onOpenChange={(open) => { if (!open) setEditingItem(null) }}>
        <SheetContent side="right" className="w-full gap-0 border-l border-border bg-white p-0 sm:max-w-md">
          <div className="border-b border-border p-4">
            <SheetTitle className="text-lg text-foreground">Edit {editingItem?.entity ?? 'item'}</SheetTitle>
            <SheetDescription className="mt-2">Changes apply to this mock manager view only.</SheetDescription>
          </div>
          {editingItem && (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Name
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  onBlur={() => setEditNameTouched(true)}
                  aria-invalid={editNameTouched && !editName.trim()}
                  aria-describedby={editNameTouched && !editName.trim() ? 'edit-name-error' : undefined}
                  className="h-11 rounded-lg border border-border px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {editNameTouched && !editName.trim() && <span id="edit-name-error" role="alert" className="text-sm text-danger-600">Enter a name.</span>}
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
              <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
                <Button type="button" onClick={saveEdit}>Save changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-lg">
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
