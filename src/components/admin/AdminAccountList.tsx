'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/Input'
import { mockAdminUsers, type AdminRole, type AdminUser } from '@/data/admin'

export function AdminAccountList({ role }: { role: Extract<AdminRole, 'Advertiser' | 'Publisher'> }) {
  const [query, setQuery] = useState('')
  const title = role === 'Advertiser' ? 'Advertisers' : 'Publishers'
  const rows = useMemo(
    () => mockAdminUsers.filter((user) => user.role === role
      && `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query, role],
  )

  const columns: DataTableColumn<AdminUser>[] = [
    { key: 'name', header: 'Account', render: (user) => <span className="font-medium text-foreground">{user.name}</span> },
    { key: 'email', header: 'Email', render: (user) => user.email },
    { key: 'status', header: 'Status', render: (user) => <Badge tone={user.status === 'Active' ? 'success' : 'warning'}>{user.status}</Badge> },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: title }]}
        title={title}
        description={`Review ${title.toLowerCase()} from anonymized mock fixtures only.`}
        action={<Link href="/admin/users" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">All users</Link>}
      />
      <div className="mt-6 max-w-md">
        <Input
          id={`admin-${role.toLowerCase()}-search`}
          label={`Search ${title.toLowerCase()}`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
        />
      </div>
      <section aria-label={title} className="mt-5">
        {rows.length
          ? <DataTable label={title} columns={columns} rows={rows} />
          : <EmptyState title={`No ${title.toLowerCase()} found`} description="Try another search or check the mock user fixture list." />}
      </section>
    </div>
  )
}
