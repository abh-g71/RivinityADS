'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Bot, RotateCcw, Send } from 'lucide-react'
import { generateCampaignDraft } from '@/services/campaignAi'
import { useToast } from '@/components/shared/Toast'
import { campaignDraftStorageKey } from '@/features/advertiser/campaignTemplates'
import { createEmptyCampaignDraft, migrateCampaignDraft, type CampaignDraft, type ChatMessage } from '@/types/campaign'

function draftFromStorage(): CampaignDraft {
  try {
    const stored = window.localStorage.getItem(campaignDraftStorageKey)
    if (!stored) return createEmptyCampaignDraft()
    const value: unknown = JSON.parse(stored)
    if (value && typeof value === 'object' && 'objective' in value && 'location' in value) {
      return migrateCampaignDraft(value)
    }
  } catch (error) {
    console.error('Unable to read campaign draft for AI assistant', error)
  }
  return createEmptyCampaignDraft()
}

export function CampaignAiAssistant() {
  const router = useRouter()
  const toast = useToast()
  const [draft, setDraft] = useState<CampaignDraft>(createEmptyCampaignDraft)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: 'What would you like to advertise? I’ll ask one question at a time.' },
  ])
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastMessage, setLastMessage] = useState('')
  const tailRef = useRef<HTMLDivElement>(null)
  const messageSequence = useRef(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDraft(draftFromStorage()), 0)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    messageSequence.current += 1
    const userMessage: ChatMessage = { id: `user-${messageSequence.current}`, role: 'user', text: trimmed }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setQuickReplies([])
    setLastMessage(trimmed)
    setError('')
    setLoading(true)
    try {
      const result = await generateCampaignDraft({ messages: nextMessages, currentDraft: draft })
      setDraft(result.draft)
      setMissingFields(result.missingFields)
      setQuickReplies(result.quickReplies ?? [])
      setMessages((current) => [...current, { id: `assistant-${messageSequence.current}`, role: 'assistant', text: result.reply }])
      window.localStorage.setItem(campaignDraftStorageKey, JSON.stringify(result.draft))
    } catch (caught) {
      console.error('Campaign AI demo failed', caught)
      setError('The assistant could not update your draft. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  function continueWithDraft(review: boolean) {
    try {
      window.localStorage.setItem(campaignDraftStorageKey, JSON.stringify(draft))
      router.push(review ? '/campaigns/new/manual?review=true' : '/campaigns/new/manual')
    } catch (caught) {
      console.error('Unable to save AI campaign draft', caught)
      toast({ title: 'Draft could not be saved', description: 'Check browser storage and try again.', variant: 'error' })
    }
  }

  const hasDraftContent = Boolean(draft.objective || draft.location.label || draft.headline || draft.text || draft.url)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:min-h-[calc(100vh-9rem)] lg:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/campaigns/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</Link>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">AI assistant (demo)</span>
      </div>
      <header className="mt-4 lg:mt-3">
        <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">Let’s put your campaign together</h1>
        <p className="mt-1 text-sm text-slate-600">Tell me what you have in mind. You can edit every detail before anything is submitted.</p>
        <p className="mt-2 text-xs text-slate-500" role="status">Draft saved in this browser when updated.</p>
      </header>

      <section aria-label="Campaign assistant conversation" className="mt-4 flex min-h-[26rem] flex-col rounded-lg border border-slate-200 bg-white shadow-sm lg:h-[min(68vh,48rem)] lg:min-h-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 lg:min-h-0" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Bot className="h-4 w-4" aria-hidden="true" /></span>}
              <p className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-slate-100 text-navy-900'}`}>{message.text}</p>
            </div>
          ))}
          {loading && <div className="flex items-center gap-2 text-sm text-slate-500" role="status"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Bot className="h-4 w-4" aria-hidden="true" /></span><span>Thinking…</span></div>}
          <div ref={tailRef} />
        </div>
        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3 sm:px-5">
            {quickReplies.map((reply) => <button key={reply} type="button" disabled={loading} onClick={() => void sendMessage(reply)} className="min-h-10 rounded-full border border-brand-200 bg-brand-50 px-3 text-sm font-medium text-brand-700 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50">{reply}</button>)}
          </div>
        )}
        <form onSubmit={submit} className="flex gap-2 border-t border-slate-100 p-3 sm:p-4">
          <label htmlFor="assistant-message" className="sr-only">Your campaign details</label>
          <input id="assistant-message" value={input} onChange={(event) => setInput(event.target.value)} disabled={loading} placeholder="Write a message…" className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:bg-slate-50" />
          <button type="submit" disabled={!input.trim() || loading} aria-label="Send message" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"><Send className="h-4 w-4" aria-hidden="true" /></button>
        </form>
        {error && <div className="flex items-center justify-between gap-3 px-4 pb-4 text-sm text-red-700" role="alert"><span>{error}</span><button type="button" onClick={() => void sendMessage(lastMessage)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><RotateCcw className="h-3 w-3" aria-hidden="true" />Retry</button></div>}
      </section>

      <section aria-labelledby="ai-draft-title" className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:max-h-[18rem] lg:overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="ai-draft-title" className="text-lg font-semibold text-navy-900">Your campaign draft</h2>
            <p className="mt-1 text-sm text-slate-600">{hasDraftContent ? `${missingFields.length} detail${missingFields.length === 1 ? '' : 's'} left to add` : 'Your details will appear here as you chat.'}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Not published</span>
        </div>
        {hasDraftContent ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ['Goal', draft.objective],
              ['Location', draft.location.label],
              ['Daily budget', draft.dailyBudget ? `₹${draft.dailyBudget.toLocaleString('en-IN')}` : ''],
              ['Headline', draft.headline],
              ['Ad text', draft.text],
              ['Website', draft.url],
            ].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-navy-900">{value || <span className="font-normal text-slate-500">Not added yet</span>}</dd></div>)}
          </dl>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">Start with a goal or tell the assistant about your business and location.</div>
        )}
        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => continueWithDraft(false)} disabled={!hasDraftContent} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50">Edit manually</button>
          <button type="button" onClick={() => continueWithDraft(true)} disabled={!hasDraftContent} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50">Use this campaign <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </section>
    </main>
  )
}
