import { createEmptyCampaignDraft, type CampaignDraft, type ChatMessage } from '@/types/campaign'

const cityNames = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jaipur']
const countryNames = ['India', 'United States', 'United Kingdom', 'UAE', 'Canada', 'Australia', 'Germany', 'Singapore']

function findMissingFields(draft: CampaignDraft) {
  const missing: string[] = []
  const countries = draft.location.countries ?? []
  const cities = draft.location.cities ?? []
  const regions = draft.location.regions ?? []
  const pinCodes = draft.location.pinCodes ?? []
  if (!draft.objective) missing.push('campaign goal')
  if (!draft.location.mode && countries.length === 0 && cities.length === 0 && regions.length === 0 && pinCodes.length === 0) missing.push('location')
  if (!draft.dailyBudget) missing.push('daily budget')
  if (!draft.headline) missing.push('headline')
  if (!draft.text) missing.push('ad text')
  if (!draft.url) missing.push('website link')
  return missing
}

function nextQuestion(field: string) {
  const questions: Record<string, string> = {
    'campaign goal': 'What would you like this campaign to do: get website visits, get leads, get sales, or build awareness?',
    location: 'Which country or city should this campaign reach?',
    'daily budget': 'What daily budget would you like to set? For example, ₹200, ₹500, or ₹1,000.',
    headline: 'What short headline would you like people to see?',
    'ad text': 'What would you like the ad to say?',
    'website link': 'What website link should the ad open?',
  }
  return questions[field] ?? 'What would you like to change?'
}

export async function generateCampaignDraft(input: {
  messages: ChatMessage[]
  currentDraft?: CampaignDraft
}): Promise<{
  reply: string
  draft: CampaignDraft
  missingFields: string[]
  quickReplies?: string[]
}> {
  await new Promise((resolve) => setTimeout(resolve, 350))

  const baseDraft = input.currentDraft ?? createEmptyCampaignDraft()
  const draft: CampaignDraft = {
    ...baseDraft,
    location: {
      ...baseDraft.location,
      countries: [...(baseDraft.location.countries ?? [])],
      regions: [...(baseDraft.location.regions ?? [])],
      cities: [...(baseDraft.location.cities ?? [])],
      pinCodes: [...(baseDraft.location.pinCodes ?? [])],
    },
    interests: [...baseDraft.interests],
    pinCodes: [...(baseDraft.pinCodes ?? [])],
  }
  const latestMessage = input.messages.at(-1)?.text.trim() ?? ''
  const lowerMessage = latestMessage.toLowerCase()

  if (/\b(website visits|visits|traffic)\b/.test(lowerMessage)) draft.objective = 'Get website visits'
  if (/\b(leads|lead generation)\b/.test(lowerMessage)) draft.objective = 'Get leads'
  if (/\b(sales|sell|purchase)\b/.test(lowerMessage)) draft.objective = 'Get sales'
  if (/\b(awareness|brand)\b/.test(lowerMessage)) draft.objective = 'Build awareness'

  const budgetMatch = latestMessage.match(/(?:₹|rs\.?\s?)(\d[\d,]*)/i)
  if (budgetMatch) draft.dailyBudget = Number(budgetMatch[1].replace(/,/g, ''))

  const detectedCountry = countryNames.find((name) => new RegExp(`\\b${name.split(' ').join('\\s+')}\\b`, 'i').test(latestMessage))
  if (detectedCountry) {
    draft.location = { ...draft.location, mode: 'country', countries: [detectedCountry], label: `${detectedCountry} (whole country)` }
  }

  const city = cityNames.find((name) => new RegExp(`\\b${name}\\b`, 'i').test(latestMessage))
  if (city) {
    draft.location = { ...draft.location, mode: 'city', cities: [city], label: city }
  }

  const headline = latestMessage.match(/headline\s*:\s*["“]?(.+?)["”]?(?:\s*$)/i)
  if (headline) draft.headline = headline[1].trim()
  const adText = latestMessage.match(/(?:ad text|text)\s*:\s*["“]?(.+?)["”]?(?:\s*$)/i)
  if (adText) draft.text = adText[1].trim()
  const url = latestMessage.match(/https?:\/\/[^\s]+/i)
  if (url) draft.url = url[0].replace(/[.,!?]+$/, '')

  const missingFields = findMissingFields(draft)
  if (missingFields.length) {
    const field = missingFields[0]
    return {
      reply: `Got it. ${nextQuestion(field)}`,
      draft,
      missingFields,
      quickReplies: field === 'campaign goal'
        ? ['Get website visits', 'Get leads', 'Get sales', 'Build awareness']
        : field === 'location'
          ? ['India', 'United States', 'United Kingdom', 'Mumbai']
          : field === 'daily budget'
            ? ['₹200', '₹500', '₹1,000']
          : undefined,
    }
  }

  return {
    reply: 'Your draft is ready to review. Nothing will be published until you approve it.',
    draft,
    missingFields,
  }
}
