import type { CampaignDraft, CampaignObjective } from '@/types/campaign'

export type ObjectiveField = {
  id: string
  kind: 'headline' | 'text' | 'image' | 'video-image' | 'website' | 'tracking' | 'lead-form' | 'product-name' | 'price' | 'offer-price' | 'offer-date' | 'store-url' | 'brand-name' | 'tagline' | 'button'
  label: string
  helper: string
  required?: boolean
}

export type ObjectiveCheckId = 'location' | 'headline' | 'adText' | 'website' | 'leadFormName' | 'leadPrivacy' | 'productName' | 'productPrice' | 'brandName' | 'tagline'

export type ObjectiveConfig = {
  title: CampaignObjective
  hint: string
  locationHint: string
  budgetTitle: string
  budgetDescription: string
  estimateLabels: [string, string?]
  previewType: 'website' | 'lead' | 'product' | 'brand'
  adTitle: string
  adHelper: string
  fields: ObjectiveField[]
  buttonOptions: string[]
  requiredChecks: ObjectiveCheckId[]
}

const commonHeadline: ObjectiveField = { id: 'headline', kind: 'headline', label: 'Headline', helper: 'Keep it clear and under 40 characters.', required: true }
const commonText: ObjectiveField = { id: 'text', kind: 'text', label: 'Short text', helper: 'One helpful sentence is a good place to start.', required: true }
const imageField: ObjectiveField = { id: 'image', kind: 'image', label: 'Image', helper: 'Add a clear image. It is optional for this sample campaign.' }

export const campaignObjectiveConfigs: Record<CampaignObjective, ObjectiveConfig> = {
  'Get website visits': {
    title: 'Get website visits',
    hint: 'Bring more people to your website.',
    locationHint: 'Choose a place and audience likely to visit your website.',
    budgetTitle: 'Estimate website visits',
    budgetDescription: 'A sample range based on your daily budget.',
    estimateLabels: ['Estimated visits'],
    previewType: 'website',
    adTitle: 'Write an ad that brings people to your site',
    adHelper: 'Choose a page and a clear action for visitors.',
    fields: [commonHeadline, commonText, imageField,
      { id: 'website', kind: 'website', label: 'Website URL', helper: 'Use a secure https:// address.', required: true },
      { id: 'button', kind: 'button', label: 'Button text', helper: 'Choose the next action.', required: true },
      { id: 'tracking', kind: 'tracking', label: 'Add tracking tags', helper: 'Mock option. No tracking is installed.' }],
    buttonOptions: ['Learn more', 'Shop now', 'Visit site'],
    requiredChecks: ['location', 'headline', 'adText', 'website'],
  },
  'Get leads': {
    title: 'Get leads',
    hint: 'Collect contact details from interested people.',
    locationHint: 'Choose where to find people who may want to hear from you.',
    budgetTitle: 'Estimate new leads',
    budgetDescription: 'Sample lead volume and cost based on your daily budget.',
    estimateLabels: ['Estimated leads', 'Cost per lead'],
    previewType: 'lead',
    adTitle: 'Invite people to share their details',
    adHelper: 'Add a short ad and set up the form people will complete.',
    fields: [commonHeadline, commonText, imageField,
      { id: 'lead-form', kind: 'lead-form', label: 'Lead form', helper: 'Choose the information you want to collect.', required: true }],
    buttonOptions: ['Sign up', 'Contact us', 'Get offer'],
    requiredChecks: ['location', 'headline', 'adText', 'leadFormName', 'leadPrivacy'],
  },
  'Get sales': {
    title: 'Get sales',
    hint: 'Show an offer and help people buy your product.',
    locationHint: 'Choose where likely customers live or shop.',
    budgetTitle: 'Estimate sales and return',
    budgetDescription: 'Sample results based on your daily budget.',
    estimateLabels: ['Estimated sales', 'Return on ad spend'],
    previewType: 'product',
    adTitle: 'Show your product and offer',
    adHelper: 'Add the product details and where customers can order it.',
    fields: [
      { id: 'product-name', kind: 'product-name', label: 'Product or offer name', helper: 'Use the name customers will recognize.', required: true },
      { id: 'price', kind: 'price', label: 'Price', helper: 'Enter the regular price in rupees.', required: true },
      { id: 'offer-price', kind: 'offer-price', label: 'Offer price', helper: 'Optional discounted price in rupees.' },
      { id: 'offer-date', kind: 'offer-date', label: 'Offer end date', helper: 'Optional last day for this offer.' },
      imageField,
      { id: 'store-url', kind: 'store-url', label: 'Store URL', helper: 'Use a secure https:// address.', required: true },
      { id: 'button', kind: 'button', label: 'Button text', helper: 'Choose the purchase action.', required: true },
    ],
    buttonOptions: ['Shop now', 'Buy now', 'Order now'],
    requiredChecks: ['location', 'productName', 'productPrice', 'website'],
  },
  'Build awareness': {
    title: 'Build awareness',
    hint: 'Introduce your brand to more people.',
    locationHint: 'Choose an audience that should see your brand.',
    budgetTitle: 'Estimate people reached',
    budgetDescription: 'Sample reach and frequency based on your daily budget.',
    estimateLabels: ['Estimated reach', 'Average frequency'],
    previewType: 'brand',
    adTitle: 'Introduce your brand',
    adHelper: 'Add a brand name and a short tagline.',
    fields: [
      { id: 'brand-name', kind: 'brand-name', label: 'Brand name', helper: 'Use the name people should remember.', required: true },
      { id: 'tagline', kind: 'tagline', label: 'Tagline', helper: 'A short line that describes your brand.', required: true },
      { ...imageField, kind: 'video-image', helper: 'Add an image or video. Video is shown as a sample thumbnail.' },
      { id: 'website', kind: 'website', label: 'Website (optional)', helper: 'Add a secure https:// address if you have one.' },
    ],
    buttonOptions: ['Learn more', 'Visit site'],
    requiredChecks: ['location', 'brandName', 'tagline'],
  },
}

export const campaignObjectives = Object.values(campaignObjectiveConfigs)

export function isCampaignObjective(value: string): value is CampaignObjective {
  return Object.prototype.hasOwnProperty.call(campaignObjectiveConfigs, value)
}

export function getObjectiveReadiness(draft: CampaignDraft) {
  const checks: Record<ObjectiveCheckId, { label: string; ready: boolean; step: number; warning?: boolean }> = {
    location: { label: 'At least one location is set', ready: hasLocation(draft), step: 1 },
    headline: { label: 'Headline is under 40 characters', ready: Boolean(draft.headline.trim()) && draft.headline.length <= 40, step: 3 },
    adText: { label: 'Short text is added', ready: Boolean(draft.text.trim()), step: 3 },
    website: { label: 'Website URL is valid', ready: isValidHttpsUrl(draft.url), step: 3 },
    leadFormName: { label: 'Lead form has a name', ready: draft.objectiveDetails.objective === 'Get leads' && Boolean(draft.objectiveDetails.leadForm.name.trim()), step: 3 },
    leadPrivacy: { label: 'Privacy policy URL is valid', ready: draft.objectiveDetails.objective === 'Get leads' && isValidHttpsUrl(draft.objectiveDetails.leadForm.privacyPolicyUrl), step: 3 },
    productName: { label: 'Product or offer name is added', ready: draft.objectiveDetails.objective === 'Get sales' && Boolean(draft.objectiveDetails.productName.trim()), step: 3 },
    productPrice: { label: 'Product price is valid', ready: draft.objectiveDetails.objective === 'Get sales' && Number(draft.objectiveDetails.price) > 0, step: 3 },
    brandName: { label: 'Brand name is added', ready: draft.objectiveDetails.objective === 'Build awareness' && Boolean(draft.objectiveDetails.brandName.trim()), step: 3 },
    tagline: { label: 'Tagline is added', ready: draft.objectiveDetails.objective === 'Build awareness' && Boolean(draft.objectiveDetails.tagline.trim()), step: 3 },
  }
  const config = isCampaignObjective(draft.objective) ? campaignObjectiveConfigs[draft.objective] : campaignObjectiveConfigs['Get website visits']
  return [
    ...config.requiredChecks.map((id) => ({ key: id, ...checks[id], warning: false })),
    { key: 'image', label: 'Image added', ready: Boolean(draft.imageDataUrl || draft.imageName), step: 3, warning: true },
  ]
}

export function getObjectiveMissingInputs(draft: CampaignDraft) {
  const readiness = getObjectiveReadiness(draft)
  return readiness.filter((item) => !item.ready && !item.warning).map((item) => item.key)
}

export function isValidHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function hasLocation(draft: CampaignDraft) {
  return draft.locations.length > 0
}
