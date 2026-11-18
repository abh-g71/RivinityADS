'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react'
import { MapPicker } from '@/features/advertiser/MapPicker'
import { AdPreview } from '@/features/advertiser/AdPreview'
import { campaignDraftStorageKey, campaignTemplates } from '@/features/advertiser/campaignTemplates'
import { useToast } from '@/components/shared/Toast'
import { createEmptyCampaignDraft, createObjectiveDetails, migrateCampaignDraft, type CampaignDraft } from '@/types/campaign'
import { campaignObjectives, getObjectiveReadiness, isCampaignObjective } from '@/features/advertiser/campaignObjectives'
import { ObjectiveAdStep } from '@/features/advertiser/ObjectiveAdStep'

const countryOptions = ['India', 'United States', 'United Kingdom', 'UAE', 'Canada', 'Australia', 'Germany', 'Singapore', 'France', 'Japan', 'Brazil', 'Saudi Arabia', 'South Africa', 'Indonesia', 'Thailand', 'Netherlands', 'Spain', 'Italy']
const locationModes = [
  { value: 'country', label: 'Whole country' },
  { value: 'region', label: 'States / regions' },
  { value: 'city', label: 'Cities' },
  { value: 'radius', label: 'Around a point' },
] as const
const interests = ['Shopping', 'Food & dining', 'Travel', 'Technology', 'Fitness', 'Events', 'Beauty', 'Education']
const durations: (number | 'ongoing')[] = [7, 14, 30, 'ongoing']

type ReviewField = 'objective' | 'location' | 'age' | 'gender' | 'interests' | 'budget' | 'duration' | 'headline' | 'text' | 'cta' | 'url'

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
  const [pendingObjective, setPendingObjective] = useState<CampaignDraft['objective']>( '')
  const [published, setPublished] = useState(false)
  const [editing, setEditing] = useState<ReviewField | null>(null)
  const [imageError, setImageError] = useState('')
  const [saveMessage, setSaveMessage] = useState('Saving…')
  const currentDraft = useRef<CampaignDraft>(draft)
  const focusedDraft = useRef<CampaignDraft>(draft)
  const imageUploadButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const template = campaignTemplates.find((item) => item.id === templateId)
        const stored = window.localStorage.getItem(campaignDraftStorageKey)
        const value: unknown = stored ? JSON.parse(stored) : null
        const migrated = migrateCampaignDraft(value)
        const savedDraft = { ...migrated, dailyBudget: migrated.dailyBudget || 500 }
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
  const locationCountries = draft.location.countries ?? []
  const locationRegions = draft.location.regions ?? []
  const locationCities = draft.location.cities ?? []
  const locationPinCodes = draft.location.pinCodes ?? []
  const locationSummary = draft.location.label || locationCountries.join(', ') || locationRegions.join(', ') || locationCities.join(', ') || (draft.location.pin ? 'Pinned area' : 'No location selected')
  const missingLocation = locationCountries.length === 0 && locationRegions.length === 0 && locationCities.length === 0 && locationPinCodes.length === 0 && !draft.location.pin && !draft.location.label
  const headlineError = draft.headline.trim().length === 0
    ? 'Add a short headline for your ad.'
    : draft.headline.length > 40
      ? 'Shorten the headline to 40 characters or fewer.'
      : ''
  const adTextError = draft.text.trim().length === 0 ? 'Add a short message to your ad.' : ''
  const landingError = urlError(draft.url)
  const readiness = getObjectiveReadiness(draft)
  const canPublish = Boolean(draft.objective) && readiness.filter((item) => !item.warning).every((item) => item.ready)
  const totalBudget = draft.duration === 'ongoing' ? null : draft.dailyBudget * draft.duration

  function chooseGoal(goal: string) {
    if (!isCampaignObjective(goal)) return
    const currentDetails = draft.objectiveDetails
    const defaults = createObjectiveDetails(currentDetails.objective)
    const hasObjectiveData = JSON.stringify(currentDetails) !== JSON.stringify(defaults) || Boolean(draft.url.trim())
    if (draft.objective && draft.objective !== goal && hasObjectiveData) {
      setPendingObjective(goal)
      return
    }
    applyObjective(goal)
  }

  function applyObjective(goal: CampaignDraft['objective']) {
    if (!isCampaignObjective(goal)) return
    const details = createObjectiveDetails(goal)
    updateDraft((current) => ({ ...current, objective: goal, objectiveDetails: details, cta: details.buttonText, url: '' }), true)
    setPendingObjective('')
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
    const acceptsVideo = draft.objective === 'Build awareness' && file.type.startsWith('video/')
    if (!file.type.startsWith('image/') && !acceptsVideo) {
      setImageError(draft.objective === 'Build awareness' ? 'Choose an image or video file.' : 'Choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Choose an image smaller than 5 MB.')
      return
    }
    if (acceptsVideo) {
      updateDraft((current) => ({ ...current, imageName: file.name, imageDataUrl: '', objectiveDetails: current.objectiveDetails.objective === 'Build awareness' ? { ...current.objectiveDetails, mediaKind: 'video' } : current.objectiveDetails }))
      setImageError('')
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

  function setLocationMode(mode: CampaignDraft['location']['mode']) {
    const countries = draft.location.countries ?? []
    const regions = draft.location.regions ?? []
    const cities = draft.location.cities ?? []
    setField('location', {
      ...draft.location,
      mode,
      label: mode === 'country' ? (countries[0] ? `${countries[0]} (whole country)` : 'India (whole country)') : mode === 'region' ? (regions[0] ? `${regions[0]} region` : 'Region selected') : mode === 'city' ? (cities[0] ? cities[0] : 'City selected') : (draft.location.pin ? 'Pinned area' : 'Area around a point'),
    })
  }

  function focusReadiness(key: string) {
    if (key === 'image') {
      setReview(false)
      setStep(3)
      setEditing(null)
      window.setTimeout(() => imageUploadButton.current?.focus(), 0)
      return
    }
    const fields: Record<string, ReviewField> = { headline: 'headline', url: 'url', website: 'url', location: 'location' }
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
      case 'objective': if (isCampaignObjective(value)) applyObjective(value); break
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

  if (!ready) return <main className="mx-auto max-w-3xl px-4 py-10"><div className="h-48 rounded-lg border border-slate-200 bg-slate-100" /></main>

  if (published) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700"><Check className="h-7 w-7" aria-hidden="true" /></span>
        <p className="mt-5 text-sm font-semibold text-green-700">Campaign submitted</p>
        <h1 className="mt-2 text-3xl font-bold text-navy-900">Your campaign is ready for review</h1>
        <p className="mt-3 text-slate-600">This demo does not deliver ads. You can view the campaign list or create another draft.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/campaigns" className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">View campaigns</Link>
          <button type="button" onClick={() => {
            try { window.localStorage.removeItem(campaignDraftStorageKey) } catch (error) { console.error('Unable to clear campaign draft', error) }
            router.push('/campaigns/new')
          }} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Create another</button>
        </div>
      </main>
    )
  }

  const updateStep = (nextStep: number) => {
    setReview(false)
    setStep(Math.max(0, Math.min(3, nextStep)))
    setEditing(null)
  }

  const advanceStep = () => {
    if (step === 0 && !draft.objective) {
      toast({ title: 'Pick a goal for your campaign' })
      return
    }
    if (step === 1 && missingLocation) {
      toast({ title: 'Pick where your ad should show' })
      setEditing('location')
      const input = document.getElementById('country-picker') as HTMLInputElement | null
      input?.focus()
      return
    }
    if (step === 3) {
      setReview(true)
      return
    }
    setStep(step + 1)
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:min-h-[calc(100vh-9rem)] lg:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/campaigns/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Exit setup</Link>
        <div className="flex items-center gap-3">
          <Link href="/campaigns/new/ai" onClick={saveDraftNow} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Switch to AI</Link>
          <p className={`text-xs ${saveMessage === 'Could not save' ? 'text-red-700' : 'text-slate-500'}`} role="status">{saveMessage}</p>
        </div>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-navy-900">{review ? 'Review your campaign' : `Step ${step + 1} of 5`}</p>
            <p className="mt-1 text-xs text-slate-500">{review ? 'Check each detail before you publish.' : step === 0 ? 'About 2 minutes left' : step < 3 ? 'About 1 minute left' : 'Less than 1 minute left'}</p>
          </div>
          <div className="flex gap-1.5" aria-label={`${review ? 5 : step + 1} of 5 steps complete`}>
            {campaignObjectives.map((goal, index) => <span key={goal.title} className={`h-1.5 w-8 rounded-full sm:w-12 ${index <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />)}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${review ? 100 : ((step + 1) / 5) * 100}%` }} />
        </div>
      </section>

      {!review ? (
        <section className={`mt-4 lg:min-h-0 ${step === 1 ? 'grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-stretch' : step === 3 ? 'grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:items-stretch' : 'grid gap-5'}`}>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:min-h-0 lg:overflow-hidden">
            {step === 0 && (
              <>
                <h1 className="text-2xl font-bold text-navy-900">What is your main goal?</h1>
                <p className="mt-2 text-sm text-slate-600">Choose one. You can change this later.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {campaignObjectives.map((goal) => (
                    <button key={goal.title} type="button" onClick={() => chooseGoal(goal.title)} className={`min-h-28 rounded-lg border p-4 text-left transition hover:border-brand-500 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${draft.objective === goal.title ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}>
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
                <p className="mt-2 text-sm text-slate-600">{campaignObjectives.find((item) => item.title === draft.objective)?.locationHint ?? 'Choose a place and a broad audience. You can refine this anytime.'}</p>
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                      {locationModes.map((mode) => (
                        <button key={mode.value} type="button" onClick={() => setLocationMode(mode.value)} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${draft.location.mode === mode.value ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
                          {mode.label}
                        </button>
                      ))}
                    </div>
                    <label className="mb-2 block text-sm font-semibold text-navy-900">Location</label>
                    <p className="mb-3 text-xs text-slate-500">Use the map to set your target area.</p>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {locationSummary}
                    </div>
                    {draft.location.mode === 'country' && (
                      <div className="mt-3 space-y-3">
                        <input id="country-picker" value={draft.location.countries?.[0] ?? ''} onChange={(event) => setField('location', { ...draft.location, mode: 'country', countries: event.target.value ? [event.target.value] : [], label: event.target.value ? `${event.target.value} (whole country)` : '' })} list="country-list" placeholder="Search a country" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
                        <datalist id="country-list">
                          {countryOptions.map((country) => <option key={country} value={country} />)}
                        </datalist>
                        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={Boolean(draft.location.excludeCountries)} onChange={(event) => setField('location', { ...draft.location, excludeCountries: event.target.checked })} /> Exclude these countries</label>
                      </div>
                    )}
                    {draft.location.mode === 'region' && (
                      <div className="mt-3 space-y-3">
                        <input value={draft.location.regions?.[0] ?? ''} onChange={(event) => setField('location', { ...draft.location, mode: 'region', regions: event.target.value ? [event.target.value] : [], label: event.target.value ? `${event.target.value} region` : '' })} placeholder="Search state or region" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
                      </div>
                    )}
                    {draft.location.mode === 'city' && (
                      <div className="mt-3 space-y-3">
                        <input value={draft.location.cities?.[0] ?? ''} onChange={(event) => setField('location', { ...draft.location, mode: 'city', cities: event.target.value ? [event.target.value] : [], label: event.target.value ? event.target.value : '' })} placeholder="Search a city" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
                      </div>
                    )}
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
                <h1 className="text-2xl font-bold text-navy-900">{campaignObjectives.find((item) => item.title === draft.objective)?.budgetTitle ?? 'Choose your budget'}</h1>
                <p className="mt-2 text-sm text-slate-600">Set a daily limit. You can change it whenever you like.</p>
                <div className="mt-5 rounded-lg border border-brand-200 bg-brand-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-900">Daily budget</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">Recommended</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-navy-900">₹{draft.dailyBudget.toLocaleString('en-IN')}<span className="text-sm font-medium text-slate-600"> / day</span></p>
                  <input aria-label="Daily budget" type="range" min="200" max="10000" step="100" value={draft.dailyBudget} onFocus={beginFieldEdit} onPointerUp={finishFieldEdit} onKeyUp={finishFieldEdit} onChange={(event) => setField('dailyBudget', Number(event.target.value))} className="mt-4 w-full accent-brand-600" />
                  <p className="mt-1 text-xs text-slate-600">This is the most you plan to spend each day.</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2" aria-label="Common daily budgets">
                  {[200, 500, 1000].map((amount) => <button key={amount} type="button" aria-pressed={draft.dailyBudget === amount} onClick={() => setField('dailyBudget', amount, true)} className={`min-h-10 rounded-lg border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${draft.dailyBudget === amount ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-700'}`}>₹{amount.toLocaleString('en-IN')}{amount === 500 ? ' · Recommended' : ''}</button>)}
                </div>
                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-navy-900">{campaignObjectives.find((item) => item.title === draft.objective)?.estimateLabels[0] ?? 'Estimated results'}</p>
                  <p className="mt-1 text-sm text-slate-700">{draft.objective === 'Get leads' ? `${Math.max(1, Math.round(draft.dailyBudget / 250))}–${Math.max(2, Math.round(draft.dailyBudget / 100))} leads · Cost per lead ₹${Math.max(50, Math.round(draft.dailyBudget / 5))}` : draft.objective === 'Get sales' ? `${Math.max(1, Math.round(draft.dailyBudget / 500))}–${Math.max(2, Math.round(draft.dailyBudget / 200))} sales · Return on ad spend 1.8×` : draft.objective === 'Build awareness' ? `${(draft.dailyBudget * 20).toLocaleString('en-IN')}–${(draft.dailyBudget * 45).toLocaleString('en-IN')} people · ${draft.objectiveDetails.objective === 'Build awareness' ? draft.objectiveDetails.frequency : 3} times each` : `${(draft.dailyBudget * 2).toLocaleString('en-IN')}–${(draft.dailyBudget * 5).toLocaleString('en-IN')} visits`}</p>
                  <p className="mt-1 text-xs text-slate-500">Estimated, sample data</p>
                </div>
                {draft.objective === 'Build awareness' && draft.objectiveDetails.objective === 'Build awareness' && <label className="mt-4 block text-sm font-medium text-navy-900">Average frequency: {draft.objectiveDetails.frequency}<input aria-label="Average frequency" type="range" min="1" max="8" value={draft.objectiveDetails.frequency} onChange={(event) => updateDraft((current) => current.objectiveDetails.objective === 'Build awareness' ? { ...current, objectiveDetails: { ...current.objectiveDetails, frequency: Number(event.target.value) } } : current)} className="mt-2 w-full accent-brand-600" /></label>}
                {draft.objective === 'Get sales' && <p className="mt-4 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">Conversion tracking: Mock status · ready to configure</p>}
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold text-navy-900">How long should it run?</legend>
                  <p className="mt-1 text-xs text-slate-500">Choose a run time or keep the campaign running.</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {durations.map((duration) => <button key={duration} type="button" aria-pressed={draft.duration === duration} onClick={() => setField('duration', duration, true)} className={`min-h-11 rounded-lg border px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${draft.duration === duration ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-700'}`}>{duration === 'ongoing' ? 'Keep running' : `${duration} days`}</button>)}
                  </div>
                </fieldset>
                <p className="mt-4 rounded-lg border border-slate-200 p-3 text-sm text-navy-900">
                  {totalBudget === null ? <>Your daily cap is <strong>₹{draft.dailyBudget.toLocaleString('en-IN')}</strong>. No end date is set.</> : <>Estimated maximum: <strong>₹{totalBudget.toLocaleString('en-IN')}</strong> over {draft.duration} days.</>}
                </p>
                <details className="mt-4 rounded-lg border border-slate-200 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-navy-900">More options <ChevronDown className="h-4 w-4" aria-hidden="true" /></summary>
                  <p className="mt-3 text-sm text-slate-600">Your daily budget is a spending limit, not a promise to spend the full amount.</p>
                </details>
              </>
            )}
            <div className="sticky bottom-0 z-10 mt-6 -mx-4 border-t border-slate-200 bg-white px-4 pb-4 pt-4 sm:-mx-5 sm:px-5">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => updateStep(step - 1)} disabled={step === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</button>
                <button type="button" onClick={advanceStep} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{step === 3 ? 'Review campaign' : 'Continue'}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          </div>
          {step === 3 && <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:overflow-hidden"><AdPreview draft={draft} /></aside>}
          {step === 1 && (
            <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:min-h-0 lg:overflow-hidden">
              <div className="flex h-full flex-col gap-3">
                <div>
                  <h2 className="text-base font-semibold text-navy-900">Map preview</h2>
                  <p className="mt-1 text-xs text-slate-500">Your audience radius updates in real time.</p>
                </div>
                <div className="lg:flex-1">
                  <MapPicker
                    location={draft.location}
                    onChange={(location) => updateDraft((current) => ({ ...current, location }))}
                    pinCodes={draft.pinCodes}
                    onPinCodesChange={(pinCodes) => setField('pinCodes', pinCodes)}
                  />
                </div>
              </div>
            </aside>
          )}
        </section>
      ) : (
        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:min-h-0">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-navy-900">Review your campaign</h1>
                <p className="mt-2 text-sm text-slate-600">Select any value to edit it right here.</p>
              </div>
              <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-navy-900">₹{draft.dailyBudget.toLocaleString('en-IN')} per day</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(['objective', 'location', 'age', 'gender', 'interests', 'budget', 'duration', 'headline', 'text', 'cta', 'url'] as ReviewField[]).map((field) => (
                <div key={field} className="min-w-0 rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-medium capitalize text-slate-500">{field === 'cta' ? 'Button text' : field === 'url' ? 'Website link' : field === 'text' ? 'Ad text' : field}</p>
                  {editing === field ? (
                    <div className="mt-1 flex gap-2">
                      {field === 'text'
                        ? <textarea autoFocus value={draft.text} onChange={(event) => updateReviewField(field, event.target.value)} className="min-h-20 w-full rounded-lg border border-slate-300 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
                        : <input autoFocus aria-label={`Edit ${field}`} value={field === 'age' ? `${draft.ageMin}-${draft.ageMax}` : field === 'interests' ? draft.interests.join(', ') : field === 'budget' ? String(draft.dailyBudget) : field === 'duration' ? (draft.duration === 'ongoing' ? 'ongoing' : String(draft.duration)) : field === 'location' ? draft.location.label : field === 'objective' ? draft.objective : field === 'gender' ? draft.gender : field === 'headline' ? draft.headline : field === 'cta' ? draft.cta : draft.url} onChange={(event) => updateReviewField(field, event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />}
                      <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Done</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setEditing(field)} className="mt-1 block max-w-full break-words text-left text-sm font-medium text-navy-900 underline decoration-dotted underline-offset-4 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{reviewFieldValue(field) ?? ''}</button>
                  )}
                </div>
              ))}
            </div>
            {draft.objectiveDetails.objective === 'Get leads' && <section className="mt-4 rounded-lg border border-slate-200 p-4"><h2 className="text-sm font-semibold text-navy-900">Lead form: {draft.objectiveDetails.leadForm.name || 'Unnamed form'}</h2><p className="mt-2 text-sm text-slate-600">Fields: {draft.objectiveDetails.leadForm.fields.filter((field) => field.enabled).map((field) => `${field.label}${field.required ? ' (required)' : ''}`).join(', ') || 'No fields selected'}</p><p className="mt-1 break-all text-xs text-slate-500">Privacy policy: {draft.objectiveDetails.leadForm.privacyPolicyUrl || 'Not set'}</p></section>}
            {draft.objectiveDetails.objective === 'Get sales' && <section className="mt-4 rounded-lg border border-slate-200 p-4"><h2 className="text-sm font-semibold text-navy-900">Product details</h2><p className="mt-2 text-sm text-slate-600">{draft.objectiveDetails.productName || 'Product name'} · ₹{draft.objectiveDetails.offerPrice || draft.objectiveDetails.price || '0'}{draft.objectiveDetails.offerPrice ? ` (regular ₹${draft.objectiveDetails.price})` : ''}</p></section>}
            {draft.objectiveDetails.objective === 'Build awareness' && <section className="mt-4 rounded-lg border border-slate-200 p-4"><h2 className="text-sm font-semibold text-navy-900">Brand details</h2><p className="mt-2 text-sm text-slate-600">{draft.objectiveDetails.brandName || 'Brand name'} · {draft.objectiveDetails.tagline || 'Tagline'} · Frequency {draft.objectiveDetails.frequency}</p></section>}
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {totalBudget === null ? `Daily cap: ₹${draft.dailyBudget.toLocaleString('en-IN')} · no end date` : `Total budget: ₹${totalBudget.toLocaleString('en-IN')} (${draft.duration} days)`}. Estimated results are a mock range, not a forecast.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:overflow-y-auto">
            <h2 className="text-lg font-semibold text-navy-900">Ad readiness</h2>
            <p className="mt-1 text-sm text-slate-600">Warnings are optional. Fix any errors before publishing.</p>
            <ul className="mt-4 space-y-3">
              {readiness.map((item) => (
                <li key={item.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3">
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
              <button type="button" onClick={() => { setReview(false); setStep(3) }} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Back to ad</button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={saveDraftNow} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Save draft</button>
                <button type="button" onClick={() => setConfirming(true)} disabled={!canPublish} className="min-h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50">Publish campaign</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {confirming && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirming(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-t-xl bg-white p-5 shadow-sm sm:rounded-lg sm:p-6">
            <h2 id="confirm-title" className="text-xl font-bold text-navy-900">Publish this campaign?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">This will submit your campaign for review in the demo. No ad will be delivered and no payment will be taken.</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button autoFocus type="button" onClick={() => setConfirming(false)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Keep editing</button>
              <button type="button" onClick={() => { setConfirming(false); setPublished(true) }} className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Confirm publish</button>
            </div>
          </section>
        </div>
      )}
      {pendingObjective && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-navy-950/40 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingObjective('') }}>
          <section role="dialog" aria-modal="true" aria-labelledby="objective-change-title" className="w-full max-w-md rounded-t-xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-xl">
            <h2 id="objective-change-title" className="text-lg font-semibold text-navy-900">Change campaign goal?</h2>
            <p className="mt-2 text-sm text-slate-600">This clears details entered for {draft.objective}. Your location, audience and budget will stay.</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setPendingObjective('')} className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-navy-900">Keep current goal</button>
              <button type="button" onClick={() => applyObjective(pendingObjective)} className="min-h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white">Change goal</button>
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
