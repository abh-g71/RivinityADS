'use client'

import { useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'

type Status = 'Open' | 'In progress' | 'Resolved'
type Event = { who: 'You' | 'Support'; text: string; when: string }
type Ticket = { id: string; subject: string; category: string; status: Status; files: string[]; events: Event[] }

const CATEGORIES = ['Billing and payments', 'Campaigns', 'Ad review', 'Technical problem', 'Account', 'Other']
const DOT: Record<Status, string> = { Open: 'bg-amber-500', 'In progress': 'bg-brand-600', Resolved: 'bg-green-500' }
const MAX_FILES = 3
const MAX_MB = 5

const START: Ticket[] = [
  {
    id: 'TK-1004', subject: 'Payment not showing in balance', category: 'Billing and payments', status: 'In progress', files: ['payment-receipt.pdf'],
    events: [
      { who: 'You', text: 'I added funds by UPI yesterday but my balance still shows zero.', when: '16 Nov, 10:20' },
      { who: 'Support', text: 'Thanks. We are checking this with the payment partner and will update you today.', when: '16 Nov, 12:05' },
    ],
  },
  {
    id: 'TK-1002', subject: 'Why was my ad rejected?', category: 'Ad review', status: 'Resolved', files: [],
    events: [
      { who: 'You', text: 'My campaign was rejected without a reason.', when: '12 Nov, 09:00' },
      { who: 'Support', text: 'The image had too much text. Please use less than 20% text and resubmit.', when: '12 Nov, 14:30' },
    ],
  },
]

const field = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(START)
  const [selected, setSelected] = useState<string>(START[0].id)
  const [filter, setFilter] = useState<'All' | Status>('All')
  const [counter, setCounter] = useState(1005)

  const [category, setCategory] = useState(CATEGORIES[0])
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [touched, setTouched] = useState(false)
  const [fileError, setFileError] = useState('')
  const [reply, setReply] = useState('')
  const [sent, setSent] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const shown = tickets.filter((t) => filter === 'All' || t.status === filter)
  const ticket = tickets.find((t) => t.id === selected)
  const subjectBad = touched && !subject.trim()
  const descBad = touched && description.trim().length < 10

  function pick(list: FileList | null) {
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
    if (input.current) input.current.value = ''
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!subject.trim() || description.trim().length < 10) return
    const id = `TK-${counter}`
    const t: Ticket = {
      id, subject: subject.trim(), category, status: 'Open', files: files.map((f) => f.name),
      events: [{ who: 'You', text: description.trim(), when: 'Just now' }],
    }
    setTickets((l) => [t, ...l])
    setCounter((c) => c + 1)
    setSelected(id)
    setFilter('All')
    setSubject(''); setDescription(''); setFiles([]); setTouched(false); setFileError('')
    setSent(`Ticket ${id} created. Files are not uploaded in this prototype.`)
  }

  function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!ticket || !reply.trim()) return
    setTickets((l) => l.map((t) => (t.id === ticket.id ? { ...t, status: t.status === 'Resolved' ? 'Open' : t.status, events: [...t.events, { who: 'You', text: reply.trim(), when: 'Just now' }] } : t)))
    setReply('')
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-500">Support</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Support</h1>
        <p className="mt-1 text-sm text-slate-500">Tell us what is wrong. Replies here are sample data; no real support team is connected.</p>
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <form onSubmit={submit} noValidate className="col-span-12 space-y-3 rounded-lg border border-slate-200 bg-white p-4 xl:col-span-5" aria-label="New ticket">
          <h2 className="text-base font-semibold text-slate-900">New ticket</h2>
          <label className="block text-sm font-medium text-slate-700">Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} mt-1`}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={subjectBad} placeholder="Short summary" className={`${field} mt-1`} />
            {subjectBad && <span role="alert" className="text-xs text-red-700">Enter a subject.</span>}
          </label>
          <label className="block text-sm font-medium text-slate-700">Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => setTouched(true)} rows={5} aria-invalid={descBad} placeholder="What happened? What did you expect?" className={`${field} mt-1`} />
            {descBad && <span role="alert" className="text-xs text-red-700">Write at least 10 characters.</span>}
          </label>
          <div>
            <p className="text-sm font-medium text-slate-700">Attachments <span className="font-normal text-slate-500">(optional, up to {MAX_FILES} files, {MAX_MB} MB each)</span></p>
            <input ref={input} type="file" multiple accept="image/*,.pdf" onChange={(e) => pick(e.target.files)} className="sr-only" id="attach" />
            <label htmlFor="attach" className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Paperclip className="h-4 w-4" aria-hidden="true" /> Add files
            </label>
            {fileError && <p role="alert" className="mt-1 text-xs text-red-700">{fileError}</p>}
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={f.name + i} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                    <span className="truncate">{f.name}</span>
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} className="text-slate-500 hover:text-slate-900"><X className="h-4 w-4" aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Submit ticket</button>
          {sent && <p role="status" className="text-xs text-green-700">{sent}</p>}
        </form>

        <div className="col-span-12 space-y-4 xl:col-span-7">
          <section className="rounded-lg border border-slate-200 bg-white" aria-label="My tickets">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-900">My tickets</h2>
              <div role="tablist" aria-label="Filter tickets" className="inline-flex rounded-md bg-slate-100 p-0.5">
                {(['All', 'Open', 'In progress', 'Resolved'] as const).map((f) => (
                  <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                    className={`rounded px-3 py-1.5 text-xs font-medium ${filter === f ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>{f}</button>
                ))}
              </div>
            </div>
            {shown.length === 0 ? (
              <p className="border-t border-slate-100 p-4 text-sm text-slate-500">No tickets here.</p>
            ) : (
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {shown.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => setSelected(t.id)} aria-current={selected === t.id}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 ${selected === t.id ? 'bg-slate-50' : ''}`}>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">{t.subject}</span>
                        <span className="text-xs text-slate-500">{t.id} · {t.category}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-2 text-xs text-slate-700"><span className={`h-2 w-2 rounded-full ${DOT[t.status]}`} aria-hidden="true" />{t.status}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {ticket && (
            <section className="rounded-lg border border-slate-200 bg-white p-4" aria-label="Ticket history">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{ticket.subject}</h2>
                  <p className="text-xs text-slate-500">{ticket.id} · {ticket.category}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"><span className={`h-2 w-2 rounded-full ${DOT[ticket.status]}`} aria-hidden="true" />{ticket.status}</span>
              </div>
              {ticket.files.length > 0 && (
                <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" />{ticket.files.join(', ')}</p>
              )}
              <ol className="mt-4 space-y-3 border-l border-slate-200 pl-4">
                {ticket.events.map((ev, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${ev.who === 'You' ? 'bg-slate-400' : 'bg-brand-600'}`} aria-hidden="true" />
                    <p className="text-xs text-slate-500"><span className="font-medium text-slate-800">{ev.who}</span> · {ev.when}</p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{ev.text}</p>
                  </li>
                ))}
              </ol>
              <form onSubmit={sendReply} className="mt-4 flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={ticket.status === 'Resolved' ? 'Reply to reopen this ticket' : 'Add a message'} aria-label="Add a message" className={field} />
                <button type="submit" disabled={!reply.trim()} className="shrink-0 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Send</button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}