'use client'

import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/primitives/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/primitives/sheet'
import { Textarea } from '@/components/primitives/textarea'
import { useToast } from '@/components/shared/Toast'
import { mockAdminSupportTickets, type AdminSupportTicket, type AdminTicketStatus } from '@/data/admin'

const ticketStatuses: AdminTicketStatus[] = ['Open', 'In progress', 'Resolved']

function isAdminTicketStatus(value: string): value is AdminTicketStatus {
  return ticketStatuses.some((status) => status === value)
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState(mockAdminSupportTickets)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [replyTouched, setReplyTouched] = useState(false)
  const toast = useToast()
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId)
  const rows = useMemo(
    () => tickets.filter((ticket) => `${ticket.id} ${ticket.subject} ${ticket.requester}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query, tickets],
  )

  function openTicket(ticket: AdminSupportTicket) {
    setSelectedId(ticket.id)
    setReply('')
    setReplyTouched(false)
  }

  function updateTicketStatus(id: string, value: string) {
    if (!isAdminTicketStatus(value)) return
    const status = value
    // Ticket access and status transitions must be authorized and enforced by the backend in production.
    setTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, status } : ticket))
    toast({ title: 'Mock ticket status updated', description: 'The change is local to this prototype.', variant: 'success' })
  }

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReplyTouched(true)
    if (!selectedTicket || !reply.trim()) return
    setTickets((current) => current.map((ticket) => ticket.id === selectedTicket.id
      ? { ...ticket, messages: [...ticket.messages, { author: 'Admin', body: reply.trim(), createdAt: 'Mock response' }] }
      : ticket))
    setReply('')
    setReplyTouched(false)
    toast({ title: 'Mock reply added', description: 'No message was sent to an external user.', variant: 'success' })
  }

  const columns: DataTableColumn<AdminSupportTicket>[] = [
    { key: 'id', header: 'Ticket', render: (ticket) => <span className="font-medium text-navy-900">{ticket.id}</span> },
    { key: 'subject', header: 'Subject', render: (ticket) => ticket.subject },
    { key: 'requester', header: 'Requester', render: (ticket) => ticket.requester },
    { key: 'status', header: 'Status', render: (ticket) => <Badge tone={ticket.status === 'Resolved' ? 'success' : ticket.status === 'In progress' ? 'brand' : 'warning'}>{ticket.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (ticket) => <Button type="button" variant="outline" className="px-3 py-2" onClick={() => openTicket(ticket)}>View details</Button>,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Support Tickets' }]}
        title="Support Tickets"
        description="Review mock support conversations and add local replies."
        action={<Link href="/admin/users" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Manage users</Link>}
      />
      <div className="mt-6 max-w-md">
        <Input id="ticket-search" label="Search tickets" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subject, requester, or ID" />
      </div>
      <section aria-label="Support ticket list" className="mt-5">
        {rows.length
          ? <DataTable label="Support tickets" columns={columns} rows={rows} />
          : <EmptyState title="No tickets found" description="No mock tickets match this search." />}
      </section>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => { if (!open) setSelectedId(null) }}>
        <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-white p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-slate-200 pr-12">
            <SheetTitle>{selectedTicket?.subject ?? 'Support ticket'}</SheetTitle>
            <SheetDescription>{selectedTicket ? `${selectedTicket.id} · ${selectedTicket.requester}` : 'Ticket details'}</SheetDescription>
          </SheetHeader>
          {selectedTicket && (
            <div className="space-y-5 p-4 sm:p-6">
              <div className="space-y-3">
                {selectedTicket.messages.map((message, index) => (
                  <article key={`${message.author}-${index}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <h3 className="text-sm font-semibold text-navy-900">{message.author}</h3>
                      <span className="text-xs text-slate-500">{message.createdAt}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{message.body}</p>
                  </article>
                ))}
              </div>
              <div className="space-y-2">
                <Select
                  label="Ticket status"
                  value={selectedTicket.status}
                  onChange={(event) => updateTicketStatus(selectedTicket.id, event.target.value)}
                  options={ticketStatuses.map((status) => ({ value: status, label: status }))}
                />
              </div>
              <form className="space-y-3" onSubmit={sendReply} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="ticket-reply">Reply</Label>
                  <Textarea
                    id="ticket-reply"
                    rows={4}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    onBlur={() => setReplyTouched(true)}
                    aria-invalid={replyTouched && !reply.trim()}
                    aria-describedby={replyTouched && !reply.trim() ? 'ticket-reply-error' : undefined}
                    placeholder="Write a mock reply"
                  />
                  {replyTouched && !reply.trim() && <p id="ticket-reply-error" role="alert" className="text-sm text-red-700">Enter a reply.</p>}
                </div>
                <Button type="submit">Add mock reply</Button>
                <p className="text-xs text-slate-500">Replies stay in this browser session; real support access must be authorized server-side.</p>
              </form>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
