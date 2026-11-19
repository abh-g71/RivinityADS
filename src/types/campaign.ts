export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export type CampaignObjective = 'Get website visits' | 'Get leads' | 'Get sales' | 'Build awareness'

export type LeadFormField = {
  id: 'name' | 'email' | 'phone' | 'city' | 'custom'
  label: string
  enabled: boolean
  required: boolean
}

export type LeadFormDraft = {
  name: string
  fields: LeadFormField[]
  introText: string
  consentText: string
  privacyPolicyUrl: string
  thankYouMessage: string
  thankYouButtonLabel: string
  thankYouButtonUrl: string
}

export type ObjectiveDetails =
  | { objective: 'Get website visits'; trackingTags: boolean; buttonText: 'Learn more' | 'Shop now' | 'Visit site' }
  | { objective: 'Get leads'; leadForm: LeadFormDraft; buttonText: string }
  | { objective: 'Get sales'; productName: string; price: string; offerPrice: string; offerEndDate: string; buttonText: 'Shop now' | 'Buy now' | 'Order now' }
  | { objective: 'Build awareness'; brandName: string; tagline: string; frequency: number; mediaKind: 'image' | 'video'; buttonText: string }

export type CampaignLocation = {
  mode?: 'country' | 'region' | 'city' | 'radius'
  countries?: string[]
  excludeCountries?: boolean
  regions?: string[]
  cities?: string[]
  pin?: { lat: number; lng: number; radiusKm: number } | null
  pinCodes?: string[]
  lat?: number | null
  lng?: number | null
  radiusKm?: number
  label?: string
}

export type CampaignTargetLocation = {
  id: string
  type: 'country' | 'region' | 'city' | 'postal' | 'radius'
  name: string
  label: string
  country: string
  lat: number
  lng: number
  zoom: number
  bounds?: [[number, number], [number, number]]
  radiusKm?: number
  postalCode?: string
}

export type CampaignDraft = {
  objective: CampaignObjective | ''
  objectiveDetails: ObjectiveDetails
  locations: CampaignTargetLocation[]
  // Ad audience targeting only; registration eligibility remains a separate platform policy.
  includedCountries: string[]
  excludedCountries: string[]
  location: CampaignLocation
  ageMin: number
  ageMax: number
  gender: string
  interests: string[]
  dailyBudget: number
  duration: number | 'ongoing'
  headline: string
  text: string
  cta: string
  url: string
  imageName: string
  imageDataUrl: string
  pinCodes: string[]
}

export function createLeadFormDraft(): LeadFormDraft {
  return {
    name: 'Lead form 1',
    fields: [
      { id: 'name', label: 'Name', enabled: true, required: true },
      { id: 'email', label: 'Email', enabled: true, required: true },
      { id: 'phone', label: 'Phone', enabled: false, required: false },
      { id: 'city', label: 'City', enabled: false, required: false },
      { id: 'custom', label: 'Custom question', enabled: false, required: false },
    ],
    introText: '',
    consentText: 'I agree to be contacted about this offer.',
    privacyPolicyUrl: '',
    thankYouMessage: 'Thank you. We will be in touch soon.',
    thankYouButtonLabel: '',
    thankYouButtonUrl: '',
  }
}

export function createObjectiveDetails(objective: CampaignObjective | ''): ObjectiveDetails {
  switch (objective) {
    case 'Get leads':
      return { objective, leadForm: createLeadFormDraft(), buttonText: 'Submit' }
    case 'Get sales':
      return { objective, productName: '', price: '', offerPrice: '', offerEndDate: '', buttonText: 'Shop now' }
    case 'Build awareness':
      return { objective, brandName: '', tagline: '', frequency: 3, mediaKind: 'image', buttonText: 'Learn more' }
    case 'Get website visits':
    default:
      return { objective: 'Get website visits', trackingTags: false, buttonText: 'Learn more' }
  }
}

export function normalizeCampaignLocation(value: Partial<CampaignLocation> | undefined | null): CampaignLocation {
  const mode = value?.mode ?? 'country'
  const lat = typeof value?.lat === 'number' ? value.lat : null
  const lng = typeof value?.lng === 'number' ? value.lng : null
  const radiusKm = typeof value?.radiusKm === 'number' ? value.radiusKm : 10
  const countries = Array.isArray(value?.countries) ? value.countries.filter(Boolean) : []
  const regions = Array.isArray(value?.regions) ? value.regions.filter(Boolean) : []
  const cities = Array.isArray(value?.cities) ? value.cities.filter(Boolean) : []
  const pinCodes = Array.isArray(value?.pinCodes) ? value.pinCodes.filter(Boolean) : []
  const pin = value?.pin ?? (lat !== null && lng !== null ? { lat, lng, radiusKm } : null)

  return {
    mode,
    countries,
    excludeCountries: Boolean(value?.excludeCountries),
    regions,
    cities,
    pin,
    pinCodes,
    lat,
    lng,
    radiusKm,
    label: value?.label ?? (countries.length ? countries.join(', ') : ''),
  }
}

function isCampaignObjective(value: unknown): value is CampaignObjective {
  return value === 'Get website visits' || value === 'Get leads' || value === 'Get sales' || value === 'Build awareness'
}

function normalizeObjectiveDetails(value: unknown, objective: CampaignObjective | ''): ObjectiveDetails {
  const defaults = createObjectiveDetails(objective)
  if (!value || typeof value !== 'object') return defaults
  const saved = value as Record<string, unknown>
  if (saved.objective !== objective) return defaults

  if (objective === 'Get website visits' && 'trackingTags' in defaults) {
    return { ...defaults, trackingTags: Boolean(saved.trackingTags), buttonText: isVisitButton(saved.buttonText) ? saved.buttonText : defaults.buttonText }
  }
  if (objective === 'Get leads' && 'leadForm' in defaults) {
    const form = saved.leadForm && typeof saved.leadForm === 'object' ? saved.leadForm as Record<string, unknown> : {}
    const defaultForm = createLeadFormDraft()
    const fields = Array.isArray(form.fields) ? form.fields : defaultForm.fields
    const normalizedFields = defaultForm.fields.map((field) => {
      const savedField = fields.find((item) => item && typeof item === 'object' && (item as Record<string, unknown>).id === field.id) as Record<string, unknown> | undefined
      return savedField ? {
        ...field,
        label: typeof savedField.label === 'string' ? savedField.label : field.label,
        enabled: typeof savedField.enabled === 'boolean' ? savedField.enabled : field.enabled,
        required: typeof savedField.required === 'boolean' ? savedField.required : field.required,
      } : field
    })
    return {
      ...defaults,
      buttonText: typeof saved.buttonText === 'string' ? saved.buttonText : defaults.buttonText,
      leadForm: {
        name: stringOr(form.name, defaultForm.name).trim() || defaultForm.name,
        fields: normalizedFields,
        introText: stringOr(form.introText, defaultForm.introText),
        consentText: stringOr(form.consentText, defaultForm.consentText),
        privacyPolicyUrl: stringOr(form.privacyPolicyUrl, defaultForm.privacyPolicyUrl),
        thankYouMessage: stringOr(form.thankYouMessage, defaultForm.thankYouMessage),
        thankYouButtonLabel: stringOr(form.thankYouButtonLabel, defaultForm.thankYouButtonLabel),
        thankYouButtonUrl: stringOr(form.thankYouButtonUrl, defaultForm.thankYouButtonUrl),
      },
    }
  }
  if (objective === 'Get sales' && 'productName' in defaults) {
    return {
      ...defaults,
      productName: stringOr(saved.productName, ''),
      price: stringOr(saved.price, ''),
      offerPrice: stringOr(saved.offerPrice, ''),
      offerEndDate: stringOr(saved.offerEndDate, ''),
      buttonText: isSalesButton(saved.buttonText) ? saved.buttonText : defaults.buttonText,
    }
  }
  if (objective === 'Build awareness' && 'brandName' in defaults) {
    return {
      ...defaults,
      brandName: stringOr(saved.brandName, ''),
      tagline: stringOr(saved.tagline, ''),
      frequency: typeof saved.frequency === 'number' ? Math.max(1, Math.min(8, saved.frequency)) : defaults.frequency,
      mediaKind: saved.mediaKind === 'video' ? 'video' : 'image',
      buttonText: typeof saved.buttonText === 'string' ? saved.buttonText : defaults.buttonText,
    }
  }
  return defaults
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback
}
function isVisitButton(value: unknown): value is 'Learn more' | 'Shop now' | 'Visit site' {
  return value === 'Learn more' || value === 'Shop now' || value === 'Visit site'
}
function isSalesButton(value: unknown): value is 'Shop now' | 'Buy now' | 'Order now' {
  return value === 'Shop now' || value === 'Buy now' || value === 'Order now'
}

export function migrateCampaignDraft(value: unknown): CampaignDraft {
  const base = createEmptyCampaignDraft()
  if (!value || typeof value !== 'object') return base
  const saved = value as Partial<CampaignDraft> & Record<string, unknown>
  const objective = isCampaignObjective(saved.objective) ? saved.objective : ''
  const label = typeof saved.location?.label === 'string' ? saved.location.label : ''
  const location = normalizeCampaignLocation({
    ...saved.location,
    countries: Array.isArray(saved.location?.countries) ? saved.location.countries : label ? [label] : [],
    regions: Array.isArray(saved.location?.regions) ? saved.location.regions : [],
    cities: Array.isArray(saved.location?.cities) ? saved.location.cities : [],
    pinCodes: Array.isArray(saved.location?.pinCodes) ? saved.location.pinCodes : Array.isArray(saved.pinCodes) ? saved.pinCodes : [],
    lat: typeof saved.location?.lat === 'number' ? saved.location.lat : null,
    lng: typeof saved.location?.lng === 'number' ? saved.location.lng : null,
    radiusKm: typeof saved.location?.radiusKm === 'number' ? saved.location.radiusKm : 10,
    label,
  })
  const locations = Array.isArray(saved.locations)
    ? saved.locations.flatMap((item, index) => {
      if (!item || typeof item !== 'object') return []
      const target = item as Partial<CampaignTargetLocation>
      if (!['country', 'region', 'city', 'postal', 'radius'].includes(String(target.type))) return []
      if (typeof target.name !== 'string' || typeof target.country !== 'string' || !Number.isFinite(target.lat) || !Number.isFinite(target.lng) || target.lat! < -90 || target.lat! > 90 || target.lng! < -180 || target.lng! > 180) return []
      const type = target.type as CampaignTargetLocation['type']
      return [{
        id: typeof target.id === 'string' ? target.id : `migrated-location-${index}`,
        type,
        name: target.name,
        label: typeof target.label === 'string' ? target.label : `${target.name}, ${target.country}`,
        country: target.country,
        lat: target.lat,
        lng: target.lng,
        zoom: typeof target.zoom === 'number' && Number.isFinite(target.zoom) ? Math.max(1, Math.min(18, target.zoom)) : type === 'country' ? 4 : 10,
        ...(isValidLocationBounds(target.bounds) ? { bounds: target.bounds } : {}),
        ...(type === 'radius' ? { radiusKm: typeof target.radiusKm === 'number' && Number.isFinite(target.radiusKm) ? Math.max(1, Math.min(50, target.radiusKm)) : 10 } : {}),
        ...(type === 'postal' ? { postalCode: typeof target.postalCode === 'string' ? target.postalCode : target.name } : {}),
      }]
    })
    : migrateLegacyLocations(location, saved.pinCodes, saved.location?.mode === 'radius' || Boolean(saved.location?.pin) || /pinned area/i.test(label))
  const includedCountries = uniqueStrings(saved.includedCountries, ['India'])
  const excludedCountries = uniqueStrings(saved.excludedCountries).filter((country) => !includedCountries.includes(country))
  const draft = {
    ...base,
    ...saved,
    objective,
    objectiveDetails: normalizeObjectiveDetails(saved.objectiveDetails, objective),
    locations,
    includedCountries,
    excludedCountries,
    location,
    interests: Array.isArray(saved.interests) ? saved.interests.filter((item): item is string => typeof item === 'string') : [],
    pinCodes: Array.isArray(saved.pinCodes) ? saved.pinCodes.filter((item): item is string => typeof item === 'string') : location.pinCodes ?? [],
    ageMin: typeof saved.ageMin === 'number' ? saved.ageMin : base.ageMin,
    ageMax: typeof saved.ageMax === 'number' ? saved.ageMax : base.ageMax,
    dailyBudget: typeof saved.dailyBudget === 'number' ? saved.dailyBudget : base.dailyBudget,
    duration: typeof saved.duration === 'number' || saved.duration === 'ongoing' ? saved.duration : base.duration,
    headline: stringOr(saved.headline, base.headline),
    text: stringOr(saved.text, base.text),
    cta: stringOr(saved.cta, base.cta),
    url: stringOr(saved.url, base.url),
    imageName: stringOr(saved.imageName, base.imageName),
    imageDataUrl: stringOr(saved.imageDataUrl, base.imageDataUrl),
  }
  return draft as CampaignDraft
}

export function createEmptyCampaignDraft(): CampaignDraft {
  const defaultLocation = normalizeCampaignLocation({
    mode: 'country', countries: ['India'], excludeCountries: false, regions: [], cities: [], pin: null,
    pinCodes: [], lat: null, lng: null, radiusKm: 10, label: 'India (whole country)',
  })

  return {
    objective: '',
    objectiveDetails: createObjectiveDetails(''),
    locations: [],
    includedCountries: ['India'],
    excludedCountries: [],
    location: defaultLocation,
    ageMin: 18,
    ageMax: 65,
    gender: 'Everyone',
    interests: [],
    dailyBudget: 0,
    duration: 7,
    headline: '',
    text: '',
    cta: 'Learn more',
    url: '',
    imageName: '',
    imageDataUrl: '',
    pinCodes: [],
  }
}

function uniqueStrings(value: unknown, fallback: string[] = []): string[] {
  const items = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : fallback
  return [...new Set(items.map((item) => item.trim()))]
}

function isValidLocationBounds(value: unknown): value is [[number, number], [number, number]] {
  if (!Array.isArray(value) || value.length !== 2) return false
  return value.every((point) => Array.isArray(point) && point.length === 2
    && typeof point[0] === 'number' && Number.isFinite(point[0]) && point[0] >= -90 && point[0] <= 90
    && typeof point[1] === 'number' && Number.isFinite(point[1]) && point[1] >= -180 && point[1] <= 180)
}

function migrateLegacyLocations(location: CampaignLocation, legacyPinCodes: unknown, legacyRadius: boolean): CampaignTargetLocation[] {
  const locations: CampaignTargetLocation[] = []
  const country = location.countries?.[0] || 'India'
  const label = location.label?.trim() ?? ''
  const knownCountryNames = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates', 'UAE', 'Germany', 'Singapore', 'France', 'Japan', 'Brazil', 'Saudi Arabia', 'South Africa', 'Indonesia', 'Thailand', 'Netherlands', 'Spain', 'Italy', 'New Zealand', 'Ireland', 'Malaysia', 'Mexico', 'Nigeria', 'Sweden', 'Switzerland']
  if (legacyRadius && typeof location.lat === 'number' && typeof location.lng === 'number') {
    const radiusKm = Math.max(1, Math.min(50, location.pin?.radiusKm || location.radiusKm || 10))
    const name = label || 'Pinned area'
    locations.push({ id: 'migrated-radius', type: 'radius', name, label: `${radiusKm} km around ${name}, ${country}`, country, lat: location.lat, lng: location.lng, zoom: 11, radiusKm })
  } else if (location.lat !== null && location.lat !== undefined && location.lng !== null && location.lng !== undefined && label && !knownCountryNames.includes(label.replace(/\s*\(whole country\)$/i, ''))) {
    locations.push({ id: 'migrated-city', type: 'city', name: label.replace(/\s*\(whole country\)$/i, ''), label: `${label.replace(/\s*\(whole country\)$/i, '')}, India`, country: 'India', lat: location.lat, lng: location.lng, zoom: 10 })
  } else if (location.mode === 'country' && (location.countries?.length || label) && !/pin code/i.test(label)) {
    for (const name of location.countries?.length ? location.countries : [country]) locations.push({ id: `migrated-country-${name}`, type: 'country', name, label: name, country: name, lat: name === 'India' ? 20.5937 : 0, lng: name === 'India' ? 78.9629 : 0, zoom: 4 })
  } else if (location.mode === 'region' && location.regions?.length) {
    for (const name of location.regions) locations.push({ id: `migrated-region-${name}`, type: 'region', name, label: `${name}, ${country}`, country, lat: location.lat ?? 20.5937, lng: location.lng ?? 78.9629, zoom: 6 })
  } else if (location.mode === 'city' && location.cities?.length) {
    for (const name of location.cities) locations.push({ id: `migrated-city-${name}`, type: 'city', name, label: `${name}, ${country}`, country, lat: location.lat ?? 20.5937, lng: location.lng ?? 78.9629, zoom: 10 })
  } else if (label && !/no location/i.test(label)) {
    locations.push({ id: 'migrated-place', type: 'city', name: label, label: `${label}, ${country}`, country, lat: location.lat ?? 20.5937, lng: location.lng ?? 78.9629, zoom: 10 })
  }
  const pinCodes = uniqueStrings(legacyPinCodes ?? location.pinCodes).filter((pin) => /^\d{6}$/.test(pin))
  for (const postalCode of pinCodes) {
    const prefix = postalCode.slice(0, 2)
    locations.push({ id: `migrated-postal-${postalCode}`, type: 'postal', name: postalCode, label: `${postalCode}, India`, country: 'India', postalCode, lat: prefix === '11' ? 28.6139 : prefix === '40' ? 19.076 : 20.5937, lng: prefix === '11' ? 77.209 : prefix === '40' ? 72.8777 : 78.9629, zoom: 13 })
  }
  return locations
}
