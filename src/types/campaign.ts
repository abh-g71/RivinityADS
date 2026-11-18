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

export type CampaignDraft = {
  objective: CampaignObjective | ''
  objectiveDetails: ObjectiveDetails
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
  const draft = {
    ...base,
    ...saved,
    objective,
    objectiveDetails: normalizeObjectiveDetails(saved.objectiveDetails, objective),
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
