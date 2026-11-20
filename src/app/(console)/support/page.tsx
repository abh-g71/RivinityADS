'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Paperclip, X } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { useConsoleRole } from '@/components/shared/ConsoleRoleContext'
import { useToast } from '@/components/shared/Toast'
import { useLocalStorageJson } from '@/components/shared/useLocalStorageJson'
import {
  mockSupportCategories,
  mockSupportTicketStorageKey,
  type LocalSupportTicket,
  type SupportTicketStatus,
} from '@/data/support'

type TicketEvent = { who: 'You' | 'Support'; text: string; when: string }
type Ticket = LocalSupportTicket & { files?: string[]; events?: TicketEvent[] }

const EMPTY_TICKETS: Ticket[] = []
const MAX_FILES = 3
const MAX_MB = 5
const DOT: Record<SupportTicketStatus, string> = { Open: 'bg-amber-500', 'In progress': 'bg-primary', Resolved: 'bg-green-500' }
const field = 'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function isTicket(value: unknown): value is Ticket {
  if (!value || typeof value !== 'object') return false
  const t = value as Partial<Ticket>
  return typeof t.id === 'string'
    && (t.role === 'advertiser' || t.role === 'publisher')
    && typeof t.subject === 'string'
    && typeof t.category === 'string'
    && typeof t.message === 'string'
    && (t.status === 'Open' || t.status === 'In progress' || t.status === 'Resolved')
    && typeof t.createdAt === 'string'
}
function isTicketList(value: unknown): value is Ticket[] {
  return Array.isArray(value) && value.every(isTicket)
}
const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function SupportPage() {
  const role = useConsoleRole()
  const toast = useToast()
  const state = useLocalStorageJson(mockSupportTicketStorageKey, EMPTY_TICKETS, isTicketList)
  const tickets = state.value
  const categories = role === 'admin' ? [] : mockSupportCategories[role]

  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [touched, setTouched] = useState(false)
  const [filter, setFilter] = useState<'All' | SupportTicketStatus>('All')
  const [selectedId, setSelectedId] = useState('')
  const [reply, setReply] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.error) {
      console.error('Unable to restore support tickets', state.error)
      toast({ title: 'Support tickets could not be restored', description: state.error.message, variant: 'error' })
    }
  }, [state.error, toast])

  const mine = useMemo(() => tickets.filter((t) => t.role === role), [tickets, role])
  const shown = mine.filter((t) => filter === 'All' || t.status === filter)
  const ticket = mine.find((t) => t.id === selectedId) ?? mine[0]

  const subjectBad = touched && !subject.trim()
  const categoryBad = touched && !categories.includes(category)
  const messageBad = touched && message.trim().length < 10

  function save(next: Ticket[]) {
    try {
      state.setValue(next)
      return true
    } catch (error) {
      console.error('Unable to save support ticket', error)
      toast({ title: 'Ticket could not be saved', description: 'Browser storage is unavailable or full.', variant: 'error' })
      return false
    }
  }

  function pickFiles(list: FileList | null) {
    if (!list) return
    const next = [...files]
    let err = ''
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) { err = `You can attach up to ${MAX_FILES} files.`; break }
      if (f.size > MAX_MB * 1024 * 1024) { err = `${f.name} is larger than ${MAX_MB} MB.`; continue }
      next.push(f)
    }
    setFiles(next)
    setFileError(err)
    if (fileInput.current) fileInput.current.value = ''
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (role === 'admin' || !subject.trim() || !categories.includes(category) || message.trim().length < 10) return
    const now = new Date().toISOString()
    const created: Ticket = {
      id: `local-${event.timeStamp.toString(36)}`,
      role,
      subject: subject.trim(),
      category,
      message: message.trim(),
      status: 'Open',
      createdAt: now,
      files: files.map((f) => f.name),
      events: [{ who: 'You', text: message.trim(), when: when(now) }],
    }
    if (!save([created, ...tickets])) return
    setSelectedId(created.id)
    setFilter('All')
    setSubject(''); setCategory(''); setMessage(''); setFiles([]); setFileError(''); setTouched(false)
    toast({ title: 'Mock support ticket created', description: 'Saved in this browser only. Attached files are not uploaded.', variant: 'success' })
  }

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ticket || !reply.trim()) return
    const now = new Date().toISOString()
    const events = ticket.events ?? [{ who: 'You' as const, text: ticket.message, when: when(ticket.createdAt) }]
    save(tickets.map((t) => (t.id === ticket.id
      ? { ...t, status: t.status === 'Resolved' ? 'Open' : t.status, events: [...events, { who: 'You' as const, text: reply.trim(), when: when(now) }] }
      : t)))
    setReply('')
  }

  function resolve() {
    if (!ticket) return
    save(tickets.map((t) => (t.id === ticket.id ? { ...t, status: 'Resolved' } : t)))
  }

  if (role === 'admin') {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Admin / Support</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Support</h1>
        </div>
        <EmptyState title="Admin support queue" description="Review and reply to user tickets in the dedicated queue." />
        <Link href="/admin/support" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">Open ticket queue</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{role[0].toUpperCase() + role.slice(1)} / Support</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tickets are saved in this browser only. No real support team is connected.</p>
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <form onSubmit={submit} noValidate aria-label="New ticket" className="col-span-12 space-y-3 rounded-lg border border-border bg-white p-4 xl:col-span-5">
          <h2 className="text-base font-semibold text-foreground">New ticket</h2>
          <label className="block text-sm font-medium text-foreground">Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-invalid={categoryBad} className={`${field} mt-1`}>
              <option value="">Choose a category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {categoryBad && <span role="alert" className="text-sm text-red-700">Choose a category.</span>}
          </label>
          <label className="block text-sm font-medium text-foreground">Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} aria-invalid={subjectBad} placeholder="Short summary" className={`${field} mt-1`} />
            {subjectBad && <span role="alert" className="text-sm text-red-700">Enter a subject.</span>}
          </label>
          <label className="block text-sm font-medium text-foreground">Description
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} aria-invalid={messageBad} placeholder="What happened? What did you expect?" className={`${field} mt-1`} />
            {messageBad && <span role="alert" className="text-sm text-red-700">Write at least 10 characters.</span>}
          </label>
          <div>
            <p className="text-sm font-medium text-foreground">Attachments <span className="font-normal text-muted-foreground">(optional, up to {MAX_FILES} files, {MAX_MB} MB each)</span></p>
            <input ref={fileInput} id="attach" type="file" multiple accept="image/*,.pdf" onChange={(e) => pickFiles(e.target.files)} className="sr-only" />
            <label htmlFor="attach" className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <Paperclip className="h-4 w-4" aria-hidden="true" /> Add files
            </label>
            {fileError && <p role="alert" className="mt-1 text-sm text-red-700">{fileError}</p>}
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={f.name + i} className="flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm text-foreground">
                    <span className="truncate">{f.name}</span>
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Submit ticket</button>
        </form>

        <div className="col-span-12 space-y-4 xl:col-span-7">
          <section className="rounded-lg border border-border bg-white" aria-label="My tickets">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <h2 className="text-base font-semibold text-foreground">My tickets</h2>
              <div role="tablist" aria-label="Filter tickets" className="inline-flex rounded-md bg-muted p-0.5">
                {(['All', 'Open', 'In progress', 'Resolved'] as const).map((f) => (
                  <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                    className={`rounded px-3 py-1.5 text-sm font-medium ${filter === f ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>{f}</button>
                ))}
              </div>
            </div>
            {shown.length === 0 ? (
              <p className="border-t border-border p-4 text-sm text-muted-foreground">{mine.length ? 'No tickets in this filter.' : 'No tickets yet. Create one on the left.'}</p>
            ) : (
              <ul className="divide-y divide-border border-t border-border">
                {shown.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => setSelectedId(t.id)} className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted ${ticket?.id === t.id ? 'bg-secondary' : ''}`}>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">{t.subject}</span>
                        <span className="text-sm text-muted-foreground">{t.category} · {when(t.createdAt)}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-2 text-sm text-foreground"><span className={`h-2 w-2 rounded-full ${DOT[t.status]}`} aria-hidden="true" />{t.status}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {ticket && (
            <section className="rounded-lg border border-border bg-white p-4" aria-label="Ticket history">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{ticket.subject}</h2>
                  <p className="text-sm text-muted-foreground">{ticket.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-sm font-medium text-foreground"><span className={`h-2 w-2 rounded-full ${DOT[ticket.status]}`} aria-hidden="true" />{ticket.status}</span>
                  {ticket.status !== 'Resolved' && <button type="button" onClick={resolve} className="rounded-md border border-border px-3 py-1 text-sm font-medium text-foreground hover:bg-muted">Mark resolved</button>}
                </div>
              </div>
              {ticket.files && ticket.files.length > 0 && (
                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" />{ticket.files.join(', ')}</p>
              )}
              <ol className="mt-4 space-y-3 border-l border-border pl-4">
                {(ticket.events ?? [{ who: 'You' as const, text: ticket.message, when: when(ticket.createdAt) }]).map((ev, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{ev.who}</span> · {ev.when}</p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{ev.text}</p>
                  </li>
                ))}
              </ol>
              <form onSubmit={sendReply} className="mt-4 flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={ticket.status === 'Resolved' ? 'Reply to reopen this ticket' : 'Add a message'} aria-label="Add a message" className={field} />
                <button type="submit" disabled={!reply.trim()} className="shrink-0 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">Send</button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
