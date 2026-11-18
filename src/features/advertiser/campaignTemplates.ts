import { createEmptyCampaignDraft, createObjectiveDetails, type CampaignDraft, type CampaignObjective } from '@/types/campaign'

export const campaignDraftStorageKey = 'rivinityads.guided-campaign-draft.v1'

function makeTemplate(
  objective: CampaignObjective,
  values: Partial<CampaignDraft>,
): CampaignDraft {
  return {
    ...createEmptyCampaignDraft(),
    ...values,
    objective,
    objectiveDetails: values.objectiveDetails ?? createObjectiveDetails(objective),
  }
}

export const campaignTemplates: {
  id: string
  name: string
  description: string
  draft: CampaignDraft
}[] = [
  {
    id: 'local-shop',
    name: 'Local shop visits',
    description: 'Bring nearby shoppers to your website.',
    draft: makeTemplate('Get website visits', {
      location: { lat: 19.076, lng: 72.8777, radiusKm: 8, label: 'Mumbai' },
      interests: ['Shopping'], dailyBudget: 500, duration: 7,
      headline: 'Discover our local shop', text: 'Explore what is new at our shop. Visit us today.',
      cta: 'Learn more', url: 'https://example.com/shop',
    }),
  },
  {
    id: 'local-shop-leads',
    name: 'Local shop leads',
    description: 'Collect contact details from nearby customers.',
    draft: makeTemplate('Get leads', {
      location: { lat: 19.076, lng: 72.8777, radiusKm: 8, label: 'Mumbai' },
      interests: ['Shopping'], dailyBudget: 500, duration: 7,
      headline: 'Ask us about our local offers', text: 'Leave your details and our team will get in touch.',
      cta: 'Sign up',
      objectiveDetails: {
        ...createObjectiveDetails('Get leads'),
        objective: 'Get leads',
        leadForm: {
          name: 'Local shop enquiry',
          fields: [
            { id: 'name', label: 'Name', enabled: true, required: true },
            { id: 'email', label: 'Email', enabled: true, required: true },
            { id: 'phone', label: 'Phone', enabled: true, required: false },
            { id: 'city', label: 'City', enabled: false, required: false },
            { id: 'custom', label: '', enabled: false, required: false },
          ],
          introText: '', consentText: 'I agree to be contacted about this offer.',
          privacyPolicyUrl: 'https://example.com/privacy', thankYouMessage: 'Thank you. We will be in touch soon.',
          thankYouButtonLabel: '', thankYouButtonUrl: '',
        },
      },
    }),
  },
  {
    id: 'online-store',
    name: 'Online store',
    description: 'Promote a product and invite customers to order.',
    draft: makeTemplate('Get sales', {
      location: { lat: null, lng: null, radiusKm: 15, label: 'India' },
      interests: ['Shopping'], dailyBudget: 500, duration: 7,
      headline: 'Find something you will love', text: 'Browse our latest collection and find your next favorite.',
      cta: 'Shop now', url: 'https://example.com/store',
      objectiveDetails: { objective: 'Get sales', productName: 'New season collection', price: '1499', offerPrice: '', offerEndDate: '', buttonText: 'Shop now' },
    }),
  },
  {
    id: 'event',
    name: 'Event awareness',
    description: 'Introduce your upcoming event to a local audience.',
    draft: makeTemplate('Build awareness', {
      location: { lat: 12.9716, lng: 77.5946, radiusKm: 20, label: 'Bengaluru' },
      interests: ['Events'], dailyBudget: 500, duration: 7,
      headline: 'You are invited', text: 'Discover the details and plan to join us.',
      cta: 'Learn more', url: 'https://example.com/event',
      objectiveDetails: { objective: 'Build awareness', brandName: 'Rivinity events', tagline: 'Meet us this season', frequency: 3, mediaKind: 'image', buttonText: 'Learn more' },
    }),
  },
]
