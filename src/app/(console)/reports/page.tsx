'use client'

import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/primitives/switch'
import { useConsoleRole } from '@/components/shared/ConsoleRoleContext'
import { useToast } from '@/components/shared/Toast'
import { useLocalStorageJson } from '@/components/shared/useLocalStorageJson'
import { ReportBarChart, ReportLineChart, type ReportMetric } from '@/components/reports/ReportCharts'
import {
  mockReportDatePresets,
  mockReportRows,
  mockReportStorageKey,
  mockReportTemplates,
  reportKpisByRole,
  type ReportKpiKey,
  type ReportRow,
  type SavedReport,
} from '@/data/reports'
import styles from './print.module.css'

const EMPTY_SAVED_REPORTS: SavedReport[] = []

function isSavedReports(value: unknown): value is SavedReport[] {
  return Array.isArray(value) && value.every((item) =>
    Boolean(item)
    && typeof item === 'object'
    && typeof item.id === 'string'
    && typeof item.name === 'string'
    && typeof item.template === 'string'
    && typeof item.dateRange === 'string'
    && typeof item.compare === 'boolean',
  )
}

function getRangeBounds(range: string, previous: boolean) {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  let length = 7
  if (range === '30-days') length = 30
  if (range === 'this-month') {
    start.setDate(1)
    length = end.getDate()
  } else {
    start.setDate(end.getDate() - length + 1)
  }
  start.setHours(0, 0, 0, 0)
  if (!previous) return { start, end }
  const previousEnd = new Date(start)
  previousEnd.setDate(previousEnd.getDate() - 1)
  previousEnd.setHours(23, 59, 59, 999)
  const previousStart = new Date(previousEnd)
  previousStart.setHours(0, 0, 0, 0)
  previousStart.setDate(previousStart.getDate() - length + 1)
  return { start: previousStart, end: previousEnd }
}

function rowsForPeriod(rows: ReportRow[], range: string, previous = false) {
  const bounds = getRangeBounds(range, previous)
  return rows.filter((row) => {
    const date = new Date(`${row.date}T00:00:00`)
    return date >= bounds.start && date <= bounds.end
  })
}

function getKpiValue(rows: ReportRow[], key: ReportKpiKey): number | null {
  if (!rows.length) return null
  if (key === 'rowCount') return rows.length
  if (key === 'ctr') {
    const impressions = rows.reduce((total, row) => total + row.impressions, 0)
    return impressions ? rows.reduce((total, row) => total + row.clicks, 0) / impressions * 100 : null
  }
  return rows.reduce((total, row) => total + row[key], 0)
}

function formatKpi(value: number | null, key: ReportKpiKey) {
  if (value === null) return '—'
  if (key === 'ctr') return `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`
  if (key === 'spend' || key === 'earnings') return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  return value.toLocaleString('en-IN')
}

function formatChange(current: number | null, previous: number | null) {
  if (current === null || previous === null) return 'Comparison unavailable'
  if (current === previous) return '→ No change'
  if (previous === 0) return current > 0 ? '↑ New activity' : '↓ No activity'
  const change = ((current - previous) / Math.abs(previous)) * 100
  return `${change > 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(1)}% vs previous`
}

function csvEscape(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`
}

export default function ReportsPage() {
  const role = useConsoleRole()
  const toast = useToast()
  const [range, setRange] = useState('7-days')
  const [compare, setCompare] = useState(false)
  const [template, setTemplate] = useState('performance')
  const [reportName, setReportName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const savedReportsState = useLocalStorageJson(mockReportStorageKey, EMPTY_SAVED_REPORTS, isSavedReports)
  const savedReports = savedReportsState.value

  const currentRows = useMemo(() => rowsForPeriod(mockReportRows, range), [range])
  const previousRows = useMemo(() => compare ? rowsForPeriod(mockReportRows, range, true) : [], [compare, range])
  const templateInfo = mockReportTemplates.find((item) => item.id === template) ?? mockReportTemplates[0]
  const metrics = reportKpisByRole[role]
  const lineMetric: ReportMetric = role === 'publisher' ? 'earnings' : role === 'advertiser' ? 'spend' : 'impressions'
  const barMetric: ReportMetric = role === 'publisher' ? 'clicks' : 'spend'
  const nameError = nameTouched && !reportName.trim() ? 'Enter a report name.' : ''

  const columns: DataTableColumn<ReportRow>[] = [
    { key: 'date', header: 'Date', render: (row) => row.date },
    { key: 'dimension', header: templateInfo.dimension, render: (row) => row.dimensionValue },
    { key: 'impressions', header: 'Impressions', render: (row) => row.impressions.toLocaleString('en-IN') },
    { key: 'clicks', header: 'Clicks', render: (row) => row.clicks.toLocaleString('en-IN') },
    { key: 'ctr', header: 'CTR', render: (row) => row.impressions ? `${(row.clicks / row.impressions * 100).toFixed(2)}%` : '—' },
    { key: 'spend', header: 'Spend', render: (row) => `₹${row.spend.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
    { key: 'earnings', header: 'Earnings', render: (row) => `₹${row.earnings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
  ]

  useEffect(() => {
    if (savedReportsState.error) {
      console.error('Unable to restore saved reports', savedReportsState.error)
      toast({ title: 'Saved reports could not be restored', description: savedReportsState.error.message, variant: 'error' })
    }
  }, [savedReportsState.error, toast])

  function exportCsv() {
    const headers = ['date', 'dimension', 'dimensionValue', 'impressions', 'clicks', 'ctr', 'spend', 'earnings']
    const content = [
      headers.map(csvEscape).join(','),
      ...currentRows.map((row) => [
        row.date,
        row.dimension,
        row.dimensionValue,
        row.impressions,
        row.clicks,
        row.impressions ? `${(row.clicks / row.impressions * 100).toFixed(2)}%` : '',
        row.spend,
        row.earnings,
      ].map(csvEscape).join(',')),
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `rivinityads-${role}-report.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    toast({
      title: 'CSV exported',
      description: currentRows.length ? 'The current mock report rows were exported.' : 'The CSV contains headers only; no mock data rows are configured.',
      variant: 'success',
    })
  }

  function saveReport(event: MouseEvent<HTMLButtonElement>) {
    setNameTouched(true)
    if (!reportName.trim()) return
    const nextReports = [...savedReports, {
      id: `saved-${event.timeStamp.toString(36)}`,
      name: reportName.trim(),
      template,
      dateRange: range,
      compare,
    }]
    try {
      savedReportsState.setValue(nextReports)
      setReportName('')
      setNameTouched(false)
      toast({ title: 'Report saved', description: 'This report configuration is stored in this browser only.', variant: 'success' })
    } catch (error) {
      console.error('Unable to save report', error)
      toast({ title: 'Report could not be saved', description: 'Browser storage is unavailable or full.', variant: 'error' })
    }
  }

  function removeReport(id: string) {
    const nextReports = savedReports.filter((item) => item.id !== id)
    try {
      savedReportsState.setValue(nextReports)
      toast({ title: 'Saved report removed', description: 'The local report configuration was deleted.', variant: 'success' })
    } catch (error) {
      console.error('Unable to remove saved report', error)
      toast({ title: 'Report could not be removed', description: 'Browser storage could not be updated.', variant: 'error' })
    }
  }

  const roleDescription = role === 'advertiser'
    ? 'Campaign performance and spend reporting from mock data.'
    : role === 'publisher'
      ? 'Publisher delivery and earnings reporting from mock data.'
      : 'Platform reporting for anonymized mock records.'

  return (
    <div className={`mx-auto max-w-7xl space-y-6 ${styles.printPage}`}>
      <div className={styles.printHidden}>
        <PageHeader
          breadcrumbs={[{ label: role[0].toUpperCase() + role.slice(1) }, { label: 'Reports' }]}
          title="Reports"
          description={roleDescription}
          action={<Button type="button" variant="outline" onClick={exportCsv}>Export CSV</Button>}
        />
      </div>

      <Card className={`grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] sm:p-5 ${styles.printCard}`}>
        <Select
          label="Date range"
          value={range}
          onChange={(event) => setRange(event.target.value)}
          options={mockReportDatePresets.map(({ value, label }) => ({ value, label }))}
        />
        <Select
          label="Report template"
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          options={mockReportTemplates.map(({ id, label }) => ({ value: id, label }))}
        />
        <div className="flex items-center gap-3 pt-1">
          <Switch id="compare-periods" checked={compare} onCheckedChange={setCompare} />
          <label htmlFor="compare-periods" className="text-sm font-medium text-navy-900">Compare previous period</label>
        </div>
      </Card>

      <section aria-label="Report key performance indicators" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const current = getKpiValue(currentRows, metric.key)
          const previous = compare ? getKpiValue(previousRows, metric.key) : null
          return (
            <Card key={metric.key} className={`p-5 ${styles.printCard}`}>
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-navy-900">{formatKpi(current, metric.key)}</p>
              <p className={`mt-2 text-xs ${compare ? 'text-slate-600' : 'text-slate-500'}`}>
                {compare ? formatChange(current, previous) : 'Mock data only'}
              </p>
            </Card>
          )
        })}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className={`min-w-0 p-4 sm:p-5 ${styles.printCard}`}>
          <h2 className="mb-3 text-lg font-semibold text-navy-900">{role === 'publisher' ? 'Earnings' : role === 'admin' ? 'Platform activity' : 'Spend'} over time</h2>
          <ReportLineChart rows={currentRows} metric={lineMetric} title={`${role} report trend`} />
          {!currentRows.length && <p className="mt-2 text-sm text-slate-600">No mock time-series data is configured.</p>}
        </Card>
        <Card className={`min-w-0 p-4 sm:p-5 ${styles.printCard}`}>
          <h2 className="mb-3 text-lg font-semibold text-navy-900">{templateInfo.dimension} breakdown</h2>
          <ReportBarChart rows={currentRows} metric={barMetric} title={`${templateInfo.dimension} report breakdown`} />
          {!currentRows.length && <p className="mt-2 text-sm text-slate-600">No breakdown data is configured for this template.</p>}
        </Card>
      </div>

      <section aria-label="Report breakdown">
        {currentRows.length
          ? <DataTable label={`${role} report breakdown`} columns={columns} rows={currentRows} />
          : <EmptyState title="No report rows available" description="No mock reporting data is configured. The report does not generate or infer statistics." />}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className={`space-y-4 p-5 sm:p-6 ${styles.printHidden}`}>
          <div>
            <h2 className="text-lg font-semibold text-navy-900">Save report</h2>
            <p className="mt-1 text-sm text-slate-600">Save the current template and filters to local browser storage.</p>
          </div>
          <Input
            id="saved-report-name"
            label="Report name"
            value={reportName}
            onChange={(event) => setReportName(event.target.value)}
            onBlur={() => setNameTouched(true)}
            error={nameError}
            placeholder="Name this report"
          />
          <Button type="button" onClick={saveReport}>Save to this browser</Button>
        </Card>

        <Card className={`space-y-4 p-5 sm:p-6 ${styles.printHidden}`}>
          <div>
            <h2 className="text-lg font-semibold text-navy-900">Saved reports</h2>
            <p className="mt-1 text-sm text-slate-600">Configurations are stored locally; they contain no report data.</p>
          </div>
          {savedReports.length ? (
            <ul className="divide-y divide-slate-100">
              {savedReports.map((saved) => (
                <li key={saved.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="break-words font-medium text-navy-900">{saved.name}</p>
                    <p className="text-xs text-slate-500">
                      {mockReportTemplates.find((item) => item.id === saved.template)?.label ?? saved.template} · {saved.dateRange} · {saved.compare ? 'Compare on' : 'Compare off'}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" className="px-3 py-2" onClick={() => removeReport(saved.id)}>Remove</Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No saved reports" description="Save a report configuration to see it listed here." />
          )}
        </Card>
      </div>
      <div className={`flex justify-end ${styles.printHidden}`}>
        <Button type="button" variant="outline" onClick={() => window.print()}>Print / Save PDF</Button>
      </div>
    </div>
  )
}
