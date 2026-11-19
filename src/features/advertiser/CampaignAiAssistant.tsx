'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, RotateCcw, Send } from 'lucide-react'
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
  const [, setMissingFields] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastMessage, setLastMessage] = useState('')
  const messageHistoryRef = useRef<HTMLDivElement>(null)
  const messageSequence = useRef(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDraft(draftFromStorage()), 0)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const messageHistory = messageHistoryRef.current
    messageHistory?.scrollTo({ top: messageHistory.scrollHeight, behavior: 'smooth' })
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
    <main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:h-[calc(100vh-9rem)] lg:min-h-0 lg:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/campaigns/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</Link>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">AI assistant (demo)</span>
      </div>
      <header className="mt-4 lg:mt-3">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Let’s put your campaign together</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tell me what you have in mind. You can edit every detail before anything is submitted.</p>
        <p className="mt-2 text-xs text-muted-foreground" role="status">Draft saved in this browser when updated.</p>
      </header>

      <section aria-label="Campaign assistant conversation" className="mt-4 flex min-h-[26rem] flex-col rounded-lg border border-border bg-white shadow-sm lg:min-h-0 lg:flex-1">
        <div ref={messageHistoryRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p className={`max-w-[85%] break-words whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md bg-muted text-foreground'}`}>{message.text}</p>
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground" role="status">Thinking...</div>}
        </div>
        <div className="shrink-0">
          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3 sm:px-5">
              {quickReplies.map((reply) => <button key={reply} type="button" disabled={loading} onClick={() => void sendMessage(reply)} className="min-h-10 rounded-full border border-border bg-secondary px-3 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">{reply}</button>)}
            </div>
          )}
          <form onSubmit={submit} className="flex gap-2 border-t border-border p-3 sm:p-4">
            <label htmlFor="assistant-message" className="sr-only">Your campaign details</label>
            <input id="assistant-message" value={input} onChange={(event) => setInput(event.target.value)} disabled={loading} placeholder="Write a message..." className="h-11 min-w-0 flex-1 rounded-lg border border-border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-secondary" />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send message" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"><Send className="h-4 w-4" aria-hidden="true" /></button>
          </form>
          {error && <div className="flex items-center justify-between gap-3 px-4 pb-4 text-sm text-red-700" role="alert"><span>{error}</span><button type="button" onClick={() => void sendMessage(lastMessage)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><RotateCcw className="h-3 w-3" aria-hidden="true" />Retry</button></div>}
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-border p-3 sm:flex-row sm:justify-end sm:p-4">
          <button type="button" onClick={() => continueWithDraft(false)} disabled={!hasDraftContent} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">Edit manually</button>
          <button type="button" onClick={() => continueWithDraft(true)} disabled={!hasDraftContent} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">Use this campaign <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </section>
    </main>
  )
}
