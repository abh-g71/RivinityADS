'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/primitives/switch'
import { useToast } from '@/components/shared/Toast'
import { mockAdminUsers, type AdminRole, type AdminUser } from '@/data/admin'

function isRoleFilter(value: string): value is 'All' | AdminRole {
  return value === 'All' || value === 'Advertiser' || value === 'Publisher' || value === 'Admin'
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockAdminUsers)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'All' | AdminRole>('All')
  const toast = useToast()

  const rows = useMemo(
    () => users.filter((user) => (role === 'All' || user.role === role)
      && `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query, role, users],
  )

  function toggleStatus(id: string) {
    // Account permissions and status enforcement must be performed by the backend in production.
    setUsers((current) => current.map((user) => user.id === id
      ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' }
      : user))
    const user = users.find((item) => item.id === id)
    if (user) toast({ title: 'Mock user status updated', description: `${user.name} was toggled locally.`, variant: 'success' })
  }

  const columns: DataTableColumn<AdminUser>[] = [
    { key: 'name', header: 'User', render: (user) => <span className="font-medium text-foreground">{user.name}</span> },
    { key: 'email', header: 'Email', render: (user) => user.email },
    { key: 'role', header: 'Role', render: (user) => user.role },
    { key: 'status', header: 'Status', render: (user) => <Badge tone={user.status === 'Active' ? 'success' : 'warning'}>{user.status}</Badge> },
    {
      key: 'enabled',
      header: 'Active',
      render: (user) => (
        <Switch
          checked={user.status === 'Active'}
          onCheckedChange={() => toggleStatus(user.id)}
          aria-label={`Toggle status for ${user.name}`}
        />
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
        title="Users"
        description="Search anonymized mock accounts and preview role and status controls."
        action={<Link href="/admin/advertisers" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Advertisers</Link>}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input
          id="admin-user-search"
          label="Search users"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
        />
        <Select
          label="Role filter"
          value={role}
          onChange={(event) => {
            if (isRoleFilter(event.target.value)) setRole(event.target.value)
          }}
          options={[
            { value: 'All', label: 'All roles' },
            { value: 'Advertiser', label: 'Advertiser' },
            { value: 'Publisher', label: 'Publisher' },
            { value: 'Admin', label: 'Admin' },
          ]}
        />
      </div>
      <section aria-label="Admin users" className="mt-5">
        {rows.length
          ? <DataTable label="Admin users" columns={columns} rows={rows} />
          : <EmptyState title="No users found" description="Try another search or role filter." />}
      </section>
    </div>
  )
}
