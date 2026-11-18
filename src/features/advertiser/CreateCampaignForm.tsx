'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/primitives/accordion'
import { Button } from '@/components/primitives/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/primitives/dialog'
import { Input } from '@/components/primitives/input'
import { Label } from '@/components/primitives/label'
import { Progress } from '@/components/primitives/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select'
import { Switch } from '@/components/primitives/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs'
import { Textarea } from '@/components/primitives/textarea'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/Toast'
import { Stepper } from '@/components/wizard/Stepper'
import {
  advertiserAdUnits,
  advertiserCountries,
  advertiserDevices,
  campaignCallToActions,
  campaignGenders,
  campaignInterestOptions,
  campaignObjectives,
  campaignOperatingSystems,
  campaignPlacementOptions,
} from '@/data/advertiser'
import { MapPicker } from '@/features/advertiser/MapPicker'

const DRAFT_KEY = 'rivinityads.campaign-draft.v1'
const AGE_MIN = 13
const AGE_MAX = 100
const IMAGE_SIZE_LIMIT = 2 * 1024 * 1024
const REQUIRED_FIELDS = [
  'campaignName',
  'objective',
  'buyingType',
  'budgetType',
  'budget',
  'adUnit',
  'headline',
  'primaryText',
  'callToAction',
  'landingUrl',
] as const

type CampaignDraft = {
  campaignName: string
  objective: string
  buyingType: string
  specialCategory: boolean
  abTest: boolean
  minimumAge: string
  maximumAge: string
  gender: string
  interests: string[]
  country: string
  state: string
  city: string
  pins: string[]
  radius: string
  devices: string[]
  operatingSystems: string[]
  placements: string[]
  budgetType: '' | 'daily' | 'lifetime'
  budget: string
  startDate: string
  endDate: string
  frequencyCap: string
  pricingType: string
  adUnit: string
  capping: string
  blacklist: string
  ipRange: string
  customBid: string
  imageName: string
  imageDataUrl: string
  mapLat?: number | null
  mapLng?: number | null
  headline: string
  primaryText: string
  description: string
  callToAction: string
  landingUrl: string
}

type FieldName = keyof CampaignDraft
type Choice = { label: string; value: string }

function makeInitialDraft(initialCountry?: string, initialAdUnit?: string): CampaignDraft {
  return {
    campaignName: '',
    objective: '',
    buyingType: '',
    specialCategory: false,
    abTest: false,
    minimumAge: '',
    maximumAge: '',
    gender: '',
    interests: [],
    country: advertiserCountries.includes(initialCountry ?? '') ? initialCountry ?? '' : '',
    state: '',
    city: '',
    pins: [],
    radius: '',
    devices: [],
    operatingSystems: [],
    placements: [],
    budgetType: '',
    budget: '',
    startDate: '',
    endDate: '',
    frequencyCap: '',
    pricingType: '',
    adUnit: advertiserAdUnits.includes(initialAdUnit ?? '') ? initialAdUnit ?? '' : '',
    capping: '',
    blacklist: '',
    ipRange: '',
    customBid: '',
    imageName: '',
    imageDataUrl: '',
    mapLat: null,
    mapLng: null,
    headline: '',
    primaryText: '',
    description: '',
    callToAction: '',
    landingUrl: '',
  }
}

function isCampaignDraft(value: unknown): value is CampaignDraft {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  const strings: FieldName[] = [
    'campaignName', 'objective', 'buyingType', 'minimumAge', 'maximumAge', 'gender', 'country', 'state',
    'city', 'radius', 'budget', 'startDate', 'endDate', 'frequencyCap', 'pricingType', 'adUnit', 'capping',
    'blacklist', 'ipRange', 'customBid', 'imageName', 'imageDataUrl', 'headline', 'primaryText',
    'description', 'callToAction', 'landingUrl',
  ]
  const arrays: FieldName[] = ['interests', 'pins', 'devices', 'operatingSystems', 'placements']
  return strings.every((key) => typeof record[key] === 'string')
    && arrays.every((key) => Array.isArray(record[key]) && (record[key] as unknown[]).every((item) => typeof item === 'string'))
    && typeof record.specialCategory === 'boolean'
    && typeof record.abTest === 'boolean'
    && (record.mapLat === undefined || record.mapLat === null || typeof record.mapLat === 'number')
    && (record.mapLng === undefined || record.mapLng === null || typeof record.mapLng === 'number')
    && (record.budgetType === '' || record.budgetType === 'daily' || record.budgetType === 'lifetime')
}

function httpsUrlError(value: string) {
  if (!value.trim()) return 'Enter a landing page URL.'
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !url.hostname.includes('.')) return 'Enter a valid HTTPS URL.'
  } catch {
    return 'Enter a valid HTTPS URL.'
  }
  return ''
}

function displayValue(value: string) {
  return value.trim() || 'Not set'
}

function CampaignChoiceCards({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string
  options: Choice[]
  value: string
  onChange: (value: string) => void
  columns?: 2 | 3
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-navy-900">{label}</legend>
      <div className={`grid gap-3 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-blue-600 ${
              value === option.value ? 'border-blue-600 bg-blue-50 text-navy-900' : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="accent-blue-600"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function SelectableChips({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-navy-900">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isSelected ? 'border-blue-600 bg-blue-50 text-navy-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  placeholder,
  min,
  max,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  type?: string
  placeholder?: string
  min?: number
  max?: number
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="text-sm text-red-700">{error}</p>}
    </div>
  )
}

function AdPreview({ draft, mobile }: { draft: CampaignDraft; mobile: boolean }) {
  return (
    <div
      className={`mx-auto overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${mobile ? 'max-w-60' : 'max-w-md'}`}
      aria-label={`${mobile ? 'Mobile' : 'Desktop'} ad preview`}
    >
      {draft.imageDataUrl ? (
        <Image
          src={draft.imageDataUrl}
          alt="Uploaded campaign creative"
          width={640}
          height={360}
          unoptimized
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-slate-100 text-sm text-slate-500">
          No image uploaded
        </div>
      )}
      <div className="space-y-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sponsored preview</p>
        <h3 className="font-semibold text-navy-900">{draft.headline || 'Headline will appear here'}</h3>
        <p className="line-clamp-3 text-sm text-slate-600">{draft.primaryText || 'Primary text will appear here'}</p>
        {draft.description && <p className="text-xs text-slate-500">{draft.description}</p>}
        <Button type="button" size="sm" disabled>{draft.callToAction || 'CTA'}</Button>
        {draft.landingUrl && <p className="truncate text-xs text-slate-500">{draft.landingUrl}</p>}
      </div>
    </div>
  )
}

function LivePreview({ draft }: { draft: CampaignDraft }) {
  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle className="text-lg">Live preview</CardTitle>
        <p className="text-sm text-slate-600">Changes appear here as you fill out the form.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdPreview draft={draft} mobile={false} />
        <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
          <p className="font-medium text-navy-900">{displayValue(draft.campaignName)}</p>
          <p className="text-slate-600">{displayValue(draft.objective)} · {displayValue(draft.adUnit)}</p>
          <p className="text-slate-600">
            {draft.budget && draft.budgetType
              ? `₹${draft.budget} ${draft.budgetType === 'daily' ? 'daily' : 'lifetime'} budget`
              : 'Budget not set'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function SummarySection({
  title,
  rows,
  onEdit,
}: {
  title: string
  rows: { label: string; value: string }[]
  onEdit: () => void
}) {
  return (
    <section className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-navy-900">{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>Edit</Button>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-slate-500">{row.label}</dt>
            <dd className="break-words text-sm text-navy-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function CreateCampaignForm({
  initialCountry,
  initialAdUnit,
}: {
  initialCountry?: string
  initialAdUnit?: string
}) {
  const router = useRouter()
  const toast = useToast()
  const initialDraft = useMemo(() => makeInitialDraft(initialCountry, initialAdUnit), [initialCountry, initialAdUnit])
  const [draft, setDraft] = useState<CampaignDraft>(initialDraft)
  const [step, setStep] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [published, setPublished] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [pinDraft, setPinDraft] = useState('')
  const [pinTouched, setPinTouched] = useState(false)
  const [imageError, setImageError] = useState('')
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadedRef = useRef(false)

  const validationErrors = useMemo<Partial<Record<FieldName, string>>>(() => {
    const ageIsInvalid = Boolean(draft.minimumAge || draft.maximumAge)
      && (Number(draft.minimumAge || AGE_MIN) < AGE_MIN
        || Number(draft.maximumAge || AGE_MAX) > AGE_MAX
        || Number(draft.minimumAge || AGE_MIN) > Number(draft.maximumAge || AGE_MAX))
    const dateOrderIsInvalid = Boolean(draft.startDate && draft.endDate && draft.endDate < draft.startDate)
    return {
      campaignName: draft.campaignName.trim() ? '' : 'Enter a campaign name.',
      objective: draft.objective ? '' : 'Choose a campaign objective.',
      buyingType: draft.buyingType ? '' : 'Choose a buying type.',
      minimumAge: ageIsInvalid ? `Age range must be between ${AGE_MIN} and ${AGE_MAX}, with the minimum no greater than the maximum.` : '',
      maximumAge: ageIsInvalid ? `Age range must be between ${AGE_MIN} and ${AGE_MAX}, with the minimum no greater than the maximum.` : '',
      startDate: dateOrderIsInvalid ? 'The end date must be on or after the start date.' : '',
      endDate: dateOrderIsInvalid ? 'The end date must be on or after the start date.' : '',
      radius: draft.radius && (Number(draft.radius) < 1 || Number(draft.radius) > 500) ? 'Enter a radius between 1 and 500 km.' : '',
      budgetType: draft.budgetType ? '' : 'Choose a daily or lifetime budget.',
      budget: Number(draft.budget) > 0 ? '' : 'Enter a budget greater than ₹0.',
      adUnit: draft.adUnit ? '' : 'Choose an ad unit.',
      headline: draft.headline.trim() ? '' : 'Enter an ad headline.',
      primaryText: draft.primaryText.trim() ? '' : 'Enter the primary ad text.',
      callToAction: draft.callToAction ? '' : 'Choose a call to action.',
      landingUrl: httpsUrlError(draft.landingUrl),
    }
  }, [draft])

  const missingRequired = REQUIRED_FIELDS.filter((field) => validationErrors[field])
  const canPublish = missingRequired.length === 0
  const pinError = pinTouched && pinDraft.trim() && !/^\d{4,10}$/.test(pinDraft.trim())
    ? 'Enter a PIN code with 4 to 10 digits.'
    : ''

  const updateDraft = useCallback(<K extends FieldName>(field: K, value: CampaignDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setIsDirty(true)
  }, [])

  const markTouched = useCallback((field: FieldName) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }, [])

  const toggleArrayValue = useCallback((field: 'interests' | 'devices' | 'operatingSystems' | 'placements', value: string) => {
    const selected = draft[field]
    updateDraft(field, selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }, [draft, updateDraft])

  const saveDraft = useCallback(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      setIsDirty(false)
      toast({ title: 'Draft saved', description: 'This campaign draft is stored in this browser only.' })
    } catch (error) {
      console.error('Unable to save campaign draft', error)
      toast({ title: 'Draft could not be saved', description: 'Browser storage is unavailable or full. Your form is still open.', variant: 'error' })
    }
  }, [draft, toast])

  useEffect(() => {
    let restored: CampaignDraft | null = null
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (isCampaignDraft(parsed)) restored = parsed
        else toast({ title: 'Saved draft could not be restored', description: 'The locally stored draft has an unsupported format.', variant: 'error' })
      }
    } catch (error) {
      console.error('Unable to restore campaign draft', error)
      toast({ title: 'Saved draft could not be restored', description: 'Browser storage is unavailable or the draft data is invalid.', variant: 'error' })
    }
    queueMicrotask(() => {
      if (!loadedRef.current && restored) setDraft(restored)
      loadedRef.current = true
      setIsHydrated(true)
    })
  }, [toast])

  useEffect(() => {
    if (!isHydrated) return
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch (error) {
      console.error('Unable to autosave campaign draft', error)
      toast({ title: 'Autosave unavailable', description: 'Continue editing, then try Save draft again.', variant: 'error' })
    }
  }, [draft, isHydrated, toast])

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const onDocumentClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      event.preventDefault()
      setPendingNavigation(`${url.pathname}${url.search}${url.hash}`)
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onDocumentClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onDocumentClick, true)
    }
  }, [isDirty])

  const fieldError = (field: FieldName) => touched[field] ? validationErrors[field] : ''
  const toggle = (field: 'interests' | 'devices' | 'operatingSystems' | 'placements', value: string) => toggleArrayValue(field, value)
  const toggleSwitch = (field: 'specialCategory' | 'abTest', value: boolean) => updateDraft(field, value)

  function continueToNextStep() {
    const requiredForStep: FieldName[] = step === 0
      ? ['campaignName', 'objective', 'buyingType']
      : ['budgetType', 'budget', 'adUnit']
    setTouched((current) => ({ ...current, ...Object.fromEntries(requiredForStep.map((field) => [field, true])) }))
    if (requiredForStep.includes('adUnit') && validationErrors.adUnit) setAdvancedOpen(true)
    if (requiredForStep.some((field) => validationErrors[field])) return
    setReviewing(false)
    setStep((current) => Math.min(current + 1, 2))
  }

  function openReview() {
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, true])),
    }))
    setReviewing(true)
    if (validationErrors.adUnit) setAdvancedOpen(true)
  }

  function addPin() {
    setPinTouched(true)
    const value = pinDraft.trim()
    if (!/^\d{4,10}$/.test(value) || draft.pins.includes(value)) return
    updateDraft('pins', [...draft.pins, value])
    setPinDraft('')
    setPinTouched(false)
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setImageError('Choose a PNG, JPEG, or WebP image.')
      event.target.value = ''
      return
    }
    if (file.size > IMAGE_SIZE_LIMIT) {
      setImageError('Choose an image smaller than 2 MB.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onerror = () => setImageError('The selected image could not be read.')
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setImageError('The selected image could not be read.')
        return
      }
      updateDraft('imageName', file.name)
      updateDraft('imageDataUrl', reader.result)
      setImageError('')
    }
    reader.readAsDataURL(file)
  }

  function publishMockCampaign() {
    if (!canPublish) {
      setTouched((current) => ({
        ...current,
        ...Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, true])),
      }))
      return
    }
    try {
      window.localStorage.removeItem(DRAFT_KEY)
    } catch (error) {
      console.error('Unable to clear published campaign draft', error)
      toast({ title: 'Draft cleanup failed', description: 'The mock campaign is ready, but the local draft could not be cleared.', variant: 'error' })
    }
    setIsDirty(false)
    setPublished(true)
    toast({ title: 'Mock campaign published', description: 'No campaign has been sent to an ad platform.' })
  }

  const campaignRows = [
    { label: 'Name', value: displayValue(draft.campaignName) },
    { label: 'Objective', value: displayValue(draft.objective) },
    { label: 'Buying type', value: displayValue(draft.buyingType) },
    { label: 'Special category', value: draft.specialCategory ? 'Yes' : 'No' },
    { label: 'A/B test', value: draft.abTest ? 'Enabled' : 'Disabled' },
  ]
  const adSetRows = [
    { label: 'Age range', value: draft.minimumAge || draft.maximumAge ? `${draft.minimumAge || AGE_MIN}–${draft.maximumAge || AGE_MAX}` : 'Not set' },
    { label: 'Gender', value: displayValue(draft.gender) },
    { label: 'Interests', value: draft.interests.length ? draft.interests.join(', ') : 'Not set' },
    { label: 'Location', value: [draft.city, draft.state, draft.country].filter(Boolean).join(', ') || 'Not set' },
    { label: 'PIN codes', value: draft.pins.length ? draft.pins.join(', ') : 'Not set' },
    { label: 'Devices / OS', value: [...draft.devices, ...draft.operatingSystems].join(', ') || 'Not set' },
    { label: 'Placements', value: draft.placements.join(', ') || 'Not set' },
    { label: 'Budget', value: draft.budget && draft.budgetType ? `₹${draft.budget} ${draft.budgetType}` : 'Not set' },
    { label: 'Ad unit', value: displayValue(draft.adUnit) },
    { label: 'Schedule', value: [draft.startDate, draft.endDate].filter(Boolean).join(' to ') || 'Not set' },
    { label: 'Pricing type', value: displayValue(draft.pricingType) },
  ]
  const adRows = [
    { label: 'Creative image', value: displayValue(draft.imageName) },
    { label: 'Headline', value: displayValue(draft.headline) },
    { label: 'Primary text', value: displayValue(draft.primaryText) },
    { label: 'Description', value: displayValue(draft.description) },
    { label: 'Call to action', value: displayValue(draft.callToAction) },
    { label: 'Landing page', value: displayValue(draft.landingUrl) },
  ]

  if (published) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6 sm:p-8">
            <p className="text-sm font-semibold text-blue-700">Mock action complete</p>
            <h1 className="text-2xl font-bold text-navy-900">Campaign ready</h1>
            <p className="text-slate-600">
              “{draft.campaignName}” was marked as published in this prototype. No backend, payment, or ad delivery was triggered.
            </p>
            <Button type="button" onClick={() => router.push('/campaigns')}>Back to campaigns</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stepContent: ReactNode = step === 0 ? (
    <Card>
      <CardHeader>
        <CardTitle>Campaign</CardTitle>
        <p className="text-sm text-slate-600">Set the campaign identity and buying preferences.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <TextField
          id="campaign-name"
          label="Campaign name"
          value={draft.campaignName}
          onChange={(value) => updateDraft('campaignName', value)}
          onBlur={() => markTouched('campaignName')}
          error={fieldError('campaignName')}
          placeholder="Name this campaign"
        />
        <CampaignChoiceCards
          label="Objective"
          options={campaignObjectives.map((objective) => ({ label: objective, value: objective }))}
          value={draft.objective}
          onChange={(value) => {
            updateDraft('objective', value)
            markTouched('objective')
          }}
          columns={3}
        />
        {fieldError('objective') && <p role="alert" className="-mt-4 text-sm text-red-700">{fieldError('objective')}</p>}
        <CampaignChoiceCards
          label="Buying type"
          options={[{ label: 'Auction', value: 'Auction' }, { label: 'Reservation', value: 'Reservation' }]}
          value={draft.buyingType}
          onChange={(value) => {
            updateDraft('buyingType', value)
            markTouched('buyingType')
          }}
        />
        {fieldError('buyingType') && <p role="alert" className="-mt-4 text-sm text-red-700">{fieldError('buyingType')}</p>}
        <div className="space-y-4 rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="special-category">Special ad category</Label>
              <p className="text-sm text-slate-600">Select this if your campaign relates to a regulated category.</p>
            </div>
            <Switch id="special-category" checked={draft.specialCategory} onCheckedChange={(checked) => toggleSwitch('specialCategory', checked)} />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="ab-test">A/B test</Label>
              <p className="text-sm text-slate-600">Keep this off unless you want to compare creative variants.</p>
            </div>
            <Switch id="ab-test" checked={draft.abTest} onCheckedChange={(checked) => toggleSwitch('abTest', checked)} />
          </div>
        </div>
      </CardContent>
    </Card>
  ) : step === 1 ? (
    <Card>
      <CardHeader>
        <CardTitle>Ad Set</CardTitle>
        <p className="text-sm text-slate-600">Choose audience, placements, budget, and schedule.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="minimum-age"
            label={`Minimum age (${AGE_MIN}–${AGE_MAX})`}
            type="number"
            min={AGE_MIN}
            max={AGE_MAX}
            value={draft.minimumAge}
            onChange={(value) => updateDraft('minimumAge', value)}
            onBlur={() => markTouched('minimumAge')}
            error={fieldError('minimumAge')}
          />
          <TextField
            id="maximum-age"
            label={`Maximum age (${AGE_MIN}–${AGE_MAX})`}
            type="number"
            min={AGE_MIN}
            max={AGE_MAX}
            value={draft.maximumAge}
            onChange={(value) => updateDraft('maximumAge', value)}
            onBlur={() => markTouched('maximumAge')}
            error={fieldError('maximumAge')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={draft.gender} onValueChange={(value) => updateDraft('gender', value)}>
            <SelectTrigger id="gender"><SelectValue placeholder="Select an option" /></SelectTrigger>
            <SelectContent>
              {campaignGenders.map((gender) => <SelectItem key={gender} value={gender}>{gender}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <SelectableChips label="Interests" options={[...campaignInterestOptions]} selected={draft.interests} onToggle={(value) => toggle('interests', value)} />
        <div className="space-y-4">
          <h3 className="font-semibold text-navy-900">Location</h3>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={draft.country} onValueChange={(value) => updateDraft('country', value)}>
              <SelectTrigger id="country"><SelectValue placeholder="Choose a country" /></SelectTrigger>
              <SelectContent>
                {advertiserCountries.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="state" label="State / region" value={draft.state} onChange={(value) => updateDraft('state', value)} />
            <TextField id="city" label="City" value={draft.city} onChange={(value) => updateDraft('city', value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="pin-code">PIN codes</Label>
              <Input
                id="pin-code"
                inputMode="numeric"
                value={pinDraft}
                onChange={(event) => setPinDraft(event.target.value)}
                onBlur={() => setPinTouched(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addPin()
                  }
                }}
                aria-invalid={Boolean(pinError)}
                aria-describedby={pinError ? 'pin-code-error' : undefined}
                placeholder="Add a PIN code"
              />
              {pinError && <p id="pin-code-error" className="text-sm text-red-700">{pinError}</p>}
            </div>
            <Button type="button" variant="outline" onClick={addPin}>Add PIN</Button>
          </div>
          {draft.pins.length > 0 && (
            <ul aria-label="Selected PIN codes" className="flex flex-wrap gap-2">
              {draft.pins.map((pin) => (
                <li key={pin}>
                  <button type="button" onClick={() => updateDraft('pins', draft.pins.filter((item) => item !== pin))} className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-navy-900">
                    {pin}<span className="ml-2" aria-label={`Remove ${pin}`}>×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="max-w-xs">
            <TextField id="radius" label="Radius (km)" type="number" min={1} max={500} value={draft.radius} onChange={(value) => updateDraft('radius', value)} onBlur={() => markTouched('radius')} error={fieldError('radius')} />
          </div>
          <MapPicker
            location={{
              lat: draft.mapLat ?? null,
              lng: draft.mapLng ?? null,
              radiusKm: Math.min(50, Math.max(1, Number(draft.radius) || 10)),
              label: [draft.city, draft.state, draft.country].filter(Boolean).join(', '),
            }}
            pinCodes={draft.pins}
            onPinCodesChange={(pins) => updateDraft('pins', pins)}
            onChange={(location) => {
              updateDraft('city', location.label ?? '')
              updateDraft('radius', String(location.radiusKm))
              updateDraft('mapLat', location.lat)
              updateDraft('mapLng', location.lng)
            }}
          />
        </div>
        <SelectableChips label="Devices" options={advertiserDevices} selected={draft.devices} onToggle={(value) => toggle('devices', value)} />
        <SelectableChips label="Operating systems" options={[...campaignOperatingSystems]} selected={draft.operatingSystems} onToggle={(value) => toggle('operatingSystems', value)} />
        <SelectableChips label="Placements" options={[...campaignPlacementOptions]} selected={draft.placements} onToggle={(value) => toggle('placements', value)} />
        <div className="space-y-4 rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold text-navy-900">Budget</h3>
          <CampaignChoiceCards
            label="Budget type"
            options={[{ label: 'Daily budget', value: 'daily' }, { label: 'Lifetime budget', value: 'lifetime' }]}
            value={draft.budgetType}
            onChange={(value) => {
              updateDraft('budgetType', value as CampaignDraft['budgetType'])
              markTouched('budgetType')
            }}
          />
          {fieldError('budgetType') && <p role="alert" className="-mt-4 text-sm text-red-700">{fieldError('budgetType')}</p>}
          <TextField
            id="budget"
            label="Budget (₹)"
            type="number"
            min={1}
            value={draft.budget}
            onChange={(value) => updateDraft('budget', value)}
            onBlur={() => markTouched('budget')}
            error={fieldError('budget')}
            placeholder="Enter amount in ₹"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="start-date" label="Start date" type="date" value={draft.startDate} onChange={(value) => updateDraft('startDate', value)} onBlur={() => markTouched('startDate')} error={fieldError('startDate')} />
          <TextField id="end-date" label="End date" type="date" value={draft.endDate} onChange={(value) => updateDraft('endDate', value)} onBlur={() => markTouched('endDate')} error={fieldError('endDate')} />
        </div>
        <TextField id="frequency-cap" label="Frequency cap (impressions per person)" type="number" min={1} value={draft.frequencyCap} onChange={(value) => updateDraft('frequencyCap', value)} />
        <section aria-label="Mock audience meter" className="space-y-3 rounded-lg bg-blue-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-navy-900">Audience setup</h3>
            <span className="text-sm text-navy-900">
              {draft.country && (draft.city || draft.state) && draft.interests.length ? 'Focused configuration' : draft.country || draft.interests.length ? 'Partially configured' : 'Not configured'}
            </span>
          </div>
          <Progress value={draft.country && (draft.city || draft.state) && draft.interests.length ? 100 : draft.country || draft.interests.length ? 50 : 0} aria-label="Mock audience configuration completeness" />
          <p className="text-xs text-slate-600">Mock configuration indicator only. It does not estimate audience size or reach.</p>
        </section>
        <Accordion type="single" collapsible value={advancedOpen ? 'advanced' : ''} onValueChange={(value) => setAdvancedOpen(value === 'advanced')}>
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced</AccordionTrigger>
            <AccordionContent className="space-y-5">
              <CampaignChoiceCards
                label="Pricing type"
                options={['CPM', 'CPC', 'CPA'].map((value) => ({ label: value, value }))}
                value={draft.pricingType}
                onChange={(value) => updateDraft('pricingType', value)}
                columns={3}
              />
              <CampaignChoiceCards
                label="Ad unit"
                options={advertiserAdUnits.map((unit) => ({ label: unit, value: unit }))}
                value={draft.adUnit}
                onChange={(value) => {
                  updateDraft('adUnit', value)
                  markTouched('adUnit')
                }}
                columns={3}
              />
              {fieldError('adUnit') && <p role="alert" className="-mt-4 text-sm text-red-700">{fieldError('adUnit')}</p>}
              <TextField id="capping" label="Additional capping notes" value={draft.capping} onChange={(value) => updateDraft('capping', value)} placeholder="Optional delivery cap notes" />
              <TextField id="blacklist" label="Blacklist / whitelist" value={draft.blacklist} onChange={(value) => updateDraft('blacklist', value)} placeholder="Optional domains or categories" />
              <TextField id="ip-range" label="IP range" value={draft.ipRange} onChange={(value) => updateDraft('ipRange', value)} placeholder="Optional CIDR range" />
              <TextField id="custom-bid" label="Custom bid (₹)" type="number" min={0} value={draft.customBid} onChange={(value) => updateDraft('customBid', value)} />
              <p className="text-xs text-slate-600">Delivery, pricing, capping, and targeting rules require real backend enforcement before launch.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Ad</CardTitle>
        <p className="text-sm text-slate-600">Add creative and preview how the ad may appear.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="creative-image">Creative image</Label>
          <Input
            ref={fileInputRef}
            id="creative-image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            aria-describedby={imageError ? 'creative-image-error' : undefined}
          />
          <p className="text-xs text-slate-500">PNG, JPEG, or WebP up to 2 MB. Stored locally in this browser.</p>
          {imageError && <p id="creative-image-error" role="alert" className="text-sm text-red-700">{imageError}</p>}
          {draft.imageDataUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <Image src={draft.imageDataUrl} alt="Campaign creative thumbnail" width={80} height={56} unoptimized className="h-14 w-20 rounded-lg object-cover" />
              <p className="min-w-0 flex-1 truncate text-sm text-navy-900">{draft.imageName}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  updateDraft('imageName', '')
                  updateDraft('imageDataUrl', '')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
        <TextField
          id="headline"
          label="Headline"
          value={draft.headline}
          onChange={(value) => updateDraft('headline', value)}
          onBlur={() => markTouched('headline')}
          error={fieldError('headline')}
          placeholder="Write a concise headline"
        />
        <div className="space-y-2">
          <Label htmlFor="primary-text">Primary text</Label>
          <Textarea
            id="primary-text"
            value={draft.primaryText}
            onChange={(event) => updateDraft('primaryText', event.target.value)}
            onBlur={() => markTouched('primaryText')}
            aria-invalid={Boolean(fieldError('primaryText'))}
            aria-describedby={fieldError('primaryText') ? 'primary-text-error' : undefined}
            rows={4}
            placeholder="Describe the offer or message"
          />
          {fieldError('primaryText') && <p id="primary-text-error" className="text-sm text-red-700">{fieldError('primaryText')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} rows={2} placeholder="Optional supporting details" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="call-to-action">Call to action</Label>
          <Select
            value={draft.callToAction}
            onValueChange={(value) => {
              updateDraft('callToAction', value)
              markTouched('callToAction')
            }}
          >
            <SelectTrigger id="call-to-action" aria-invalid={Boolean(fieldError('callToAction'))}>
              <SelectValue placeholder="Choose a CTA" />
            </SelectTrigger>
            <SelectContent>{campaignCallToActions.map((cta) => <SelectItem key={cta} value={cta}>{cta}</SelectItem>)}</SelectContent>
          </Select>
          {fieldError('callToAction') && <p role="alert" className="text-sm text-red-700">{fieldError('callToAction')}</p>}
        </div>
        <TextField
          id="landing-url"
          label="Landing page URL"
          type="url"
          value={draft.landingUrl}
          onChange={(value) => updateDraft('landingUrl', value)}
          onBlur={() => markTouched('landingUrl')}
          error={fieldError('landingUrl')}
          placeholder="https://example.com"
        />
        <Tabs defaultValue="desktop">
          <TabsList aria-label="Ad preview size">
            <TabsTrigger value="desktop">Desktop</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>
          <TabsContent value="desktop"><AdPreview draft={draft} mobile={false} /></TabsContent>
          <TabsContent value="mobile"><AdPreview draft={draft} mobile /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  const actionFooter = reviewing ? (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => setReviewing(false)}>Back to Ad</Button>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={saveDraft}>Save draft</Button>
            <Button type="button" onClick={publishMockCampaign} disabled={!canPublish}>Publish</Button>
          </div>
        </div>
        {!canPublish && (
          <p role="status" className="text-sm text-amber-800">
            Complete the required fields in the missing-info list before publishing.
          </p>
        )}
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardContent className="flex flex-wrap justify-between gap-3 p-4">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={saveDraft}>Save draft</Button>
          {step < 2
            ? <Button type="button" onClick={continueToNextStep}>Continue</Button>
            : <Button type="button" onClick={openReview}>Review campaign</Button>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser' }, { label: 'Campaigns', href: '/campaigns' }, { label: 'New' }]}
        title="Create campaign"
        description="Build a campaign, ad set, and creative. Changes are saved locally in this browser."
        action={<Button type="button" variant="outline" onClick={saveDraft}>Save draft</Button>}
      />
      {!isHydrated && (
        <div role="status" className="h-1 w-full rounded-lg bg-slate-200">
          <span className="sr-only">Restoring saved campaign draft</span>
        </div>
      )}
      <Stepper
        steps={['Campaign', 'Ad Set', 'Ad']}
        current={step}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {reviewing ? (
            <Card>
              <CardHeader>
                <CardTitle>Review campaign</CardTitle>
                <p className="text-sm text-slate-600">Review the values you entered before the mock publish action.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="rounded-lg bg-blue-50 p-3 text-sm text-navy-900">
                  Nothing has been filled in automatically. “Not set” means you have not entered a value.
                </p>
                {missingRequired.length > 0 && (
                  <section aria-labelledby="missing-required-title" className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                    <h3 id="missing-required-title" className="font-semibold text-amber-950">Missing required information</h3>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900">
                      {missingRequired.map((field) => <li key={field}>{validationErrors[field]}</li>)}
                    </ul>
                  </section>
                )}
                <section aria-labelledby="optional-missing-title" className="rounded-lg border border-slate-200 p-4">
                  <h3 id="optional-missing-title" className="font-semibold text-navy-900">Optional information not provided</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {!draft.country && <li>No country targeting is selected; no location is assumed.</li>}
                    {!draft.interests.length && <li>No interest targeting is selected.</li>}
                    {!draft.imageDataUrl && <li>No creative image is uploaded; the preview shows a placeholder.</li>}
                    {!draft.startDate && !draft.endDate && <li>No campaign schedule dates are set.</li>}
                    {!draft.pricingType && <li>No advanced pricing type is set.</li>}
                  </ul>
                </section>
                <SummarySection title="Campaign" rows={campaignRows} onEdit={() => { setStep(0); setReviewing(false) }} />
                <SummarySection title="Ad Set" rows={adSetRows} onEdit={() => { setStep(1); setReviewing(false) }} />
                <SummarySection title="Ad" rows={adRows} onEdit={() => setReviewing(false)} />
              </CardContent>
            </Card>
          ) : stepContent}
          {actionFooter}
        </div>
        <aside className="order-last min-w-0 lg:order-none" aria-label="Campaign preview">
          <LivePreview draft={draft} />
        </aside>
      </div>
      <Dialog
        open={Boolean(pendingNavigation)}
        onOpenChange={(open) => {
          if (!open) setPendingNavigation(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave without saving?</DialogTitle>
            <DialogDescription>Your changes are autosaved in this browser, but they may not be ready to publish.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingNavigation(null)}>Stay on this page</Button>
            <Button
              type="button"
              onClick={() => {
                if (!pendingNavigation) return
                setIsDirty(false)
                router.push(pendingNavigation)
                setPendingNavigation(null)
              }}
            >
              Leave page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
