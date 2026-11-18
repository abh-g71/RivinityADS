import { createEmptyCampaignDraft, createObjectiveDetails, migrateCampaignDraft, type CampaignDraft, type CampaignObjective, type ChatMessage } from '@/types/campaign'
import { getObjectiveMissingInputs } from '@/features/advertiser/campaignObjectives'

const cityNames = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jaipur']
const countryNames = ['India', 'United States', 'United Kingdom', 'UAE', 'Canada', 'Australia', 'Germany', 'Singapore']
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
  const budget = latest.match(/(?:₹|rs\.?\s?)(\d[\d,]*)/i)
  if (budget) draft.dailyBudget = Number(budget[1].replace(/,/g, ''))
  const country = countryNames.find((name) => new RegExp(`\\b${name.split(' ').join('\\s+')}\\b`, 'i').test(latest))
  if (country) draft.location = { ...draft.location, mode: 'country', countries: [country], label: `${country} (whole country)` }
  const city = cityNames.find((name) => new RegExp(`\\b${name}\\b`, 'i').test(latest))
  if (city) draft.location = { ...draft.location, mode: 'city', cities: [city], label: city }
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
  if (!(draft.location.countries?.length || draft.location.cities?.length || draft.location.regions?.length || draft.location.pinCodes?.length || draft.location.pin)) missing.push('location')
  if (!draft.dailyBudget) missing.push('daily budget')
  if (draft.objective) missing.push(...getObjectiveMissingInputs(draft).filter((key) => key !== 'location').map((key) => key === 'website' ? 'website URL' : key === 'leadPrivacy' ? 'privacy policy URL' : key === 'leadFormName' ? 'form name' : key === 'productName' ? 'product name' : key === 'productPrice' ? 'product price' : key === 'brandName' ? 'brand name' : key === 'tagline' ? 'tagline' : key))
  const questions: Record<string, string> = {
    'campaign goal': 'What should the campaign do: get website visits, get leads, get sales, or build awareness?',
    location: 'Which country or city should this campaign reach?',
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
