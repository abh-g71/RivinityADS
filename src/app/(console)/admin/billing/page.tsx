import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StaggerGrid } from '@/components/shared/StaggerGrid'
import { mockAdminBillingRows, type AdminBillingRow } from '@/data/admin'

const columns: DataTableColumn<AdminBillingRow>[] = [
  { key: 'date', header: 'Date', render: (row) => row.date },
  { key: 'account', header: 'Account', render: (row) => row.account },
  { key: 'type', header: 'Type', render: (row) => row.type },
  { key: 'amount', header: 'Amount', render: (row) => row.amount },
  { key: 'status', header: 'Status', render: (row) => row.status },
]

export default function AdminBillingPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Billing' }]}
        title="Billing"
        description="Review mock billing records only. No payments, invoices, or balance changes are processed."
        action={<Link href="/admin/settings" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Billing settings</Link>}
      />
      <StaggerGrid aria-label="Billing summary" className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Mock billing records" value={String(mockAdminBillingRows.length)} detail="Count of local fixture rows" />
        <Card className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Payment processing</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Not connected</p>
          <p className="mt-1 text-xs text-muted-foreground">No real account balances or payment data are available.</p>
        </Card>
      </StaggerGrid>
      <section aria-label="Billing records" className="mt-6">
        {mockAdminBillingRows.length
          ? <DataTable label="Admin billing records" columns={columns} rows={mockAdminBillingRows} />
          : <EmptyState title="No billing records" description="No mock billing records have been provided." />}
      </section>
    </div>
  )
}
