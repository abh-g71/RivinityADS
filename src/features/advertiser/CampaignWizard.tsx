'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, ImagePlus } from 'lucide-react'
import { MapPicker } from '@/features/advertiser/MapPicker'
import { AdPreview } from '@/features/advertiser/AdPreview'
import { campaignDraftStorageKey, campaignTemplates } from '@/features/advertiser/campaignTemplates'
import { useToast } from '@/components/shared/Toast'
import { createEmptyCampaignDraft, type CampaignDraft } from '@/types/campaign'

const goals = [
  { title: 'Get website visits', hint: 'Bring more people to your website.' },
  { title: 'Get leads', hint: 'Encourage people to contact you.' },
  { title: 'Get sales', hint: 'Help people discover and buy your products.' },
  { title: 'Build awareness', hint: 'Introduce your business to more people.' },
]
const interests = ['Shopping', 'Food & dining', 'Travel', 'Technology', 'Fitness', 'Events', 'Beauty', 'Education']
const durations: (number | 'ongoing')[] = [7, 14, 30, 'ongoing']

type ReviewField = 'objective' | 'location' | 'age' | 'gender' | 'interests' | 'budget' | 'duration' | 'headline' | 'text' | 'cta' | 'url'

function isValidDraft(value: unknown): value is CampaignDraft {
  if (!value || typeof value !== 'object') return false
  const draft = value as Partial<CampaignDraft>
  return typeof draft.objective === 'string'
    && Boolean(draft.location && typeof draft.location.label === 'string' && typeof draft.location.radiusKm === 'number')
    && typeof draft.dailyBudget === 'number'
    && (typeof draft.duration === 'number' || draft.duration === 'ongoing')
    && Array.isArray(draft.interests)
    && typeof draft.headline === 'string'
    && typeof draft.text === 'string'
    && typeof draft.cta === 'string'
    && typeof draft.url === 'string'
}

function urlError(value: string) {
  if (!value.trim()) return 'Add the website link people should open.'
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? '' : 'Use a link that starts with https://.'
  } catch {
    return 'Enter a complete link, such as https://example.com.'
  }
}

export function CampaignWizard({ templateId = '', startReview = false }: { templateId?: string; startReview?: boolean }) {
  const router = useRouter()
  const toast = useToast()
  const [draft, setDraft] = useState<CampaignDraft>(createEmptyCampaignDraft)
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [review, setReview] = useState(startReview)
  const [confirming, setConfirming] = useState(false)
  const [published, setPublished] = useState(false)
  const [editing, setEditing] = useState<ReviewField | null>(null)
  const [imageError, setImageError] = useState('')
  const [saveMessage, setSaveMessage] = useState('Saving…')
  const currentDraft = useRef<CampaignDraft>(draft)
  const focusedDraft = useRef<CampaignDraft>(draft)
  const fileInput = useRef<HTMLInputElement>(null)
  const imageUploadButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const template = campaignTemplates.find((item) => item.id === templateId)
        const stored = window.localStorage.getItem(campaignDraftStorageKey)
        const value: unknown = stored ? JSON.parse(stored) : null
        const savedDraft = isValidDraft(value)
          ? { ...value, dailyBudget: value.dailyBudget || 500 }
          : { ...createEmptyCampaignDraft(), dailyBudget: 500 }
        const initial = template?.draft ?? savedDraft
        setDraft(initial)
        currentDraft.current = initial
      } catch (error) {
        console.error('Unable to load campaign draft', error)
        toast({ title: 'Could not load the saved draft', description: 'A new draft is ready; check browser storage if this continues.', variant: 'error' })
      } finally {
        setReady(true)
      }
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [templateId, toast])

  useEffect(() => {
    if (!ready || published) return
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(campaignDraftStorageKey, JSON.stringify(draft))
        setSaveMessage('Draft saved')
      } catch (error) {
        console.error('Unable to save campaign draft', error)
        setSaveMessage('Could not save')
        toast({ title: 'Draft could not be saved', description: 'Browser storage may be full or unavailable.', variant: 'error' })
      }
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [draft, published, ready, toast])

  useEffect(() => {
    if (!confirming) return
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setConfirming(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [confirming])

  const offerUndo = useCallback((snapshot: CampaignDraft) => {
    toast({
      title: 'Change saved',
      description: 'You can undo this change.',
      action: {
        label: 'Undo',
        onClick: () => {
          currentDraft.current = snapshot
          setDraft(snapshot)
        },
      },
    })
  }, [toast])

  const updateDraft = useCallback((update: (current: CampaignDraft) => CampaignDraft, undoable = false) => {
    const oldDraft = currentDraft.current
    const nextDraft = update(oldDraft)
    currentDraft.current = nextDraft
    setDraft(nextDraft)
    if (undoable) offerUndo(oldDraft)
  }, [offerUndo])

  const beginFieldEdit = () => {
    focusedDraft.current = currentDraft.current
  }

  const finishFieldEdit = () => {
    if (focusedDraft.current !== currentDraft.current) offerUndo(focusedDraft.current)
  }

  const setField = useCallback(<K extends keyof CampaignDraft>(field: K, value: CampaignDraft[K], undoable = false) => {
    updateDraft((current) => ({ ...current, [field]: value }), undoable)
  }, [updateDraft])

  useEffect(() => {
    if (!ready || published) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && review && !confirming) {
        setReview(false)
        setEditing(null)
      }
      if (event.key === 'Enter' && !event.shiftKey && !review && !confirming) {
        const target = event.target as HTMLElement
        if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.tagName === 'SELECT') return
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'range') return
        if (step < 3) setStep((current) => Math.min(current + 1, 3))
        else setReview(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [confirming, ready, review, step, published])

  const missingGoal = !draft.objective
  const missingLocation = !draft.location.label && draft.pinCodes.length === 0
  const headlineError = draft.headline.trim().length === 0
    ? 'Add a short headline for your ad.'
    : draft.headline.length > 40
      ? 'Shorten the headline to 40 characters or fewer.'
      : ''
  const adTextError = draft.text.trim().length === 0 ? 'Add a short message to your ad.' : ''
  const landingError = urlError(draft.url)
  const readiness = [
    { key: 'image' as const, label: 'Image added', ready: Boolean(draft.imageDataUrl), warning: true, step: 3 },
    { key: 'headline' as const, label: 'Headline is under 40 characters', ready: Boolean(draft.headline.trim()) && draft.headline.length <= 40, warning: false, step: 3 },
    { key: 'url' as const, label: 'Website link is valid', ready: !landingError, warning: false, step: 3 },
    { key: 'location' as const, label: 'Location is set', ready: !missingLocation, warning: false, step: 1 },
  ]
  const canPublish = !missingGoal && !missingLocation && !headlineError && !adTextError && !landingError
  const totalBudget = draft.duration === 'ongoing' ? null : draft.dailyBudget * draft.duration

  function chooseGoal(goal: string) {
    setField('objective', goal, true)
    window.setTimeout(() => setStep(1), 400)
  }

  function toggleInterest(value: string) {
    const selected = draft.interests
    if (!selected.includes(value) && selected.length >= 6) {
      toast({ title: 'Choose up to 6 interests', description: 'Remove an interest before adding another.' })
      return
    }
    setField('interests', selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value], true)
  }

  function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Choose an image smaller than 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
    const imageDataUrl = reader.result
    if (typeof imageDataUrl === 'string') {
      updateDraft((current) => ({ ...current, imageName: file.name, imageDataUrl }))
      setImageError('')
    }
    }
    reader.onerror = () => setImageError('This image could not be read. Choose another file.')
    reader.readAsDataURL(file)
  }

  function saveDraftNow() {
    try {
      window.localStorage.setItem(campaignDraftStorageKey, JSON.stringify(draft))
      setSaveMessage('Draft saved')
      toast({ title: 'Draft saved', description: 'You can continue where you left off.' })
    } catch (error) {
      console.error('Unable to save campaign draft', error)
      toast({ title: 'Draft could not be saved', description: 'Browser storage may be full or unavailable.', variant: 'error' })
    }
  }

  function focusReadiness(key: string) {
    if (key === 'image') {
      setReview(false)
      setStep(3)
      setEditing(null)
      window.setTimeout(() => imageUploadButton.current?.focus(), 0)
      return
    }
    const fields: Record<string, ReviewField> = { headline: 'headline', url: 'url', location: 'location' }
    setStep(key === 'location' ? 1 : 3)
    setReview(false)
    setEditing(fields[key] ?? null)
    window.setTimeout(() => document.getElementById(key === 'location' ? 'city-search' : key)?.focus(), 0)
  }

  function reviewFieldValue(field: ReviewField) {
    switch (field) {
      case 'objective': return draft.objective || 'Choose a goal'
      case 'location': return draft.location.label || 'Choose a location'
      case 'age': return `${draft.ageMin}–${draft.ageMax} years`
      case 'gender': return draft.gender
      case 'interests': return draft.interests.join(', ') || 'No interests selected'
      case 'budget': return `₹${draft.dailyBudget.toLocaleString('en-IN')} per day`
      case 'duration': return draft.duration === 'ongoing' ? 'Keep running' : `${draft.duration} days`
      case 'headline': return draft.headline || 'Add a headline'
      case 'text': return draft.text || 'Add ad text'
      case 'cta': return draft.cta
      case 'url': return draft.url || 'Add a website link'
    }
  }

  function updateReviewField(field: ReviewField, value: string) {
    switch (field) {
      case 'objective': setField('objective', value); break
      case 'location': setField('location', { ...draft.location, label: value }); break
      case 'age': {
        const [min, max] = value.split('-').map(Number)
        if (Number.isFinite(min) && Number.isFinite(max)) updateDraft((current) => ({ ...current, ageMin: min, ageMax: max }))
        break
      }
      case 'gender': setField('gender', value); break
      case 'interests': setField('interests', value.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 6)); break
      case 'budget': setField('dailyBudget', Number(value.replace(/[^\d]/g, '')) || 0); break
      case 'duration': setField('duration', value.toLowerCase().includes('ongoing') ? 'ongoing' : Number(value.replace(/[^\d]/g, '')) || 0); break
      case 'headline': setField('headline', value); break
      case 'text': setField('text', value); break
      case 'cta': setField('cta', value); break
      case 'url': setField('url', value); break
    }
  }

  if (!ready) return <main className="mx-auto max-w-3xl px-4 py-10"><div className="h-48 animate-pulse rounded-xl bg-slate-100" /></main>

  if (published) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700"><Check className="h-7 w-7" aria-hidden="true" /></span>
        <p className="mt-5 text-sm font-semibold text-green-700">Campaign submitted</p>
        <h1 className="mt-2 text-3xl font-bold text-navy-900">Your campaign is ready for review</h1>
        <p className="mt-3 text-slate-600">This demo does not deliver ads. You can view the campaign list or create another draft.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/campaigns" className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">View campaigns</Link>
          <button type="button" onClick={() => {
            try { window.localStorage.removeItem(campaignDraftStorageKey) } catch (error) { console.error('Unable to clear campaign draft', error) }
            router.push('/campaigns/new')
          }} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Create another</button>
        </div>
      </main>
    )
  }

  const updateStep = (nextStep: number) => {
    setReview(false)
    setStep(Math.max(0, Math.min(3, nextStep)))
    setEditing(null)
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/campaigns/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Exit setup</Link>
        <div className="flex items-center gap-3">
          <Link href="/campaigns/new/ai" onClick={saveDraftNow} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Switch to AI</Link>
          <p className={`text-xs ${saveMessage === 'Could not save' ? 'text-red-700' : 'text-slate-500'}`} role="status">{saveMessage}</p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-navy-900">{review ? 'Review your campaign' : `Step ${step + 1} of 4`}</p>
            <p className="mt-1 text-xs text-slate-500">{review ? 'Check each detail before you publish.' : step === 0 ? 'About 2 minutes left' : step < 3 ? 'About 1 minute left' : 'Less than 1 minute left'}</p>
          </div>
          <div className="flex gap-1.5" aria-label={`${review ? 4 : step + 1} of 4 steps complete`}>
            {goals.map((goal, index) => <span key={goal.title} className={`h-1.5 w-8 rounded-full sm:w-12 ${index <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />)}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${review ? 100 : ((step + 1) / 4) * 100}%` }} />
        </div>
      </section>

      {!review ? (
        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            {step === 0 && (
              <>
                <h1 className="text-2xl font-bold text-navy-900">What is your main goal?</h1>
                <p className="mt-2 text-sm text-slate-600">Choose one. You can change this later.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {goals.map((goal) => (
                    <button key={goal.title} type="button" onClick={() => chooseGoal(goal.title)} className={`min-h-28 rounded-xl border p-4 text-left transition hover:border-brand-500 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${draft.objective === goal.title ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}>
                      <span className="block font-semibold text-navy-900">{goal.title}</span>
                      <span className="mt-1 block text-sm text-slate-600">{goal.hint}</span>
                      <span className="mt-2 block text-xs text-slate-500">Recommended · continue in 1 tap</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-navy-900">Where and who?</h1>
                <p className="mt-2 text-sm text-slate-600">Choose a place and a broad audience. You can refine this anytime.</p>
                <div className="mt-5 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-navy-900">Location</label>
                    <p className="mb-3 text-xs text-slate-500">Search for a city or place a pin on the map.</p>
                    <MapPicker
                      location={draft.location}
                      onChange={(location) => updateDraft((current) => ({ ...current, location }))}
                      pinCodes={draft.pinCodes}
                      onPinCodesChange={(pinCodes) => setField('pinCodes', pinCodes)}
                    />
                    {missingLocation && <p className="mt-2 text-sm text-amber-700">Choose a location or add PIN codes to continue.</p>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">Age range: {draft.ageMin}–{draft.ageMax}</p>
                    <p className="mt-1 text-xs text-slate-500">Choose the age range most relevant to your campaign.</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <label className="text-xs text-slate-600">From {draft.ageMin}
                        <input aria-label="Minimum age" type="range" min="18" max={Math.max(18, draft.ageMax - 1)} value={draft.ageMin} onChange={(event) => setField('ageMin', Number(event.target.value))} className="mt-2 w-full accent-brand-600" />
                      </label>
                      <label className="text-xs text-slate-600">To {draft.ageMax}
                        <input aria-label="Maximum age" type="range" min={Math.min(65, draft.ageMin + 1)} max="65" value={draft.ageMax} onChange={(event) => setField('ageMax', Number(event.target.value))} className="mt-2 w-full accent-brand-600" />
                      </label>
                    </div>
                  </div>
                  <fieldset>
                    <legend className="text-sm font-semibold text-navy-900">Who should see it?</legend>
                    <p className="mt-1 text-xs text-slate-500">Everyone is a broad, recommended starting point.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['Everyone', 'Women', 'Men'].map((gender) => <button key={gender} type="button" aria-pressed={draft.gender === gender} onClick={() => setField('gender', gender, true)} className={`min-h-10 rounded-full border px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${draft.gender === gender ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-700'}`}>{gender}{gender === 'Everyone' ? ' · Recommended' : ''}</button>)}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="text-sm font-semibold text-navy-900">Interests <span className="font-normal text-slate-500">(optional, up to 6)</span></legend>
                    <p className="mt-1 text-xs text-slate-500">Pick a few things your audience may enjoy.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {interests.map((interest) => <button key={interest} type="button" aria-pressed={draft.interests.includes(interest)} onClick={() => toggleInterest(interest)} className={`min-h-10 rounded-full border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${draft.interests.includes(interest) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-700'}`}>{interest}</button>)}
                    </div>
                  </fieldset>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold text-navy-900">Choose your budget</h1>
                <p className="mt-2 text-sm text-slate-600">Set a daily limit. You can change it whenever you like.</p>
                <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-900">Daily budget</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">Recommended</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-navy-900">₹{draft.dailyBudget.toLocaleString('en-IN')}<span className="text-sm font-medium text-slate-600"> / day</span></p>
                  <input aria-label="Daily budget" type="range" min="200" max="10000" step="100" value={draft.dailyBudget} onFocus={beginFieldEdit} onPointerUp={finishFieldEdit} onKeyUp={finishFieldEdit} onChange={(event) => setField('dailyBudget', Number(event.target.value))} className="mt-4 w-full accent-brand-600" />
                  <p className="mt-1 text-xs text-slate-600">This is the most you plan to spend each day.</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2" aria-label="Common daily budgets">
                  {[200, 500, 1000].map((amount) => <button key={amount} type="button" aria-pressed={draft.dailyBudget === amount} onClick={() => setField('dailyBudget', amount, true)} className={`min-h-10 rounded-xl border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${draft.dailyBudget === amount ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-700'}`}>₹{amount.toLocaleString('en-IN')}{amount === 500 ? ' · Recommended' : ''}</button>)}
                </div>
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-navy-900">Estimated results</p>
                  <p className="mt-1 text-sm text-slate-700">About {(draft.dailyBudget * 2).toLocaleString('en-IN')}–{(draft.dailyBudget * 5).toLocaleString('en-IN')} people per day</p>
                  <p className="mt-1 text-xs text-slate-500">Illustrative mock range only, not a forecast.</p>
                </div>
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold text-navy-900">How long should it run?</legend>
                  <p className="mt-1 text-xs text-slate-500">Choose a run time or keep the campaign running.</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {durations.map((duration) => <button key={duration} type="button" aria-pressed={draft.duration === duration} onClick={() => setField('duration', duration, true)} className={`min-h-11 rounded-xl border px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${draft.duration === duration ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-700'}`}>{duration === 'ongoing' ? 'Keep running' : `${duration} days`}</button>)}
                  </div>
                </fieldset>
                <p className="mt-4 rounded-xl border border-slate-200 p-3 text-sm text-navy-900">
                  {totalBudget === null ? <>Your daily cap is <strong>₹{draft.dailyBudget.toLocaleString('en-IN')}</strong>. No end date is set.</> : <>Estimated maximum: <strong>₹{totalBudget.toLocaleString('en-IN')}</strong> over {draft.duration} days.</>}
                </p>
                <details className="mt-4 rounded-xl border border-slate-200 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-navy-900">More options <ChevronDown className="h-4 w-4" aria-hidden="true" /></summary>
                  <p className="mt-3 text-sm text-slate-600">Your daily budget is a spending limit, not a promise to spend the full amount.</p>
                </details>
              </>
            )}
            {step === 3 && (
              <>
                <h1 className="text-2xl font-bold text-navy-900">Add your ad</h1>
                <p className="mt-2 text-sm text-slate-600">Write a clear message and check the preview as you go.</p>
                <div className="mt-5 space-y-4">
                  <div>
                    <span className="block text-sm font-semibold text-navy-900">Image <span className="font-normal text-slate-500">(optional)</span></span>
                    <p className="mt-1 text-xs text-slate-500">A square image works well in most placements.</p>
                    <input ref={fileInput} id="campaign-image" type="file" accept="image/*" onChange={uploadImage} className="sr-only" />
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <button ref={imageUploadButton} type="button" onClick={() => fileInput.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><ImagePlus className="h-4 w-4" aria-hidden="true" />{draft.imageName ? 'Change image' : 'Add an image'}</button>
                      {draft.imageName && <span className="max-w-40 truncate text-sm text-slate-600">{draft.imageName}</span>}
                    </div>
                    {imageError && <p role="alert" className="mt-2 text-sm text-red-700">{imageError}</p>}
                  </div>
                  <label className="block text-sm font-semibold text-navy-900" htmlFor="headline">Headline
                    <input id="headline" value={draft.headline} maxLength={60} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => setField('headline', event.target.value)} aria-invalid={Boolean(headlineError)} aria-describedby="headline-hint headline-count" className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="A short headline" />
                    <span id="headline-hint" className="mt-1 block text-xs font-normal text-slate-500">Keep it clear and under 40 characters.</span>
                    <span id="headline-count" className={`mt-1 block text-xs font-normal ${headlineError ? 'text-amber-700' : 'text-slate-500'}`}>{draft.headline.length}/40 characters</span>
                    {headlineError && <span className="mt-1 block text-xs font-normal text-red-700">{headlineError}</span>}
                  </label>
                  <label className="block text-sm font-semibold text-navy-900" htmlFor="ad-text">Ad text
                    <textarea id="ad-text" value={draft.text} maxLength={200} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => setField('text', event.target.value)} aria-invalid={Boolean(adTextError)} aria-describedby="text-hint text-count" className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="What should people know?" />
                    <span id="text-hint" className="mt-1 block text-xs font-normal text-slate-500">One helpful sentence is a good place to start.</span>
                    <span id="text-count" className={`mt-1 block text-xs font-normal ${draft.text.length > 125 ? 'text-amber-700' : 'text-slate-500'}`}>{draft.text.length}/125 characters</span>
                    {adTextError && <span className="mt-1 block text-xs font-normal text-red-700">{adTextError}</span>}
                  </label>
                  <label className="block text-sm font-semibold text-navy-900" htmlFor="cta">Button text
                    <select id="cta" value={draft.cta} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => setField('cta', event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      {['Learn more', 'Shop now', 'Sign up', 'Contact us', 'Get offer'].map((cta) => <option key={cta}>{cta}</option>)}
                    </select>
                    <span className="mt-1 block text-xs font-normal text-slate-500">Choose the action that best fits your goal.</span>
                  </label>
                  <label className="block text-sm font-semibold text-navy-900" htmlFor="website-url">Website link
                    <input id="website-url" type="url" inputMode="url" value={draft.url} onFocus={beginFieldEdit} onBlur={finishFieldEdit} onChange={(event) => setField('url', event.target.value)} aria-invalid={Boolean(landingError)} aria-describedby="url-hint" className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="https://example.com" />
                    <span id="url-hint" className="mt-1 block text-xs font-normal text-slate-500">Use the page you want people to visit.</span>
                    {draft.url && landingError && <span className="mt-1 block text-xs font-normal text-red-700">{landingError}</span>}
                  </label>
                </div>
              </>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => updateStep(step - 1)} disabled={step === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</button>
              <button type="button" onClick={() => step === 3 ? setReview(true) : setStep(step + 1)} disabled={step === 0 && missingGoal} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50">{step === 3 ? 'Review campaign' : 'Continue'}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>
          {step === 3 && <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><AdPreview draft={draft} /></aside>}
        </section>
      ) : (
        <section className="mt-5 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-navy-900">Review your campaign</h1>
                <p className="mt-2 text-sm text-slate-600">Select any value to edit it right here.</p>
              </div>
              <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-navy-900">₹{draft.dailyBudget.toLocaleString('en-IN')} per day</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(['objective', 'location', 'age', 'gender', 'interests', 'budget', 'duration', 'headline', 'text', 'cta', 'url'] as ReviewField[]).map((field) => (
                <div key={field} className="min-w-0 rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-medium capitalize text-slate-500">{field === 'cta' ? 'Button text' : field === 'url' ? 'Website link' : field === 'text' ? 'Ad text' : field}</p>
                  {editing === field ? (
                    <div className="mt-1 flex gap-2">
                      {field === 'text'
                        ? <textarea autoFocus value={draft.text} onChange={(event) => updateReviewField(field, event.target.value)} className="min-h-20 w-full rounded-lg border border-slate-300 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
                        : <input autoFocus aria-label={`Edit ${field}`} value={field === 'age' ? `${draft.ageMin}-${draft.ageMax}` : field === 'interests' ? draft.interests.join(', ') : field === 'budget' ? String(draft.dailyBudget) : field === 'duration' ? (draft.duration === 'ongoing' ? 'ongoing' : String(draft.duration)) : field === 'location' ? draft.location.label : field === 'objective' ? draft.objective : field === 'gender' ? draft.gender : field === 'headline' ? draft.headline : field === 'cta' ? draft.cta : draft.url} onChange={(event) => updateReviewField(field, event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />}
                      <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Done</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setEditing(field)} className="mt-1 block max-w-full break-words text-left text-sm font-medium text-navy-900 underline decoration-dotted underline-offset-4 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{reviewFieldValue(field)}</button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              {totalBudget === null ? `Daily cap: ₹${draft.dailyBudget.toLocaleString('en-IN')} · no end date` : `Total budget: ₹${totalBudget.toLocaleString('en-IN')} (${draft.duration} days)`}. Estimated results are a mock range, not a forecast.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-navy-900">Ad readiness</h2>
            <p className="mt-1 text-sm text-slate-600">Warnings are optional. Fix any errors before publishing.</p>
            <ul className="mt-4 space-y-3">
              {readiness.map((item) => (
                <li key={item.key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                  <span className="flex items-center gap-2 text-sm text-navy-900">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.ready ? 'bg-green-600' : item.warning ? 'bg-amber-500' : 'bg-red-600'}`} aria-hidden="true" />
                    {item.label}{!item.ready && item.warning ? ' · optional' : ''}
                  </span>
                  {!item.ready && <button type="button" onClick={() => focusReadiness(item.key)} className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Fix</button>}
                </li>
              ))}
            </ul>
            {!canPublish && <p role="alert" className="mt-3 text-sm text-red-700">Fix the required items above before publishing. The image reminder is optional.</p>}
            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => { setReview(false); setStep(3) }} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Back to ad</button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={saveDraftNow} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Save draft</button>
                <button type="button" onClick={() => setConfirming(true)} disabled={!canPublish} className="min-h-11 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50">Publish campaign</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {confirming && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirming(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
            <h2 id="confirm-title" className="text-xl font-bold text-navy-900">Publish this campaign?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">This will submit your campaign for review in the demo. No ad will be delivered and no payment will be taken.</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button autoFocus type="button" onClick={() => setConfirming(false)} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Keep editing</button>
              <button type="button" onClick={() => { setConfirming(false); setPublished(true) }} className="min-h-11 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Confirm publish</button>
            </div>
          </section>
        </div>
      )}
      {!review && (
        <div className="mt-4 text-center">
          <button type="button" onClick={saveDraftNow} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-medium text-slate-500 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Save draft now <ChevronDown className="h-3 w-3" aria-hidden="true" /></button>
        </div>
      )}
    </main>
  )
}
