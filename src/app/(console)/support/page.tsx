'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useConsoleRole } from '@/components/shared/ConsoleRoleContext'
import { useToast } from '@/components/shared/Toast'
import { useLocalStorageJson } from '@/components/shared/useLocalStorageJson'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/primitives/label'
import { Textarea } from '@/components/primitives/textarea'
import {
  mockSupportCategories,
  mockSupportTicketStorageKey,
  type LocalSupportTicket,
  type SupportTicketStatus,
} from '@/data/support'

const EMPTY_TICKETS: LocalSupportTicket[] = []

function isSupportTicket(value: unknown): value is LocalSupportTicket {
  if (!value || typeof value !== 'object') return false
  const ticket = value as Partial<LocalSupportTicket>
  return typeof ticket.id === 'string'
    && (ticket.role === 'advertiser' || ticket.role === 'publisher')
    && typeof ticket.subject === 'string'
    && typeof ticket.category === 'string'
    && typeof ticket.message === 'string'
    && (ticket.status === 'Open' || ticket.status === 'In progress' || ticket.status === 'Resolved')
    && typeof ticket.createdAt === 'string'
}

function isSupportTicketList(value: unknown): value is LocalSupportTicket[] {
  return Array.isArray(value) && value.every(isSupportTicket)
}

function statusTone(status: SupportTicketStatus) {
  if (status === 'Resolved') return 'success'
  if (status === 'In progress') return 'brand'
  return 'warning'
}

export default function SupportPage() {
  const role = useConsoleRole()
  const toast = useToast()
  const ticketsState = useLocalStorageJson(mockSupportTicketStorageKey, EMPTY_TICKETS, isSupportTicketList)
  const tickets = ticketsState.value
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [subjectTouched, setSubjectTouched] = useState(false)
  const [categoryTouched, setCategoryTouched] = useState(false)
  const [messageTouched, setMessageTouched] = useState(false)
  const [query, setQuery] = useState('')
  const categories = role === 'admin' ? [] : mockSupportCategories[role]
  const subjectError = subjectTouched && !subject.trim() ? 'Enter a subject.' : ''
  const categoryError = categoryTouched && !categories.includes(category) ? 'Choose a category.' : ''
  const messageError = messageTouched && !message.trim() ? 'Describe how we can help.' : ''

  const rows = useMemo(
    () => tickets
      .filter((ticket) => ticket.role === role)
      .filter((ticket) => `${ticket.id} ${ticket.subject} ${ticket.category} ${ticket.message}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query, role, tickets],
  )

  useEffect(() => {
    if (ticketsState.error) {
      console.error('Unable to restore support tickets', ticketsState.error)
      toast({ title: 'Support tickets could not be restored', description: ticketsState.error.message, variant: 'error' })
    }
  }, [ticketsState.error, toast])

  function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubjectTouched(true)
    setCategoryTouched(true)
    setMessageTouched(true)
    if (role === 'admin' || !subject.trim() || !categories.includes(category) || !message.trim()) return

    const ticket: LocalSupportTicket = {
      id: `local-${event.timeStamp.toString(36)}`,
      role,
      subject: subject.trim(),
      category,
      message: message.trim(),
      status: 'Open',
      createdAt: new Date().toISOString(),
    }
    const nextTickets = [ticket, ...tickets]
    try {
      ticketsState.setValue(nextTickets)
      setSubject('')
      setCategory('')
      setMessage('')
      setSubjectTouched(false)
      setCategoryTouched(false)
      setMessageTouched(false)
      toast({ title: 'Mock support ticket created', description: 'This ticket is saved in this browser only; no request was sent.', variant: 'success' })
    } catch (error) {
      console.error('Unable to save support ticket', error)
      toast({ title: 'Ticket could not be saved', description: 'Browser storage is unavailable or full.', variant: 'error' })
    }
  }

  const columns: DataTableColumn<LocalSupportTicket>[] = [
    { key: 'id', header: 'Ticket', render: (ticket) => <span className="font-medium text-navy-900">{ticket.id}</span> },
    { key: 'subject', header: 'Subject', render: (ticket) => ticket.subject },
    { key: 'category', header: 'Category', render: (ticket) => ticket.category },
    { key: 'status', header: 'Status', render: (ticket) => <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge> },
    { key: 'createdAt', header: 'Created', render: (ticket) => new Date(ticket.createdAt).toLocaleDateString('en-IN') },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: role[0].toUpperCase() + role.slice(1) }, { label: 'Support' }]}
        title="Support"
        description={role === 'admin' ? 'Open the admin support queue to review user conversations.' : 'Create and review your local mock support tickets.'}
        action={role === 'admin'
          ? <Link href="/admin/support" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Open ticket queue</Link>
          : <a href="#create-support-ticket" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Create ticket</a>}
      />

      {role === 'admin' ? (
        <EmptyState title="Admin support queue" description="Admin ticket review and replies are available in the dedicated support tickets workspace." />
      ) : (
        <>
          <Card id="create-support-ticket" className="p-5 sm:p-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={submitTicket} noValidate>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-navy-900">Create a support ticket</h2>
                <Input
                  id="support-subject"
                  label="Subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  onBlur={() => setSubjectTouched(true)}
                  error={subjectError}
                  placeholder="What do you need help with?"
                />
                <Select
                  label="Category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  onBlur={() => setCategoryTouched(true)}
                  error={categoryError}
                  options={[{ value: '', label: 'Choose a category' }, ...categories.map((item) => ({ value: item, label: item }))]}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="support-message">Message</Label>
                <Textarea
                  id="support-message"
                  className="min-h-36"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onBlur={() => setMessageTouched(true)}
                  aria-invalid={Boolean(messageError)}
                  aria-describedby={messageError ? 'support-message-error' : undefined}
                  placeholder="Add the details that will help us understand your question."
                />
                {messageError && <p id="support-message-error" role="alert" className="text-sm text-danger-600">{messageError}</p>}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-500">Tickets are stored in this browser only. Real support access must be authorized by the backend.</p>
                  <Button type="submit">Create ticket</Button>
                </div>
              </div>
            </form>
          </Card>

          <section aria-label="Your support tickets" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-navy-900">Your tickets</h2>
                <p className="mt-1 text-sm text-slate-600">Ticket status is a local prototype value.</p>
              </div>
              <div className="w-full sm:max-w-sm">
                <Input id="support-search" label="Search tickets" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subject, category, or ticket" />
              </div>
            </div>
            {rows.length
              ? <DataTable label="Your support tickets" columns={columns} rows={rows} />
              : <EmptyState title={query ? 'No tickets found' : 'No tickets yet'} description={query ? 'No local tickets match this search.' : 'Create a ticket above; it will appear here after it is saved in this browser.'} />}
          </section>
        </>
      )}
    </div>
  )
}
