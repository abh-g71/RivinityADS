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
export const advertiserCountriesTarget = advertiserCountries
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
