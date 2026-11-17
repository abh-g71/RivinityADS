export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

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

export type CampaignDraft = {
  objective: string
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
    label: value?.label ?? (countries.length ? `${countries.join(', ')}${countries.length > 1 ? '' : ''}` : ''),
  }
}

export function migrateCampaignDraft(value: Partial<CampaignDraft> | null | undefined): CampaignDraft {
  const base = createEmptyCampaignDraft()
  if (!value || typeof value !== 'object') return base

  const label = typeof value.location?.label === 'string' ? value.location.label : ''
  const location = normalizeCampaignLocation({
    ...value.location,
    mode: value.location?.mode ?? ('countries' in (value.location ?? {}) ? 'country' : 'country'),
    countries: Array.isArray(value.location?.countries) ? value.location.countries : label ? [label] : [],
    regions: Array.isArray(value.location?.regions) ? value.location.regions : [],
    cities: Array.isArray(value.location?.cities) ? value.location.cities : [],
    pinCodes: Array.isArray(value.location?.pinCodes) ? value.location.pinCodes : Array.isArray(value.pinCodes) ? value.pinCodes : [],
    lat: typeof value.location?.lat === 'number' ? value.location.lat : null,
    lng: typeof value.location?.lng === 'number' ? value.location.lng : null,
    radiusKm: typeof value.location?.radiusKm === 'number' ? value.location.radiusKm : 10,
    label,
  })

  return {
    ...base,
    ...value,
    location,
    pinCodes: Array.isArray(value.pinCodes) ? value.pinCodes : location.pinCodes ?? [],
    interests: Array.isArray(value.interests) ? value.interests : [],
  }
}

export function createEmptyCampaignDraft(): CampaignDraft {
  const defaultLocation = normalizeCampaignLocation({
    mode: 'country',
    countries: ['India'],
    excludeCountries: false,
    regions: [],
    cities: [],
    pin: null,
    pinCodes: [],
    lat: null,
    lng: null,
    radiusKm: 10,
    label: 'India (whole country)',
  })

  return {
    objective: '',
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
