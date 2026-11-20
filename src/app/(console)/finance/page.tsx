import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockTransactions, type Transaction } from '@/data/advertiser'
import Link from 'next/link'

const columns: DataTableColumn<Transaction>[] = [
  { key: 'date', header: 'Date', render: (row) => row.date },
  { key: 'type', header: 'Type', render: (row) => row.type },
  { key: 'amount', header: 'Amount', render: (row) => row.amount },
  { key: 'status', header: 'Status', render: (row) => row.status },
]

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser' }, { label: 'Finance' }]}
        title="Finance"
        description="Mock account overview. No payments or transactions are processed."
        action={<Link href="/add-funds" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Add funds</Link>}
      />

      <Card className="mt-4 max-w-md p-4">
        <p className="text-sm font-medium text-muted-foreground">Balance</p>
        <p className="mt-2 text-3xl font-bold text-foreground">₹0.00</p>
        <p className="mt-2 text-sm text-muted-foreground">Mock balance only.</p>
      </Card>

      <section aria-labelledby="transactions-heading" className="mt-8">
        <h2 id="transactions-heading" className="mb-4 text-lg font-semibold text-foreground">Transactions</h2>
        {mockTransactions.length > 0 ? (
          <DataTable label="Transactions" columns={columns} rows={mockTransactions} />
        ) : (
          <EmptyState title="No transactions yet" description="Your mock transactions will appear here when available." />
        )}
      </section>
    </div>
  )
}
