import { createEmptyCampaignDraft, createObjectiveDetails, migrateCampaignDraft, type CampaignDraft, type CampaignObjective, type ChatMessage } from '@/types/campaign'
import { getObjectiveMissingInputs } from '@/features/advertiser/campaignObjectives'
import { makePostalLocation, mockLocationSuggestions } from '@/features/advertiser/locationSuggestions'

const audienceInterests = ['Shopping', 'Food', 'Travel', 'Technology', 'Events', 'Fashion', 'Health', 'Education', 'Finance', 'Sports']
const objectiveQuestions: Record<CampaignObjective, string> = {
  'Get website visits': 'What secure website URL should people visit?',
  'Get leads': 'What secure privacy policy URL should appear on the lead form?',
  'Get sales': 'What secure store URL should customers use to order?',
  'Build awareness': 'What brand name should the campaign introduce?',
}

export async function generateCampaignDraft(input: { messages: ChatMessage[]; currentDraft?: CampaignDraft }): Promise<{
  reply: string; draft: CampaignDraft; objective: CampaignDraft['objective']; missingFields: string[]; quickReplies?: string[]
}> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  const draft = migrateCampaignDraft(input.currentDraft ?? createEmptyCampaignDraft())
  const latest = input.messages.at(-1)?.text.trim() ?? ''
  const lower = latest.toLowerCase()
  const detected = lower.includes('lead') ? 'Get leads' : /\b(sales|sell|purchase|store)\b/.test(lower) ? 'Get sales' : /\b(awareness|brand)\b/.test(lower) ? 'Build awareness' : /\b(website visits|visits|traffic)\b/.test(lower) ? 'Get website visits' : null
  if (detected && detected !== draft.objective) {
    draft.objective = detected
    draft.objectiveDetails = createObjectiveDetails(detected)
  }
  const budget = latest.match(/(?:\p{Sc}|rs\.?\s?)(\d[\d,]*)/iu)
  if (budget) draft.dailyBudget = Number(budget[1].replace(/,/g, ''))
  const mentionedPlaces = mockLocationSuggestions.filter((item) => new RegExp(`\\b${item.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i').test(latest))
  const pinMatches = latest.match(/\b\d{6}\b/g) ?? []
  const radiusMatch = latest.match(/(\d{1,2})\s*(?:km|kilometers?)\s+(?:around|radius around)\s+([a-z][a-z\s-]*)/i)
  const radiusCity = radiusMatch ? mentionedPlaces.find((item) => item.type === 'city' && radiusMatch[2].toLowerCase().includes(item.name.toLowerCase())) : undefined
  const additions = [...mentionedPlaces.filter((item) => !(radiusCity && item.id === radiusCity.id)), ...pinMatches.map(makePostalLocation)]
  if (radiusMatch && radiusCity) {
    const radiusKm = Math.max(1, Math.min(50, Number(radiusMatch[1])))
    additions.push({ ...radiusCity, id: `${radiusCity.id}-radius-ai`, type: 'radius', label: `${radiusKm} km around ${radiusCity.name}, ${radiusCity.country}`, zoom: 11, radiusKm })
  }
  const existingLocationKeys = new Set(draft.locations.map((item) => `${item.type}:${item.name.toLowerCase()}`))
  for (const [index, place] of additions.entries()) {
    const key = `${place.type}:${place.name.toLowerCase()}`
    if (!existingLocationKeys.has(key)) {
      draft.locations.push({ ...place, id: `${place.id}-ai-${Date.now()}-${index}` })
      existingLocationKeys.add(key)
    }
  }
  const countryAlias = /\buae\b/i.test(latest) ? 'United Arab Emirates' : null
  if (countryAlias && !draft.locations.some((item) => item.type === 'country' && item.name === countryAlias)) {
    const country = mockLocationSuggestions.find((item) => item.type === 'country' && item.name === countryAlias)
    if (country) draft.locations.push({ ...country, id: `${country.id}-ai-${Date.now()}` })
  }
  const lowerWithAliases = lower.replace(/\bfood and dining\b/g, 'food').replace(/\btech\b/g, 'technology')
  for (const interest of audienceInterests) {
    if (new RegExp(`\\b${interest.toLowerCase()}\\b`).test(lowerWithAliases) && !draft.interests.includes(interest) && draft.interests.length < 8) draft.interests.push(interest)
  }
  const placeIntent = latest.match(/\b(?:in|near|around|targeting|location)\s*:?\s*([a-z][a-z\s-]{2,36})/i)
  const unclearLocation = Boolean(placeIntent && !mentionedPlaces.length && !pinMatches.length)
  const capture = (name: string) => latest.match(new RegExp(`(?:^|\\n)${name}\\s*:\\s*(.+)`, 'i'))?.[1]?.trim().replace(/^['"]|['"]$/g, '')
  const headline = capture('headline'); if (headline) draft.headline = headline
  const text = capture('ad text|text'); if (text) draft.text = text
  const url = latest.match(/https:\/\/[^\s]+/i)?.[0]?.replace(/[.,!?]+$/, '')
  if (url) {
    if (draft.objectiveDetails.objective === 'Get leads' && (!draft.objectiveDetails.leadForm.privacyPolicyUrl || /privacy/i.test(lower))) draft.objectiveDetails.leadForm.privacyPolicyUrl = url
    else draft.url = url
  }
  if (draft.objectiveDetails.objective === 'Get leads') {
    const name = capture('form name'); if (name) draft.objectiveDetails.leadForm.name = name
  }
  if (draft.objectiveDetails.objective === 'Get sales') {
    const name = capture('product|product name'); if (name) draft.objectiveDetails.productName = name
    const price = capture('price'); if (price) draft.objectiveDetails.price = price.replace(/[^\d.]/g, '')
  }
  if (draft.objectiveDetails.objective === 'Build awareness') {
    const brand = capture('brand|brand name'); if (brand) draft.objectiveDetails.brandName = brand
    const tagline = capture('tagline'); if (tagline) draft.objectiveDetails.tagline = tagline
  }
  const missing: string[] = []
  if (!draft.objective) missing.push('campaign goal')
  if (draft.locations.length === 0 || unclearLocation) missing.push('location')
  if (!draft.dailyBudget) missing.push('daily budget')
  if (draft.objective) missing.push(...getObjectiveMissingInputs(draft).filter((key) => key !== 'location').map((key) => key === 'website' ? 'website URL' : key === 'leadPrivacy' ? 'privacy policy URL' : key === 'leadFormName' ? 'form name' : key === 'productName' ? 'product name' : key === 'productPrice' ? 'product price' : key === 'brandName' ? 'brand name' : key === 'tagline' ? 'tagline' : key))
  const questions: Record<string, string> = {
    'campaign goal': 'What should the campaign do: get website visits, get leads, get sales, or build awareness?',
    location: 'Which city, country, state or region, or six-digit PIN code should this campaign reach?',
    'daily budget': 'What daily budget should I use? For example, ₹500.',
    'website URL': objectiveQuestions['Get website visits'],
    'privacy policy URL': objectiveQuestions['Get leads'],
    'product name': 'What product or offer should the ad feature?',
    'product price': 'What is the product price in rupees?',
    'brand name': objectiveQuestions['Build awareness'],
    tagline: 'What short tagline should the ad show?',
    headline: 'What headline should the ad use?',
    adText: 'What short text should the ad say?',
  }
  const first = missing[0]
  return {
    reply: first ? `Got it. ${draft.objective && objectiveQuestions[draft.objective] && ['website URL', 'privacy policy URL', 'product name', 'product price', 'brand name', 'tagline'].includes(first) ? objectiveQuestions[draft.objective] : questions[first] ?? `What ${first} should I use?`}` : 'Your draft is ready to review. Nothing will be published until you approve it.',
    draft,
    objective: draft.objective,
    missingFields: missing,
    quickReplies: first === 'campaign goal' ? ['Get website visits', 'Get leads', 'Get sales', 'Build awareness'] : first === 'location' ? ['India', 'United States', 'Mumbai'] : first === 'daily budget' ? ['₹200', '₹500', '₹1,000'] : undefined,
  }
}
