import type { ConsoleRole } from '@/data/navigation'

export type ReportRow = {
  id: string
  date: string
  dimension: string
  dimensionValue: string
  impressions: number
  clicks: number
  spend: number
  earnings: number
}

export type SavedReport = {
  id: string
  name: string
  template: string
  dateRange: string
  compare: boolean
}

export type ReportKpiKey = 'rowCount' | 'impressions' | 'clicks' | 'ctr' | 'spend' | 'earnings'

// No performance samples are configured. These templates and filters are mock UI options, not metrics.
export const mockReportRows: ReportRow[] = []
export const mockReportStorageKey = 'rivinityads.saved-reports.v1'
export const mockReportTemplates = [
  { id: 'performance', label: 'Performance', dimension: 'Campaign' },
  { id: 'geo', label: 'Geo', dimension: 'Country' },
  { id: 'device', label: 'Device', dimension: 'Device' },
  { id: 'spend-revenue', label: 'Spend vs Revenue', dimension: 'Day' },
] as const
export const mockReportDatePresets = [
  { value: '7-days', label: 'Last 7 days', days: 7 },
  { value: '30-days', label: 'Last 30 days', days: 30 },
  { value: 'this-month', label: 'This month', days: 0 },
] as const

export const reportKpisByRole: Record<ConsoleRole, { label: string; key: ReportKpiKey }[]> = {
  advertiser: [
    { label: 'Impressions', key: 'impressions' },
    { label: 'Clicks', key: 'clicks' },
    { label: 'CTR', key: 'ctr' },
    { label: 'Spend', key: 'spend' },
  ],
  publisher: [
    { label: 'Impressions', key: 'impressions' },
    { label: 'Clicks', key: 'clicks' },
    { label: 'CTR', key: 'ctr' },
    { label: 'Earnings', key: 'earnings' },
  ],
  admin: [
    { label: 'Report rows', key: 'rowCount' },
    { label: 'Impressions', key: 'impressions' },
    { label: 'Clicks', key: 'clicks' },
    { label: 'Spend', key: 'spend' },
  ],
}
