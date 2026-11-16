export type CampaignStatus = 'Active' | 'Pending' | 'Paused' | 'Draft'

export type AdvertiserCampaign = {
  id: string
  name: string
  status: CampaignStatus
  campaignType: string
  country: string
  impressions: number
  clicks: number
  ctr: string
  conversions: number
  ecpa: string
  cpm: string
  spent: string
  totalBudget: string
  dailyBudget: string
  budgetLeft: string
  createdDate: string
  updatedDate: string
}

export type TrafficSample = {
  id: string
  country: string
  dailyImpressions: string
  recommendedCpm: string
}

export type Transaction = {
  id: string
  date: string
  type: string
  amount: string
  status: string
}

// All records and figures in this file are invented mock samples for UI previews only.
export const mockAdvertiserStats = [
  { label: 'Spend', value: '₹0.00' },
  { label: 'Impressions', value: '0' },
  { label: 'Clicks', value: '0' },
  { label: 'CTR', value: '0.00%' },
]

export const mockAdvertiserCampaigns: AdvertiserCampaign[] = [
  {
    id: 'RV-1042', name: 'Spring launch preview', status: 'Active', campaignType: 'Native Banner', country: 'India',
    impressions: 58240, clicks: 432, ctr: '0.74%', conversions: 18, ecpa: '₹72.00', cpm: '₹22.25',
    spent: '₹1,296.00', totalBudget: '₹5,000.00', dailyBudget: '₹500.00', budgetLeft: '₹3,704.00',
    createdDate: '2026-10-12', updatedDate: '2026-11-02',
  },
  {
    id: 'RV-1043', name: 'Product awareness demo', status: 'Pending', campaignType: 'Social Bar', country: 'United States',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, ecpa: '—', cpm: '₹18.00',
    spent: '₹0.00', totalBudget: '₹3,000.00', dailyBudget: '₹300.00', budgetLeft: '₹3,000.00',
    createdDate: '2026-10-27', updatedDate: '2026-10-27',
  },
  {
    id: 'RV-1044', name: 'Store visits sample', status: 'Paused', campaignType: 'Popunder', country: 'United Kingdom',
    impressions: 24610, clicks: 214, ctr: '0.87%', conversions: 11, ecpa: '₹91.00', cpm: '₹19.50',
    spent: '₹1,001.00', totalBudget: '₹4,000.00', dailyBudget: '₹400.00', budgetLeft: '₹2,999.00',
    createdDate: '2026-09-18', updatedDate: '2026-10-22',
  },
  {
    id: 'RV-1045', name: 'Newsletter signup demo', status: 'Draft', campaignType: 'In-Page Push', country: 'Canada',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, ecpa: '—', cpm: '₹16.00',
    spent: '₹0.00', totalBudget: '₹2,500.00', dailyBudget: '₹250.00', budgetLeft: '₹2,500.00',
    createdDate: '2026-11-04', updatedDate: '2026-11-04',
  },
  {
    id: 'RV-1046', name: 'Mobile app preview', status: 'Active', campaignType: 'Interstitial', country: 'India',
    impressions: 41350, clicks: 563, ctr: '1.36%', conversions: 29, ecpa: '₹64.00', cpm: '₹24.00',
    spent: '₹1,856.00', totalBudget: '₹7,500.00', dailyBudget: '₹750.00', budgetLeft: '₹5,644.00',
    createdDate: '2026-08-29', updatedDate: '2026-11-08',
  },
]

export type CampaignManagerEntity = 'campaign' | 'ad-set' | 'ad'

export type CampaignManagerItem = {
  id: string
  entity: CampaignManagerEntity
  parentId: string | null
  campaignId: string
  name: string
  enabled: boolean
  status: CampaignStatus
  budget: string
  impressions: number
  clicks: number
  ctr: string
  conversions: number
  spend: string
  country: string
  adUnit: string
  createdDate: string
}

// Child rows are mock setup records. Their zero metrics avoid implying measured delivery.
export const mockAdvertiserAdSets: CampaignManagerItem[] = [
  {
    id: 'AS-1042-1', entity: 'ad-set', parentId: 'RV-1042', campaignId: 'RV-1042',
    name: 'Core audience', enabled: true, status: 'Active', budget: '—',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, spend: '₹0.00',
    country: 'India', adUnit: 'Native Banner', createdDate: '2026-10-12',
  },
  {
    id: 'AS-1042-2', entity: 'ad-set', parentId: 'RV-1042', campaignId: 'RV-1042',
    name: 'Mobile audience', enabled: true, status: 'Active', budget: '—',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, spend: '₹0.00',
    country: 'India', adUnit: 'Native Banner', createdDate: '2026-10-12',
  },
  {
    id: 'AS-1043-1', entity: 'ad-set', parentId: 'RV-1043', campaignId: 'RV-1043',
    name: 'Product interest', enabled: true, status: 'Pending', budget: '—',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, spend: '₹0.00',
    country: 'United States', adUnit: 'Social Bar', createdDate: '2026-10-27',
  },
  {
    id: 'AS-1044-1', entity: 'ad-set', parentId: 'RV-1044', campaignId: 'RV-1044',
    name: 'Local audience', enabled: true, status: 'Active', budget: '—',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, spend: '₹0.00',
    country: 'United Kingdom', adUnit: 'Popunder', createdDate: '2026-09-18',
  },
]

export const mockAdvertiserAds: CampaignManagerItem[] = [
  {
    id: 'AD-1042-1', entity: 'ad', parentId: 'AS-1042-1', campaignId: 'RV-1042',
    name: 'Spring launch image', enabled: true, status: 'Active', budget: '—',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, spend: '₹0.00',
    country: 'India', adUnit: 'Native Banner', createdDate: '2026-10-12',
  },
  {
    id: 'AD-1042-2', entity: 'ad', parentId: 'AS-1042-2', campaignId: 'RV-1042',
    name: 'Spring launch mobile', enabled: true, status: 'Active', budget: '—',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, spend: '₹0.00',
    country: 'India', adUnit: 'Native Banner', createdDate: '2026-10-12',
  },
  {
    id: 'AD-1043-1', entity: 'ad', parentId: 'AS-1043-1', campaignId: 'RV-1043',
    name: 'Product awareness creative', enabled: true, status: 'Pending', budget: '—',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, spend: '₹0.00',
    country: 'United States', adUnit: 'Social Bar', createdDate: '2026-10-27',
  },
  {
    id: 'AD-1044-1', entity: 'ad', parentId: 'AS-1044-1', campaignId: 'RV-1044',
    name: 'Store visits creative', enabled: true, status: 'Active', budget: '—',
    impressions: 0, clicks: 0, ctr: '0.00%', conversions: 0, spend: '₹0.00',
    country: 'United Kingdom', adUnit: 'Popunder', createdDate: '2026-09-18',
  },
]

export const mockAdvertiserTraffic: TrafficSample[] = [
  { id: 'traffic-in', country: 'India', dailyImpressions: '12,400', recommendedCpm: '₹18.00' },
  { id: 'traffic-us', country: 'United States', dailyImpressions: '8,750', recommendedCpm: '₹24.00' },
  { id: 'traffic-gb', country: 'United Kingdom', dailyImpressions: '5,600', recommendedCpm: '₹21.00' },
  { id: 'traffic-ca', country: 'Canada', dailyImpressions: '3,200', recommendedCpm: '₹19.00' },
]

export const mockTransactions: Transaction[] = []

export const advertiserCountries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Japan',
]

export const advertiserAdUnits = [
  'Popunder',
  'Social Bar',
  'Native Banner',
  'In-Page Push',
  'Interstitial',
]

export const advertiserTrafficTypes = ['Mainstream', 'Search', 'Social']
export const advertiserConnections = ['Any', 'Wi-Fi', 'Mobile data']
export const advertiserDevices = ['Desktop', 'Mobile', 'Tablet']
export const advertiserPricingTypes = ['CPM', 'CPA', 'CPC']
// Mock option lists for the campaign creation prototype.
export const campaignObjectives = ['Awareness', 'Traffic', 'Engagement', 'Leads', 'App promotion', 'Sales'] as const
export const campaignBuyingTypes = ['Auction', 'Reservation'] as const
export const campaignGenders = ['All', 'Male', 'Female'] as const
export const campaignInterestOptions = ['Technology', 'Education', 'Travel', 'Food', 'Personal finance', 'Shopping'] as const
export const campaignPlacementOptions = ['Feed', 'Stories', 'Reels', 'Audience network'] as const
export const campaignCallToActions = ['Learn more', 'Shop now', 'Sign up', 'Download', 'Get quote'] as const
export const campaignOperatingSystems = ['Android', 'iOS', 'Windows', 'macOS', 'Linux'] as const
export const advertiserCountriesTarget = advertiserCountries
// Mock controls for advertiser finance and conversion-tracking previews only.
export const mockConversionEvents = ['event1', 'event2', 'event3'] as const
export const mockPostbackTemplate = 'https://tracking.rivinityads.example/postback?click_id={click_id}&event={event}'
export const mockPaymentGroups = [
  { title: 'Instant', methods: ['UPI', 'Card', 'Net Banking'] },
  { title: 'Manual', methods: ['Bank transfer'] },
] as const
export const mockDepositAmountOptions = [500, 1000, 5000] as const
export const targetingCategories = [
  'OS',
  'Browser',
  'Language',
  'Day of week',
  'Time range',
  'Carrier',
]
export const advertiserCountriesLocations: Record<string, string[]> = {
  India: ['Maharashtra', 'Karnataka', 'Delhi'],
  'United States': ['California', 'New York', 'Texas'],
  'United Kingdom': ['England', 'Scotland', 'Wales'],
  Canada: ['Ontario', 'Quebec', 'British Columbia'],
  Australia: ['New South Wales', 'Victoria', 'Queensland'],
  Germany: ['Bavaria', 'Berlin', 'Hamburg'],
  Japan: ['Tokyo', 'Osaka', 'Kyoto'],
}

export const targetingOptions: Record<string, string[]> = {
  OS: ['Android', 'iOS', 'Windows', 'macOS', 'Linux'],
  Browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
  Language: ['English', 'Hindi', 'French', 'German', 'Japanese'],
  'Day of week': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  'Time range': ['00:00–06:00', '06:00–12:00', '12:00–18:00', '18:00–24:00'],
  Carrier: ['Any carrier', 'Wi-Fi only', 'Mobile carrier'],
}
