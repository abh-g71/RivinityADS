'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react'
import { MapPicker } from '@/features/advertiser/MapPicker'
import { AdPreview } from '@/features/advertiser/AdPreview'
import { campaignDraftStorageKey, campaignTemplates } from '@/features/advertiser/campaignTemplates'
import { useToast } from '@/components/shared/Toast'
import { createEmptyCampaignDraft, createObjectiveDetails, migrateCampaignDraft, type CampaignDraft, type CampaignTargetLocation } from '@/types/campaign'
import { campaignObjectives, getObjectiveReadiness, isCampaignObjective } from '@/features/advertiser/campaignObjectives'
import { ObjectiveAdStep } from '@/features/advertiser/ObjectiveAdStep'
import { mockCountries } from '@/features/advertiser/locationSuggestions'

const interests = ['Shopping', 'Food', 'Travel', 'Technology', 'Events', 'Fashion', 'Health', 'Education', 'Finance', 'Sports']
const audienceEligibilityNote = 'These settings decide who sees your ad. They do not affect where people can register.'
const durations: (number | 'ongoing')[] = [7, 14, 30, 'ongoing']

type ReviewField = 'objective' | 'location' | 'age' | 'gender' | 'interests' | 'budget' | 'duration' | 'headline' | 'text' | 'cta' | 'url'

function audienceSummary(draft: CampaignDraft) {
  const firstPlace = draft.locations[0]?.name
  const places = !firstPlace ? 'No locations selected' : draft.locations.length > 1 ? `${firstPlace} and ${draft.locations.length - 1} more places` : firstPlace
  const placeCountryNames = new Set(draft.locations.filter((item) => item.type === 'country').map((item) => item.name))
  const countries = draft.includedCountries.filter((country) => !placeCountryNames.has(country)).join(', ') || (draft.includedCountries.length ? '' : 'No included countries')
  const interestsText = draft.interests.join(', ') || 'All interests'
  return `Showing your ad to: ${places}${countries ? `, ${countries}` : ''} · Ages ${draft.ageMin}–${draft.ageMax} · ${interestsText}`
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
        const initial = template ? migrateCampaignDraft({ ...template.draft, locations: undefined }) : savedDraft
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

  const locationSummary = draft.locations.map((item) => item.label).join(' · ') || 'No locations selected'
  const missingLocation = draft.locations.length === 0
  const readiness = getObjectiveReadiness(draft)
  const canPublish = Boolean(draft.objective) && readiness.filter((item) => !item.warning).every((item) => item.ready)
  const totalBudget = draft.duration === 'ongoing' ? null : draft.dailyBudget * draft.duration
  const reachMultiplier = Math.max(0.25, (Math.max(1, draft.locations.length) * Math.max(1, draft.includedCountries.length)) / ((draft.excludedCountries.length + 1) * (1 + draft.interests.length * 0.08)))

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
    if (!selected.includes(value) && selected.length >= 8) {
      toast({ title: 'Choose up to 8 interests', description: 'Remove an interest before adding another.' })
      return
    }
    setField('interests', selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value], true)
  }

  function toggleCountry(country: string, side: 'include' | 'exclude') {
    const ownList = side === 'include' ? draft.includedCountries : draft.excludedCountries
    const otherList = side === 'include' ? draft.excludedCountries : draft.includedCountries
    const isSelected = ownList.includes(country)
    const moved = !isSelected && otherList.includes(country)
    updateDraft((current) => {
      const own = side === 'include' ? current.includedCountries : current.excludedCountries
      const other = side === 'include' ? current.excludedCountries : current.includedCountries
      const nextOwn = own.includes(country) ? own.filter((item) => item !== country) : [...own, country]
      const nextOther = !own.includes(country) ? other.filter((item) => item !== country) : other
      return side === 'include'
        ? { ...current, includedCountries: nextOwn, excludedCountries: nextOther }
        : { ...current, excludedCountries: nextOwn, includedCountries: nextOther }
    })
    if (moved) toast({ title: `${country} moved`, description: `It was removed from ${side === 'include' ? 'Exclude' : 'Include'} countries.` })
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

  function focusReadiness(key: string) {
    if (key === 'image') {
      setReview(false)
      setStep(3)
      setEditing(null)
      window.setTimeout(() => {
        imageUploadButton.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        imageUploadButton.current?.focus()
      }, 0)
      return
    }
    const targets: Record<string, { step: number; id: string }> = {
      location: { step: 1, id: 'location-search' },
      headline: { step: 3, id: 'headline' },
      adText: { step: 3, id: 'ad-text' },
      website: { step: 3, id: 'website-url' },
      leadFormName: { step: 3, id: 'lead-form-name' },
      leadPrivacy: { step: 3, id: 'lead-privacy-url' },
      productName: { step: 3, id: 'product-name' },
      productPrice: { step: 3, id: 'price' },
      brandName: { step: 3, id: 'brand-name' },
      tagline: { step: 3, id: 'tagline' },
    }
    const target = targets[key] ?? { step: 3, id: key }
    setStep(target.step)
    setReview(false)
    setEditing(null)
    window.setTimeout(() => {
      const element = document.getElementById(target.id)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element?.focus()
    }, 0)
  }

  function reviewFieldValue(field: ReviewField) {
    switch (field) {
      case 'objective': return draft.objective || 'Choose a goal'
      case 'location': return locationSummary
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
      case 'location': break
      case 'age': {
        const [min, max] = value.split('-').map(Number)
        if (Number.isFinite(min) && Number.isFinite(max)) updateDraft((current) => ({ ...current, ageMin: min, ageMax: max }))
        break
      }
      case 'gender': setField('gender', value); break
      case 'interests': setField('interests', value.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 8)); break
      case 'budget': setField('dailyBudget', Number(value.replace(/[^\d]/g, '')) || 0); break
      case 'duration': setField('duration', value.toLowerCase().includes('ongoing') ? 'ongoing' : Number(value.replace(/[^\d]/g, '')) || 0); break
      case 'headline': setField('headline', value); break
      case 'text': setField('text', value); break
      case 'cta': setField('cta', value); break
      case 'url': setField('url', value); break
    }
  }

  if (!ready) return <main className="mx-auto max-w-3xl px-4 py-10"><div className="h-48 rounded-lg border border-border bg-muted" /></main>

  if (published) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700"><Check className="h-7 w-7" aria-hidden="true" /></span>
        <p className="mt-5 text-sm font-semibold text-green-700">Campaign submitted</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Your campaign is ready for review</h1>
        <p className="mt-3 text-muted-foreground">This demo does not deliver ads. You can view the campaign list or create another draft.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/campaigns" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View campaigns</Link>
          <button type="button" onClick={() => {
            try { window.localStorage.removeItem(campaignDraftStorageKey) } catch (error) { console.error('Unable to clear campaign draft', error) }
            router.push('/campaigns/new')
          }} className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Create another</button>
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
    <main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 lg:py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/campaigns/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Exit setup</Link>
        <div className="flex items-center gap-3">
          <Link href="/campaigns/new/ai" onClick={saveDraftNow} className="rounded-lg px-2 py-1 text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Switch to AI</Link>
          <p className={`text-sm ${saveMessage === 'Could not save' ? 'text-red-700' : 'text-muted-foreground'}`} role="status">{saveMessage}</p>
        </div>
      </div>

      <section className="mt-5 rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5 lg:mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{review ? 'Review your campaign' : `Step ${step + 1} of 5`}</p>
            <p className="mt-1 text-sm text-muted-foreground">{review ? 'Check each detail before you publish.' : step === 0 ? 'About 2 minutes left' : step < 3 ? 'About 1 minute left' : 'Less than 1 minute left'}</p>
          </div>
          <div className="flex gap-1.5" aria-label={`${review ? 5 : step + 1} of 5 steps complete`}>
            {campaignObjectives.map((goal, index) => <span key={goal.title} className={`h-1.5 w-8 rounded-full sm:w-12 ${index <= step ? 'bg-progress' : 'bg-border'}`} />)}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-progress" style={{ width: `${review ? 100 : ((step + 1) / 5) * 100}%` }} />
        </div>
      </section>

      {!review ? (
        <section className={`mt-4 min-w-0 ${step === 1 ? 'grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-stretch' : step === 3 ? 'grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:items-start' : 'grid gap-5'}`}>
          <div className="min-w-0 rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5">
            {step === 0 && (
              <>
                <h1 className="text-2xl font-bold text-foreground">What is your main goal?</h1>
                <p className="mt-2 text-sm text-muted-foreground">Choose one. You can change this later.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {campaignObjectives.map((goal) => (
                    <button key={goal.title} type="button" onClick={() => chooseGoal(goal.title)} className={`min-h-28 rounded-lg border p-4 text-left transition hover:border-accent hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${draft.objective === goal.title ? 'border-primary bg-secondary' : 'border-border'}`}>
                      <span className="block font-semibold text-foreground">{goal.title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{goal.hint}</span>
                      <span className="mt-2 block text-sm text-muted-foreground">Recommended · continue in 1 tap</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-foreground">Where and who</h1>
                <p className="mt-2 text-sm text-muted-foreground">Add one or more places on the map, then choose who should see your ad.</p>
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Age range: {draft.ageMin}–{draft.ageMax}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Choose an age range that fits your audience.</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <label className="text-sm text-muted-foreground">From {draft.ageMin}
                        <input aria-label="Minimum age" type="range" min="18" max={Math.max(18, draft.ageMax - 1)} value={draft.ageMin} onChange={(event) => setField('ageMin', Number(event.target.value))} className="mt-2 w-full accent-primary" />
                      </label>
                      <label className="text-sm text-muted-foreground">To {draft.ageMax}
                        <input aria-label="Maximum age" type="range" min={Math.min(65, draft.ageMin + 1)} max="65" value={draft.ageMax} onChange={(event) => setField('ageMax', Number(event.target.value))} className="mt-2 w-full accent-primary" />
                      </label>
                    </div>
                  </div>
                  <fieldset>
                    <legend className="text-sm font-semibold text-foreground">Gender</legend>
                    <p className="mt-1 text-sm text-muted-foreground">Everyone is a broad starting point.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['Everyone', 'Men', 'Women'].map((gender) => <button key={gender} type="button" aria-pressed={draft.gender === gender} onClick={() => setField('gender', gender, true)} className={`min-h-10 rounded-lg border px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${draft.gender === gender ? 'border-primary bg-secondary text-foreground' : 'border-border text-foreground'}`}>{gender}</button>)}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="text-sm font-semibold text-foreground">Interests <span className="font-normal text-muted-foreground">(optional, choose up to 8)</span></legend>
                    <p className="mt-1 text-sm text-muted-foreground">Choose topics that match the people you want to reach.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {interests.map((interest) => <button key={interest} type="button" aria-pressed={draft.interests.includes(interest)} onClick={() => toggleInterest(interest)} className={`min-h-10 rounded-lg border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${draft.interests.includes(interest) ? 'border-primary bg-secondary text-foreground' : 'border-border text-foreground'}`}>{interest}</button>)}
                    </div>
                  </fieldset>
                  <section aria-label="Country audience targeting" className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Country audience</h2>
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                      <CountryMultiSelect title="Include countries" countries={mockCountries} selected={draft.includedCountries} recommended="India" onToggle={(country) => toggleCountry(country, 'include')} helper={audienceEligibilityNote} />
                      <CountryMultiSelect title="Exclude countries" countries={mockCountries} selected={draft.excludedCountries} onToggle={(country) => toggleCountry(country, 'exclude')} helper={audienceEligibilityNote} />
                    </div>
                  </section>
                  <p className="rounded-lg border border-border bg-secondary p-3 text-sm text-foreground">{audienceSummary(draft)}</p>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold text-foreground">{campaignObjectives.find((item) => item.title === draft.objective)?.budgetTitle ?? 'Choose your budget'}</h1>
                <p className="mt-2 text-sm text-muted-foreground">Set a daily limit. You can change it whenever you like.</p>
                <div className="mt-5 rounded-lg border border-border bg-secondary p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">Daily budget</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-foreground">Recommended</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-foreground">₹{draft.dailyBudget.toLocaleString('en-IN')}<span className="text-sm font-medium text-muted-foreground"> / day</span></p>
                  <input aria-label="Daily budget" type="range" min="200" max="10000" step="100" value={draft.dailyBudget} onFocus={beginFieldEdit} onPointerUp={finishFieldEdit} onKeyUp={finishFieldEdit} onChange={(event) => setField('dailyBudget', Number(event.target.value))} className="mt-4 w-full accent-primary" />
                  <p className="mt-1 text-sm text-muted-foreground">This is the most you plan to spend each day.</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2" aria-label="Common daily budgets">
                  {[200, 500, 1000].map((amount) => <button key={amount} type="button" aria-pressed={draft.dailyBudget === amount} onClick={() => setField('dailyBudget', amount, true)} className={`min-h-10 rounded-lg border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${draft.dailyBudget === amount ? 'border-primary bg-secondary text-foreground' : 'border-border text-foreground'}`}>₹{amount.toLocaleString('en-IN')}{amount === 500 ? ' · Recommended' : ''}</button>)}
                </div>
                <div className="mt-5 rounded-lg bg-secondary p-4">
                  <p className="text-sm font-semibold text-foreground">{campaignObjectives.find((item) => item.title === draft.objective)?.estimateLabels[0] ?? 'Estimated results'}</p>
                  <p className="mt-1 text-sm text-foreground">{draft.objective === 'Get leads' ? `${Math.max(1, Math.round(draft.dailyBudget / 250))}–${Math.max(2, Math.round(draft.dailyBudget / 100))} leads · Cost per lead ₹${Math.max(50, Math.round(draft.dailyBudget / 5))}` : draft.objective === 'Get sales' ? `${Math.max(1, Math.round(draft.dailyBudget / 500))}–${Math.max(2, Math.round(draft.dailyBudget / 200))} sales · Return on ad spend 1.8×` : draft.objective === 'Build awareness' ? `${Math.round(draft.dailyBudget * 20 * reachMultiplier).toLocaleString('en-IN')}–${Math.round(draft.dailyBudget * 45 * reachMultiplier).toLocaleString('en-IN')} people · ${draft.objectiveDetails.objective === 'Build awareness' ? draft.objectiveDetails.frequency : 3} times each` : `${(draft.dailyBudget * 2).toLocaleString('en-IN')}–${(draft.dailyBudget * 5).toLocaleString('en-IN')} visits`}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Estimated, sample data</p>
                </div>
                {draft.objective === 'Build awareness' && draft.objectiveDetails.objective === 'Build awareness' && <label className="mt-4 block text-sm font-medium text-foreground">Average frequency: {draft.objectiveDetails.frequency}<input aria-label="Average frequency" type="range" min="1" max="8" value={draft.objectiveDetails.frequency} onChange={(event) => updateDraft((current) => current.objectiveDetails.objective === 'Build awareness' ? { ...current, objectiveDetails: { ...current.objectiveDetails, frequency: Number(event.target.value) } } : current)} className="mt-2 w-full accent-primary" /></label>}
                {draft.objective === 'Get sales' && <p className="mt-4 rounded-lg border border-border p-3 text-sm text-foreground">Conversion tracking: Mock status · ready to configure</p>}
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold text-foreground">How long should it run?</legend>
                  <p className="mt-1 text-sm text-muted-foreground">Choose a run time or keep the campaign running.</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {durations.map((duration) => <button key={duration} type="button" aria-pressed={draft.duration === duration} onClick={() => setField('duration', duration, true)} className={`min-h-11 rounded-lg border px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${draft.duration === duration ? 'border-primary bg-secondary text-foreground' : 'border-border text-foreground'}`}>{duration === 'ongoing' ? 'Keep running' : `${duration} days`}</button>)}
                  </div>
                </fieldset>
                <p className="mt-4 rounded-lg border border-border p-3 text-sm text-foreground">
                  {totalBudget === null ? <>Your daily cap is <strong>₹{draft.dailyBudget.toLocaleString('en-IN')}</strong>. No end date is set.</> : <>Estimated maximum: <strong>₹{totalBudget.toLocaleString('en-IN')}</strong> over {draft.duration} days.</>}
                </p>
                <details className="mt-4 rounded-lg border border-border p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">More options <ChevronDown className="h-4 w-4" aria-hidden="true" /></summary>
                  <p className="mt-3 text-sm text-muted-foreground">Your daily budget is a spending limit, not a promise to spend the full amount.</p>
                </details>
              </>
            )}
            {step === 3 && <ObjectiveAdStep draft={draft} updateDraft={updateDraft} beginFieldEdit={beginFieldEdit} finishFieldEdit={finishFieldEdit} uploadImage={uploadImage} imageError={imageError} imageUploadButton={imageUploadButton} />}
            <div className="sticky bottom-0 z-10 mt-6 -mx-4 border-t border-border bg-white px-4 pb-4 pt-4 sm:-mx-5 sm:px-5">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => updateStep(step - 1)} disabled={step === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</button>
                <button type="button" onClick={advanceStep} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{step === 3 ? 'Review campaign' : 'Continue'}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          </div>
          {step === 3 && <aside className="rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5 lg:overflow-hidden"><AdPreview draft={draft} /></aside>}
          {step === 1 && (
            <aside className="min-w-0 rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 text-base font-semibold text-foreground">Locations and map</h2>
              <MapPicker locations={draft.locations} onChange={(locations: CampaignTargetLocation[]) => setField('locations', locations)} />
            </aside>
          )}
        </section>
      ) : (
        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:min-h-0">
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5 lg:overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Review your campaign</h1>
                <p className="mt-2 text-sm text-muted-foreground">Select any value to edit it right here.</p>
              </div>
              <p className="rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-foreground">₹{draft.dailyBudget.toLocaleString('en-IN')} per day</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(['objective', 'location', 'age', 'gender', 'interests', 'budget', 'duration', 'headline', 'text', 'cta', 'url'] as ReviewField[]).map((field) => (
                <div key={field} className="min-w-0 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium capitalize text-muted-foreground">{field === 'cta' ? 'Button text' : field === 'url' ? 'Website link' : field === 'text' ? 'Ad text' : field}</p>
                  {editing === field ? (
                    <div className="mt-1 flex gap-2">
                      {field === 'text'
                        ? <textarea autoFocus value={draft.text} onChange={(event) => updateReviewField(field, event.target.value)} className="min-h-20 w-full rounded-lg border border-border p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        : <input autoFocus aria-label={`Edit ${field}`} value={field === 'age' ? `${draft.ageMin}-${draft.ageMax}` : field === 'interests' ? draft.interests.join(', ') : field === 'budget' ? String(draft.dailyBudget) : field === 'duration' ? (draft.duration === 'ongoing' ? 'ongoing' : String(draft.duration)) : field === 'location' ? locationSummary : field === 'objective' ? draft.objective : field === 'gender' ? draft.gender : field === 'headline' ? draft.headline : field === 'cta' ? draft.cta : draft.url} onChange={(event) => updateReviewField(field, event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-border px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />}
                      <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-2 text-sm font-semibold text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Done</button>
                    </div>
                  ) : (
                    field === 'location'
                      ? <p className="mt-1 break-words text-sm font-medium text-foreground">{reviewFieldValue(field) ?? ''}</p>
                      : <button type="button" onClick={() => setEditing(field)} className="mt-1 block max-w-full break-words text-left text-sm font-medium text-foreground underline decoration-dotted underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{reviewFieldValue(field) ?? ''}</button>
                  )}
                </div>
              ))}
            </div>
            <section className="mt-4 rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">Audience targeting</h2>
              <p className="mt-2 text-sm text-foreground">Locations: {draft.locations.map((item) => item.label).join(' · ') || 'None selected'}</p>
              <p className="mt-1 text-sm text-foreground">Include countries: {draft.includedCountries.join(', ') || 'None'}</p>
              <p className="mt-1 text-sm text-foreground">Exclude countries: {draft.excludedCountries.join(', ') || 'None'}</p>
              <p className="mt-1 text-sm text-foreground">Interests: {draft.interests.join(', ') || 'All interests'}</p>
            </section>
            {draft.objectiveDetails.objective === 'Get leads' && <section className="mt-4 rounded-lg border border-border p-4"><h2 className="text-sm font-semibold text-foreground">Lead form: {draft.objectiveDetails.leadForm.name || 'Unnamed form'}</h2><p className="mt-2 text-sm text-muted-foreground">Fields: {draft.objectiveDetails.leadForm.fields.filter((field) => field.enabled).map((field) => `${field.label}${field.required ? ' (required)' : ''}`).join(', ') || 'No fields selected'}</p><p className="mt-1 break-all text-sm text-muted-foreground">Privacy policy: {draft.objectiveDetails.leadForm.privacyPolicyUrl || 'Not set'}</p></section>}
            {draft.objectiveDetails.objective === 'Get sales' && <section className="mt-4 rounded-lg border border-border p-4"><h2 className="text-sm font-semibold text-foreground">Product details</h2><p className="mt-2 text-sm text-muted-foreground">{draft.objectiveDetails.productName || 'Product name'} · ₹{draft.objectiveDetails.offerPrice || draft.objectiveDetails.price || '0'}{draft.objectiveDetails.offerPrice ? ` (regular ₹${draft.objectiveDetails.price})` : ''}</p></section>}
            {draft.objectiveDetails.objective === 'Build awareness' && <section className="mt-4 rounded-lg border border-border p-4"><h2 className="text-sm font-semibold text-foreground">Brand details</h2><p className="mt-2 text-sm text-muted-foreground">{draft.objectiveDetails.brandName || 'Brand name'} · {draft.objectiveDetails.tagline || 'Tagline'} · Frequency {draft.objectiveDetails.frequency}</p></section>}
            <p className="mt-4 rounded-lg bg-secondary p-3 text-sm text-foreground">
              {totalBudget === null ? `Daily cap: ₹${draft.dailyBudget.toLocaleString('en-IN')} · no end date` : `Total budget: ₹${totalBudget.toLocaleString('en-IN')} (${draft.duration} days)`}. Estimated results are a mock range, not a forecast.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm sm:p-5 lg:overflow-y-auto">
            <h2 className="text-lg font-semibold text-foreground">Ad readiness</h2>
            <p className="mt-1 text-sm text-muted-foreground">Warnings are optional. Fix any errors before publishing.</p>
            <ul className="mt-4 space-y-3">
              {readiness.map((item) => (
                <li key={item.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-3">
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.ready ? 'bg-green-600' : item.warning ? 'bg-amber-500' : 'bg-red-600'}`} aria-hidden="true" />
                    {item.label}{!item.ready && item.warning ? ' · optional' : ''}
                  </span>
                  {!item.ready && <button type="button" onClick={() => focusReadiness(item.key)} className="min-h-9 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Fix</button>}
                </li>
              ))}
            </ul>
            {!canPublish && <p role="alert" className="mt-3 text-sm text-red-700">Complete each required item above before publishing. Use Fix to jump to the field; the image reminder is optional.</p>}
            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => { setReview(false); setStep(3) }} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Back to ad</button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={saveDraftNow} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Save draft</button>
                <button type="button" onClick={() => setConfirming(true)} disabled={!canPublish} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">Publish campaign</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {confirming && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirming(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-t-xl bg-white p-5 shadow-sm sm:rounded-lg sm:p-6">
            <h2 id="confirm-title" className="text-xl font-bold text-foreground">Publish this campaign?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">This will submit your campaign for review in the demo. No ad will be delivered and no payment will be taken.</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button autoFocus type="button" onClick={() => setConfirming(false)} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Keep editing</button>
              <button type="button" onClick={() => { setConfirming(false); setPublished(true) }} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Confirm publish</button>
            </div>
          </section>
        </div>
      )}
      {pendingObjective && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingObjective('') }}>
          <section role="dialog" aria-modal="true" aria-labelledby="objective-change-title" className="w-full max-w-md rounded-t-xl border border-border bg-white p-5 shadow-sm sm:rounded-xl">
            <h2 id="objective-change-title" className="text-lg font-semibold text-foreground">Change campaign goal?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This clears details entered for {draft.objective}. Your location, audience and budget will stay.</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setPendingObjective('')} className="min-h-10 rounded-lg border border-border px-4 text-sm font-semibold text-foreground">Keep current goal</button>
              <button type="button" onClick={() => applyObjective(pendingObjective)} className="min-h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white">Change goal</button>
            </div>
          </section>
        </div>
      )}
      {!review && (
        <div className="mt-4 text-center">
          <button type="button" onClick={saveDraftNow} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Save draft now <ChevronDown className="h-3 w-3" aria-hidden="true" /></button>
        </div>
      )}
    </main>
  )
}

function CountryMultiSelect({ title, countries, selected, recommended, helper, onToggle }: {
  title: string
  countries: string[]
  selected: string[]
  recommended?: string
  helper: string
  onToggle: (country: string) => void
}) {
  const [query, setQuery] = useState('')
  const filteredCountries = countries.filter((country) => country.toLowerCase().includes(query.trim().toLowerCase()))
  const searchId = title === 'Include countries' ? 'include-country-search' : 'exclude-country-search'
  return <div className="min-w-0 rounded-lg border border-border p-3">
    <label htmlFor={searchId} className="block text-sm font-medium text-foreground">{title}</label>
    <input id={searchId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search countries" className="mt-2 h-10 w-full min-w-0 rounded-lg border border-border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto" aria-label={title}>
      {filteredCountries.map((country) => <li key={country}>
        <label className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm text-foreground hover:bg-muted">
          <input type="checkbox" checked={selected.includes(country)} onChange={() => onToggle(country)} className="accent-primary" />
          <span className="min-w-0 flex-1">{country}</span>
          {country === recommended && <span className="text-sm text-muted-foreground">Recommended</span>}
        </label>
      </li>)}
      {!filteredCountries.length && <li className="p-2 text-sm text-muted-foreground">No country matches that search.</li>}
    </ul>
    <p className="mt-2 text-sm leading-5 text-muted-foreground">{helper}</p>
  </div>
}
