import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { mockTransactions, type Transaction } from '@/data/advertiser'

const columns: DataTableColumn<Transaction>[] = [
  { key: 'date', header: 'Date', render: (row) => row.date },
  { key: 'type', header: 'Type', render: (row) => row.type },
  { key: 'amount', header: 'Amount', render: (row) => row.amount },
  { key: 'status', header: 'Status', render: (row) => row.status },
]

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <header>
        <p className="text-sm font-medium text-brand-700">Advertiser workspace</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900">Finance</h1>
        <p className="mt-2 text-sm text-slate-600">Mock account overview. No payments or transactions are processed.</p>
      </header>

      <Card className="mt-6 max-w-md p-6">
        <p className="text-sm font-medium text-slate-500">Balance</p>
        <p className="mt-2 text-3xl font-bold text-navy-900">₹0.00</p>
        <p className="mt-2 text-xs text-slate-500">Mock balance only.</p>
      </Card>

      <section aria-labelledby="transactions-heading" className="mt-8">
        <h2 id="transactions-heading" className="mb-4 text-lg font-semibold text-navy-900">Transactions</h2>
        {mockTransactions.length > 0 ? (
          <DataTable label="Transactions" columns={columns} rows={mockTransactions} />
        ) : (
          <EmptyState title="No transactions yet" description="Your mock transactions will appear here when available." />
        )}
      </section>
    </div>
  )
}
