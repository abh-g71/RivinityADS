export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export type CampaignLocation = {
  lat: number | null
  lng: number | null
  radiusKm: number
  label: string
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

export function createEmptyCampaignDraft(): CampaignDraft {
  return {
    objective: '',
    location: { lat: null, lng: null, radiusKm: 10, label: '' },
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
