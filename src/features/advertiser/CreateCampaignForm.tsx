'use client'

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FormField } from '@/components/shared/FormField'
import { Toggle } from '@/components/shared/Toggle'
import { Input } from '@/components/ui/Input'
import {
  advertiserAdUnits,
  advertiserConnections,
  advertiserCountries,
  advertiserCountriesTarget,
  advertiserCountriesLocations,
  advertiserDevices,
  advertiserPricingTypes,
  advertiserTrafficTypes,
  targetingCategories,
  targetingOptions,
} from '@/data/advertiser'

type CountryBudget = { id: string; country: string; price: string }
type LocationRule = { id: string; country: string; region: string; city: string; mode: 'Include' | 'Exclude' }
type TargetingRule = { id: string; value: string; include: boolean }
type UploadedImage = { id: string; url: string; name: string }

const shortInput = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

function ChoiceCards({
  label,
  name,
  values,
  value,
  onChange,
  onTouch,
}: {
  label: string
  name: string
  values: readonly string[]
  value: string
  onChange: (value: string) => void
  onTouch?: () => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {values.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              className="peer sr-only"
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              onBlur={onTouch}
            />
            <span className={`block rounded-xl border p-3 text-center text-sm font-medium transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 ${
              value === option ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-700 hover:border-brand-500'
            }`}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function CampaignReview({
  values,
  onEdit,
  onSubmit,
}: {
  values: { [key: string]: string }
  onEdit: () => void
  onSubmit: () => void
}) {
  return (
    <Card className="p-6 sm:p-8">
      <Badge tone="warning">Mock review</Badge>
      <h1 className="mt-4 text-2xl font-bold text-navy-900">Review your campaign</h1>
      <p className="mt-2 text-sm text-slate-600">Confirm these details before submitting this mock campaign.</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {Object.entries(values).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-100 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-navy-900">{value || 'Not set'}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onEdit}>Edit campaign</Button>
        <Button type="button" onClick={onSubmit}>Submit campaign</Button>
      </div>
    </Card>
  )
}

export function CreateCampaignForm({ initialCountry = '', initialAdUnit = '' }: { initialCountry?: string; initialAdUnit?: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [device, setDevice] = useState('')
  const [traffic, setTraffic] = useState('')
  const [connection, setConnection] = useState('')
  const [adUnit, setAdUnit] = useState(advertiserAdUnits.includes(initialAdUnit) ? initialAdUnit : '')
  const [pricing, setPricing] = useState('')
  const [landingUrl, setLandingUrl] = useState('')
  const [screenshots, setScreenshots] = useState<UploadedImage[]>([])
  const [uploadError, setUploadError] = useState('')
  const [country, setCountry] = useState(advertiserCountries.includes(initialCountry) ? initialCountry : '')
  const [countryPrice, setCountryPrice] = useState('')
  const [countries, setCountries] = useState<CountryBudget[]>([])
  const [locationCountry, setLocationCountry] = useState('')
  const [locationRegion, setLocationRegion] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [locationMode, setLocationMode] = useState<'Include' | 'Exclude'>('Include')
  const [locations, setLocations] = useState<LocationRule[]>([])
  const [unlimitedBudget, setUnlimitedBudget] = useState(false)
  const [totalBudget, setTotalBudget] = useState('')
  const [startTime, setStartTime] = useState('Start once approved')
  const [scheduledAt, setScheduledAt] = useState('')
  const [activeTargetTab, setActiveTargetTab] = useState(targetingCategories[0])
  const [targeting, setTargeting] = useState<Record<string, TargetingRule[]>>({})
  const [cappingUnlimited, setCappingUnlimited] = useState(true)
  const [impressionLimit, setImpressionLimit] = useState('')
  const [impressionBudget, setImpressionBudget] = useState('')
  const [impressionPeriod, setImpressionPeriod] = useState('Daily')
  const [budgetLimitUnlimited, setBudgetLimitUnlimited] = useState(true)
  const [budgetLimit, setBudgetLimit] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState('Daily')
  const [advancedOpen, setAdvancedOpen] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [review, setReview] = useState(false)
  const [success, setSuccess] = useState(false)

  const urlError = useMemo(() => {
    if (!landingUrl.trim()) return 'Enter a landing URL.'
    if (landingUrl.length > 1000) return 'Landing URL must be no more than 1000 characters.'
    try {
      const url = new URL(landingUrl)
      return url.protocol === 'https:' ? undefined : 'Use a secure https:// URL.'
    } catch {
      return 'Enter a valid https:// URL.'
    }
  }, [landingUrl])

  const requiredErrors = {
    name: name.trim() ? undefined : 'Enter a campaign name.',
    device: device ? undefined : 'Choose a device format.',
    traffic: traffic ? undefined : 'Choose a traffic type.',
    connection: connection ? undefined : 'Choose a connection type.',
    adUnit: adUnit ? undefined : 'Choose an ad unit.',
    pricing: pricing ? undefined : 'Choose a pricing type.',
    landingUrl: urlError,
    countries: countries.length ? undefined : 'Add at least one country.',
    budget: unlimitedBudget || (Number(totalBudget) > 0) ? undefined : 'Enter a budget greater than zero or enable Unlimited.',
    schedule: startTime !== 'Schedule' || scheduledAt ? undefined : 'Choose a scheduled start time.',
  }

  function handleScreenshots(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    setUploadError('')
    const accepted = files.filter((file) => ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 2 * 1024 * 1024)
    if (files.some((file) => !['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024)) {
      setUploadError('Choose JPEG or PNG images up to 2 MB each.')
    }
    const remaining = Math.max(0, 3 - screenshots.length)
    if (files.length > remaining) setUploadError('You can add up to 3 screenshots.')
    setScreenshots((current) => [
      ...current,
      ...accepted.slice(0, remaining).map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    ])
    event.target.value = ''
  }

  function addCountry() {
    if (!country || Number(countryPrice) <= 0 || countries.some((item) => item.country === country)) return
    setCountries((current) => [...current, { id: `${country}-${Date.now()}`, country, price: countryPrice }])
    setCountry('')
    setCountryPrice('')
  }

  function addLocation() {
    if (!locationCountry || !locationRegion || !locationCity) return
    setLocations((current) => [...current, {
      id: `${locationCountry}-${locationRegion}-${locationCity}-${Date.now()}`,
      country: locationCountry,
      region: locationRegion,
      city: locationCity,
      mode: locationMode,
    }])
    setLocationCountry('')
    setLocationRegion('')
    setLocationCity('')
  }

  function addTargetingRule() {
    const options = targetingOptions[activeTargetTab]
    setTargeting((current) => ({
      ...current,
      [activeTargetTab]: [
        ...(current[activeTargetTab] ?? []),
        { id: `${activeTargetTab}-${Date.now()}`, value: options[0], include: true },
      ],
    }))
  }

  function updateTargetingRule(id: string, changes: Partial<TargetingRule>) {
    setTargeting((current) => ({
      ...current,
      [activeTargetTab]: (current[activeTargetTab] ?? []).map((rule) => rule.id === id ? { ...rule, ...changes } : rule),
    }))
  }

  function proceedToReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setTouched(Object.fromEntries(Object.keys(requiredErrors).map((key) => [key, true])))
    if (Object.values(requiredErrors).some(Boolean)) return
    setReview(true)
  }

  function submitCampaign() {
    setSuccess(true)
  }

  function closeSuccess() {
    router.push('/campaigns')
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <Badge tone="success">Mock submission</Badge>
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Campaign submitted</h1>
        <p className="mt-2 text-sm text-slate-600">This is a demo confirmation. No campaign was sent to a backend.</p>
        <Button type="button" className="mt-6" onClick={closeSuccess}>Back to campaigns</Button>
      </Card>
    )
  }

  const reviewValues = {
    'Campaign name': name,
    'Device format': device,
    'Traffic type': traffic,
    'Connection type': connection,
    'Ad unit': adUnit,
    'Pricing type': pricing,
    'Landing URL': landingUrl,
    Countries: countries.map((item) => `${item.country} (₹${item.price})`).join(', '),
    Locations: locations.map((item) => `${item.mode}: ${item.city}, ${item.region}, ${item.country}`).join('; ') || 'Any',
    'Total budget': unlimitedBudget ? 'Unlimited' : `₹${totalBudget}`,
    'Start time': startTime === 'Schedule' ? scheduledAt : startTime,
  }

  if (review) {
    return <CampaignReview values={reviewValues} onEdit={() => setReview(false)} onSubmit={submitCampaign} />
  }

  const showError = (key: string) => (submitted || touched[key]) ? requiredErrors[key as keyof typeof requiredErrors] : undefined

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6">
        <Link href="/campaigns" className="text-sm font-medium text-brand-700 hover:underline">← Campaigns</Link>
        <p className="mt-3 text-sm font-medium text-brand-700">Advertiser workspace</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900">Create Campaign</h1>
        <p className="mt-2 text-sm text-slate-600">Demo setup only. No campaign, tracking, or payment is processed.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="space-y-6" onSubmit={proceedToReview} noValidate>
          <Card className="space-y-5 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-navy-900">Campaign settings</h2>
            <Input
              id="campaign-name"
              label="Campaign name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, name: true }))}
              error={showError('name')}
              maxLength={100}
            />
            <ChoiceCards label="Device format" name="device-format" values={advertiserDevices} value={device} onChange={(value) => { setDevice(value); setTouched((current) => ({ ...current, device: true })) }} onTouch={() => setTouched((current) => ({ ...current, device: true }))} />
            {showError('device') && <p className="-mt-3 text-xs text-danger-600" role="alert">{showError('device')}</p>}
            <ChoiceCards label="Traffic type" name="traffic-type" values={advertiserTrafficTypes} value={traffic} onChange={(value) => { setTraffic(value); setTouched((current) => ({ ...current, traffic: true })) }} onTouch={() => setTouched((current) => ({ ...current, traffic: true }))} />
            {showError('traffic') && <p className="-mt-3 text-xs text-danger-600" role="alert">{showError('traffic')}</p>}
            <ChoiceCards label="Connection type" name="connection-type" values={advertiserConnections} value={connection} onChange={(value) => { setConnection(value); setTouched((current) => ({ ...current, connection: true })) }} onTouch={() => setTouched((current) => ({ ...current, connection: true }))} />
            {showError('connection') && <p className="-mt-3 text-xs text-danger-600" role="alert">{showError('connection')}</p>}
            <ChoiceCards label="Ad unit" name="ad-unit" values={advertiserAdUnits} value={adUnit} onChange={(value) => { setAdUnit(value); setTouched((current) => ({ ...current, adUnit: true })) }} onTouch={() => setTouched((current) => ({ ...current, adUnit: true }))} />
            {showError('adUnit') && <p className="-mt-3 text-xs text-danger-600" role="alert">{showError('adUnit')}</p>}
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">Pricing type</legend>
              <div className="flex flex-wrap gap-4">
                {advertiserPricingTypes.map((option) => (
                  <label key={option} className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="pricing" value={option} checked={pricing === option} onChange={() => { setPricing(option); setTouched((current) => ({ ...current, pricing: true })) }} onBlur={() => setTouched((current) => ({ ...current, pricing: true }))} className="accent-brand-600" />
                    {option}
                  </label>
                ))}
              </div>
              {showError('pricing') && <p className="mt-1.5 text-xs text-danger-600" role="alert">{showError('pricing')}</p>}
            </fieldset>
          </Card>

          <Card className="space-y-5 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-navy-900">Landing page &amp; screenshots</h2>
            <Input
              id="landing-url"
              label="Landing URL"
              type="url"
              value={landingUrl}
              onChange={(event) => setLandingUrl(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, landingUrl: true }))}
              error={showError('landingUrl')}
              maxLength={1000}
              placeholder="https://example.com"
              aria-describedby="landing-url-help"
            />
            <p id="landing-url-help" className="-mt-3 text-xs text-slate-500">{landingUrl.length}/1000 characters. Use a secure https URL.</p>
            <div>
              <label htmlFor="campaign-images" className="text-sm font-medium text-slate-700">Screenshots (optional)</label>
              <p className="mt-1 text-xs text-slate-500">Up to 3 JPEG or PNG images, maximum 2 MB each.</p>
              <input
                id="campaign-images"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                disabled={screenshots.length >= 3}
                onChange={handleScreenshots}
                className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              />
              {uploadError && <p className="mt-1 text-xs text-danger-600" role="alert">{uploadError}</p>}
              <div className="mt-3 flex flex-wrap gap-3">
                {screenshots.map((image) => (
                  <div key={image.id} className="relative">
                    <Image src={image.url} alt={`Preview of ${image.name}`} width={112} height={80} unoptimized className="h-20 w-28 rounded-lg border border-slate-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(image.url)
                        setScreenshots((current) => current.filter((item) => item.id !== image.id))
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-white px-2 py-1 text-xs font-semibold shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      aria-label={`Remove ${image.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-5 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-navy-900">Countries &amp; locations</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <FormField id="campaign-country" label="Country" error={touched.country && !country ? 'Choose a country.' : undefined}>
                <select id="campaign-country" value={country} onChange={(event) => setCountry(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, country: true }))} aria-invalid={Boolean(touched.country && !country)} aria-describedby={touched.country && !country ? 'campaign-country-error' : undefined} className={shortInput}>
                  <option value="">Choose a country</option>
                  {advertiserCountriesTarget.filter((item) => !countries.some((entry) => entry.country === item)).map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <Input id="country-price" label="Price (₹)" type="number" min="0.01" step="0.01" value={countryPrice} onChange={(event) => setCountryPrice(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, countryPrice: true }))} error={touched.countryPrice && Number(countryPrice) <= 0 ? 'Enter a price greater than zero.' : undefined} placeholder="e.g. 25" />
              <Button type="button" variant="outline" onClick={() => { setTouched((current) => ({ ...current, country: true, countryPrice: true })); addCountry() }} disabled={!country || Number(countryPrice) <= 0}>Add Country</Button>
            </div>
            {countries.length > 0 && (
              <ul className="space-y-2" aria-label="Added countries">
                {countries.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span>{item.country} · ₹{item.price}</span>
                    <Button type="button" variant="ghost" className="px-2 py-1 text-danger-600" onClick={() => setCountries((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`Remove ${item.country}`}>Remove</Button>
                  </li>
                ))}
              </ul>
            )}
            {showError('countries') && <p className="text-xs text-danger-600" role="alert">{showError('countries')}</p>}

            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-medium text-navy-900">Location targeting (optional)</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <FormField id="location-country" label="Country">
                  <select id="location-country" value={locationCountry} onChange={(event) => { setLocationCountry(event.target.value); setLocationRegion(''); setLocationCity('') }} className={shortInput}>
                    <option value="">Choose country</option>
                    {advertiserCountriesTarget.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField id="location-region" label="Region">
                  <select id="location-region" value={locationRegion} onChange={(event) => { setLocationRegion(event.target.value); setLocationCity('') }} disabled={!locationCountry} className={shortInput}>
                    <option value="">Choose region</option>
                    {(advertiserCountriesLocations[locationCountry] ?? []).map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField id="location-city" label="City">
                  <select id="location-city" value={locationCity} onChange={(event) => setLocationCity(event.target.value)} disabled={!locationRegion} className={shortInput}>
                    <option value="">Choose city</option>
                    {locationRegion && [`${locationRegion} City`, `${locationRegion} Central`].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField id="location-mode" label="Rule">
                  <select id="location-mode" value={locationMode} onChange={(event) => setLocationMode(event.target.value as 'Include' | 'Exclude')} className={shortInput}>
                    <option>Include</option><option>Exclude</option>
                  </select>
                </FormField>
              </div>
              <Button type="button" className="mt-3" variant="outline" onClick={addLocation} disabled={!locationCountry || !locationRegion || !locationCity}>Add Location</Button>
              {locations.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {locations.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span>{item.mode}: {item.city}, {item.region}, {item.country}</span>
                      <Button type="button" variant="ghost" className="px-2 py-1" onClick={() => setLocations((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`Remove location ${item.city}`}>Remove</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className="space-y-5 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-navy-900">Budget &amp; schedule</h2>
            <Toggle id="campaign-unlimited-budget" label="Unlimited budget" checked={unlimitedBudget} onChange={setUnlimitedBudget} />
            {!unlimitedBudget && (
              <Input id="campaign-total-budget" label="Total budget (₹)" type="number" min="1" value={totalBudget} onChange={(event) => setTotalBudget(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, budget: true }))} error={showError('budget')} />
            )}
            {unlimitedBudget && <p className="text-xs text-slate-500">Budget is unlimited in this mock setup.</p>}
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">Start time</legend>
              <div className="space-y-2">
                {['Start once approved', 'Schedule', 'Keep inactive'].map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="campaign-start" value={option} checked={startTime === option} onChange={() => setStartTime(option)} className="accent-brand-600" />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            {startTime === 'Schedule' && (
              <Input id="campaign-schedule" label="Scheduled start" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, schedule: true }))} error={showError('schedule')} />
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-navy-900">Additional targeting (optional)</h2>
            <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Targeting categories">
              {targetingCategories.map((tab) => (
                <button key={tab} type="button" role="tab" aria-selected={activeTargetTab === tab} onClick={() => setActiveTargetTab(tab)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${
                  activeTargetTab === tab ? 'border-brand-600 font-semibold text-brand-700' : 'border-transparent text-slate-500'
                }`}>{tab}</button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {(targeting[activeTargetTab] ?? []).map((rule) => (
                <div key={rule.id} className="flex flex-wrap items-center gap-3">
                  <label className="sr-only" htmlFor={`target-${rule.id}`}>{activeTargetTab} rule</label>
                  <select id={`target-${rule.id}`} value={rule.value} onChange={(event) => updateTargetingRule(rule.id, { value: event.target.value })} className={`${shortInput} min-w-48 flex-1`}>
                    {targetingOptions[activeTargetTab].map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={rule.include} onChange={(event) => updateTargetingRule(rule.id, { include: event.target.checked })} className="accent-brand-600" />
                    Include
                  </label>
                  <Button type="button" variant="ghost" className="px-2 py-2" onClick={() => setTargeting((current) => ({ ...current, [activeTargetTab]: (current[activeTargetTab] ?? []).filter((item) => item.id !== rule.id) }))} aria-label={`Delete ${activeTargetTab} rule`}>Delete</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTargetingRule}>Add rule</Button>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-navy-900">Cappings and limits (optional)</h2>
            <div className="mt-5 space-y-6">
              <div className="space-y-3">
                <Toggle id="impressions-unlimited" label="Unlimited impressions" checked={cappingUnlimited} onChange={setCappingUnlimited} />
                {!cappingUnlimited && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input id="impressions-limit" label="Impressions limit" type="number" min="1" value={impressionLimit} onChange={(event) => setImpressionLimit(event.target.value)} />
                    <Input id="impressions-budget" label="Budget (₹)" type="number" min="1" value={impressionBudget} onChange={(event) => setImpressionBudget(event.target.value)} />
                    <FormField id="impressions-period" label="Period"><select id="impressions-period" value={impressionPeriod} onChange={(event) => setImpressionPeriod(event.target.value)} className={shortInput}><option>Daily</option><option>Hourly</option><option>Total</option></select></FormField>
                  </div>
                )}
              </div>
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <Toggle id="budget-limit-unlimited" label="Unlimited budget cap" checked={budgetLimitUnlimited} onChange={setBudgetLimitUnlimited} />
                {!budgetLimitUnlimited && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input id="budget-limit" label="Budget limit (₹)" type="number" min="1" value={budgetLimit} onChange={(event) => setBudgetLimit(event.target.value)} />
                    <FormField id="budget-period" label="Period"><select id="budget-period" value={budgetPeriod} onChange={(event) => setBudgetPeriod(event.target.value)} className={shortInput}><option>Daily</option><option>Hourly</option><option>Total</option></select></FormField>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-navy-900">Advanced settings</h2>
            <p className="mt-1 text-sm text-slate-600">Optional controls are mock placeholders and do not apply real targeting.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Blacklist / Whitelist', 'IP range targeting', 'Custom bid'].map((option) => (
                <Button key={option} type="button" variant={advancedOpen === option ? 'primary' : 'outline'} onClick={() => setAdvancedOpen((current) => current === option ? '' : option)}>{option}</Button>
              ))}
            </div>
            {advancedOpen && (
              <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4" role="region" aria-label={`${advancedOpen} placeholder`}>
                <p className="text-sm font-semibold text-navy-900">{advancedOpen}</p>
                <p className="mt-1 text-sm text-slate-600">Configuration placeholder. Values are not saved or applied.</p>
              </div>
            )}
          </Card>

          <Button type="submit" className="w-full sm:w-auto">Proceed to Review</Button>
        </form>

        <aside className="lg:sticky lg:top-24">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-navy-900">Estimated traffic</h2>
            {adUnit && pricing && countries.length > 0 ? (
              <div className="mt-4 rounded-xl bg-brand-50 p-4">
                <Badge tone="warning">MOCK estimate</Badge>
                <p className="mt-3 text-sm leading-6 text-slate-700">Traffic estimate for {adUnit} with {pricing} pricing in {countries.map((item) => item.country).join(', ')} is a demo placeholder.</p>
                <p className="mt-2 text-xs text-slate-500">Not a prediction or real inventory estimate.</p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">Choose an ad unit, pricing type, and at least one country to see a mock estimate.</p>
            )}
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">Real traffic and campaign performance are not available in this demo.</p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
