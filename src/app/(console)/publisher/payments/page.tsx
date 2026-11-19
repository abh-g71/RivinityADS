'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/shared/Toast'
import { mockPayoutHistory, mockPublisherBalance, mockPublisherPaymentMethods, type PayoutRow } from '@/data/publisher'
import Link from 'next/link'

export default function PublisherPaymentsPage() {
  const [method, setMethod] = useState('upi')
  const [saved, setSaved] = useState(false)
  const toast = useToast()

  const columns: DataTableColumn<PayoutRow>[] = [
    { key: 'date', header: 'Date', render: (row) => row.date },
    { key: 'method', header: 'Method', render: (row) => row.method },
    { key: 'amount', header: 'Amount', render: (row) => row.amount },
    { key: 'status', header: 'Status', render: (row) => row.status },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Publisher', href: '/publisher' }, { label: 'Payments' }]}
        title="Payments"
        description="Mock payout settings and history."
        action={<Link href="/publisher/earnings" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View earnings</Link>}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Available balance</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{mockPublisherBalance}</p>
          <p className="mt-2 text-sm text-muted-foreground">Mock balance only. Minimum payout is set by platform.</p>
        </Card>
        <Card className="p-6">
          <Select
            label="Payout method"
            value={method}
            onChange={(event) => {
              setMethod(event.target.value)
              setSaved(false)
            }}
            options={mockPublisherPaymentMethods.map((option) => ({ ...option }))}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSaved(true)
                toast({ title: 'Mock payout preference saved', description: 'This selection is not sent to a payment provider.', variant: 'success' })
              }}
            >
              Save preference
            </Button>
            {saved && <span role="status" className="text-sm text-muted-foreground">Saved for this view only.</span>}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Demo selection only; no payment details are collected or saved.</p>
        </Card>
      </div>

      <section aria-labelledby="payout-history" className="mt-8">
        <h2 id="payout-history" className="mb-4 text-lg font-semibold text-foreground">Payout history</h2>
        {mockPayoutHistory.length > 0 ? (
          <DataTable label="Payout history" columns={columns} rows={mockPayoutHistory} />
        ) : (
          <EmptyState title="No payouts yet" description="Your payout history will appear here when available." />
        )}
      </section>
    </div>
  )
}
