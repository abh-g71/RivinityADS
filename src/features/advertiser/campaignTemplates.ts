import type { CampaignDraft } from '@/types/campaign'

export const campaignDraftStorageKey = 'rivinityads.guided-campaign-draft.v1'

export const campaignTemplates: {
  id: string
  name: string
  description: string
  draft: CampaignDraft
}[] = [
  {
    id: 'local-shop',
    name: 'Local shop',
    description: 'Reach nearby people and bring them to your shop.',
    draft: {
      objective: 'Get website visits',
      location: { lat: 19.076, lng: 72.8777, radiusKm: 8, label: 'Mumbai' },
      ageMin: 18,
      ageMax: 65,
      gender: 'Everyone',
      interests: ['Shopping'],
      dailyBudget: 500,
      duration: 7,
      headline: 'Discover our local shop',
      text: 'Explore what is new at our shop. Visit us today.',
      cta: 'Learn more',
      url: 'https://example.com/shop',
      imageName: '',
      imageDataUrl: '',
      pinCodes: [],
    },
  },
  {
    id: 'online-store',
    name: 'Online store',
    description: 'Show products to people who shop online.',
    draft: {
      objective: 'Get sales',
      location: { lat: null, lng: null, radiusKm: 15, label: 'India' },
      ageMin: 18,
      ageMax: 65,
      gender: 'Everyone',
      interests: ['Shopping'],
      dailyBudget: 500,
      duration: 7,
      headline: 'Find something you will love',
      text: 'Browse our latest collection and find your next favorite.',
      cta: 'Shop now',
      url: 'https://example.com/store',
      imageName: '',
      imageDataUrl: '',
      pinCodes: [],
    },
  },
  {
    id: 'event',
    name: 'Event',
    description: 'Help more people discover your upcoming event.',
    draft: {
      objective: 'Build awareness',
      location: { lat: 12.9716, lng: 77.5946, radiusKm: 20, label: 'Bengaluru' },
      ageMin: 18,
      ageMax: 65,
      gender: 'Everyone',
      interests: ['Events'],
      dailyBudget: 500,
      duration: 7,
      headline: 'You are invited',
      text: 'Discover the details and plan to join us.',
      cta: 'Learn more',
      url: 'https://example.com/event',
      imageName: '',
      imageDataUrl: '',
      pinCodes: [],
    },
  },
]
