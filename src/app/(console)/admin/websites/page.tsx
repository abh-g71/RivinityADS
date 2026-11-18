'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/shared/Toast'
import { mockAdminWebsites, type AdminWebsite, type AdminWebsiteStatus } from '@/data/admin'

export default function AdminWebsitesPage() {
  const [websites, setWebsites] = useState(mockAdminWebsites)
  const [query, setQuery] = useState('')
  const toast = useToast()
  const rows = useMemo(
    () => websites.filter((website) => `${website.domain} ${website.owner}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query, websites],
  )

  function decideWebsite(id: string, status: Exclude<AdminWebsiteStatus, 'Pending'>) {
    // Website ownership and approval permissions must be enforced by the backend in production.
    setWebsites((current) => current.map((website) => website.id === id ? { ...website, status } : website))
    toast({ title: `Mock website ${status.toLowerCase()}`, description: 'No site was contacted or approved on a real platform.', variant: 'success' })
  }

  const columns: DataTableColumn<AdminWebsite>[] = [
    { key: 'domain', header: 'Website', render: (website) => <span className="font-medium text-navy-900">{website.domain}</span> },
    { key: 'owner', header: 'Publisher', render: (website) => website.owner },
    { key: 'category', header: 'Category', render: (website) => website.category },
    { key: 'submitted', header: 'Submitted', render: (website) => website.submittedAt },
    { key: 'status', header: 'Status', render: (website) => <Badge tone={website.status === 'Approved' ? 'success' : website.status === 'Rejected' ? 'danger' : 'warning'}>{website.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (website) => (
        <div className="flex gap-2">
          <Button type="button" className="px-3 py-2" disabled={website.status !== 'Pending'} onClick={() => decideWebsite(website.id, 'Approved')}>Approve</Button>
          <Button type="button" variant="outline" className="px-3 py-2" disabled={website.status !== 'Pending'} onClick={() => decideWebsite(website.id, 'Rejected')}>Reject</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Websites' }]}
        title="Website review"
        description="Approve or reject anonymized mock publisher websites."
        action={<Link href="/admin/publishers" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Publishers</Link>}
      />
      <div className="mt-6 max-w-md">
        <Input id="website-review-search" label="Search websites" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search domain or publisher" />
      </div>
      <section aria-label="Website review queue" className="mt-5">
        {rows.length
          ? <DataTable label="Website review queue" columns={columns} rows={rows} />
          : <EmptyState title="No websites in this view" description="No mock websites match this search." />}
      </section>
    </div>
  )
}
