import type { CampaignTargetLocation } from '@/types/campaign'

function entry(id: string, type: CampaignTargetLocation['type'], name: string, country: string, lat: number, lng: number, zoom: number, span?: number, postalCode?: string): CampaignTargetLocation {
  const label = type === 'radius' ? `${name}, ${country}` : type === 'postal' ? `${name}, India` : type === 'country' ? name : `${name}, ${country}`
  return {
    id, type, name, label, country: type === 'city' ? country.split(',').at(-1)?.trim() ?? country : country, lat, lng, zoom,
    ...(span ? { bounds: [[lat - span, lng - span], [lat + span, lng + span]] as [[number, number], [number, number]] } : {}),
    ...(postalCode ? { postalCode } : {}),
    ...(type === 'radius' ? { radiusKm: 10 } : {}),
  }
}

export const mockCountries = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates',
  'Germany', 'Singapore', 'France', 'Japan', 'Brazil', 'Saudi Arabia', 'South Africa',
  'Indonesia', 'Thailand', 'Netherlands', 'Spain', 'Italy', 'New Zealand', 'Ireland',
  'Malaysia', 'Mexico', 'Nigeria', 'Sweden', 'Switzerland',
]

// Mock list, replace with a geocoding service later.
export const mockLocationSuggestions: CampaignTargetLocation[] = [
  entry('city-pune', 'city', 'Pune', 'Maharashtra, India', 18.5204, 73.8567, 11),
  entry('city-mumbai', 'city', 'Mumbai', 'Maharashtra, India', 19.076, 72.8777, 11),
  entry('city-delhi', 'city', 'Delhi', 'India', 28.6139, 77.209, 11),
  entry('city-bengaluru', 'city', 'Bengaluru', 'Karnataka, India', 12.9716, 77.5946, 11),
  entry('city-hyderabad', 'city', 'Hyderabad', 'Telangana, India', 17.385, 78.4867, 11),
  entry('city-chennai', 'city', 'Chennai', 'Tamil Nadu, India', 13.0827, 80.2707, 11),
  entry('city-kolkata', 'city', 'Kolkata', 'West Bengal, India', 22.5726, 88.3639, 11),
  entry('city-jaipur', 'city', 'Jaipur', 'Rajasthan, India', 26.9124, 75.7873, 11),
  entry('city-ahmedabad', 'city', 'Ahmedabad', 'Gujarat, India', 23.0225, 72.5714, 11),
  entry('city-surat', 'city', 'Surat', 'Gujarat, India', 21.1702, 72.8311, 11),
  entry('city-kochi', 'city', 'Kochi', 'Kerala, India', 9.9312, 76.2673, 11),
  entry('city-lucknow', 'city', 'Lucknow', 'Uttar Pradesh, India', 26.8467, 80.9462, 11),
  entry('region-maharashtra', 'region', 'Maharashtra', 'India', 19.7515, 75.7139, 6, 2.4),
  entry('region-karnataka', 'region', 'Karnataka', 'India', 15.3173, 75.7139, 6, 2.4),
  entry('region-tamil-nadu', 'region', 'Tamil Nadu', 'India', 11.1271, 78.6569, 6, 2),
  entry('region-gujarat', 'region', 'Gujarat', 'India', 22.2587, 71.1924, 6, 2.2),
  entry('region-telangana', 'region', 'Telangana', 'India', 18.1124, 79.0193, 6, 1.8),
  entry('region-rajasthan', 'region', 'Rajasthan', 'India', 27.0238, 74.2179, 6, 3),
  entry('pin-400001', 'postal', '400001', 'India', 18.9388, 72.8354, 14, undefined, '400001'),
  entry('pin-110001', 'postal', '110001', 'India', 28.6328, 77.2197, 14, undefined, '110001'),
  entry('pin-411001', 'postal', '411001', 'India', 18.5196, 73.8553, 14, undefined, '411001'),
  entry('pin-560001', 'postal', '560001', 'India', 12.9767, 77.5993, 14, undefined, '560001'),
  entry('pin-600001', 'postal', '600001', 'India', 13.0878, 80.2785, 14, undefined, '600001'),
  entry('pin-500001', 'postal', '500001', 'India', 17.384, 78.4867, 14, undefined, '500001'),
  entry('pin-700001', 'postal', '700001', 'India', 22.5697, 88.3472, 14, undefined, '700001'),
  entry('country-india', 'country', 'India', 'India', 20.5937, 78.9629, 4, 15),
  entry('country-us', 'country', 'United States', 'United States', 39.8283, -98.5795, 3, 20),
  entry('country-uk', 'country', 'United Kingdom', 'United Kingdom', 55.3781, -3.436, 5, 5),
  entry('country-canada', 'country', 'Canada', 'Canada', 56.1304, -106.3468, 3, 22),
  entry('country-australia', 'country', 'Australia', 'Australia', -25.2744, 133.7751, 3, 20),
  entry('country-uae', 'country', 'United Arab Emirates', 'United Arab Emirates', 23.4241, 53.8478, 6, 4),
  entry('country-germany', 'country', 'Germany', 'Germany', 51.1657, 10.4515, 5, 5),
  entry('country-singapore', 'country', 'Singapore', 'Singapore', 1.3521, 103.8198, 9, 0.5),
  entry('country-france', 'country', 'France', 'France', 46.2276, 2.2137, 5, 6),
  entry('country-japan', 'country', 'Japan', 'Japan', 36.2048, 138.2529, 4, 8),
  entry('country-brazil', 'country', 'Brazil', 'Brazil', -14.235, -51.9253, 3, 19),
  entry('country-saudi', 'country', 'Saudi Arabia', 'Saudi Arabia', 23.8859, 45.0792, 4, 12),
  entry('country-south-africa', 'country', 'South Africa', 'South Africa', -30.5595, 22.9375, 4, 10),
  entry('country-indonesia', 'country', 'Indonesia', 'Indonesia', -0.7893, 113.9213, 4, 15),
  entry('country-thailand', 'country', 'Thailand', 'Thailand', 15.87, 100.9925, 5, 7),
  entry('country-netherlands', 'country', 'Netherlands', 'Netherlands', 52.1326, 5.2913, 7, 2),
  entry('country-spain', 'country', 'Spain', 'Spain', 40.4637, -3.7492, 5, 6),
  entry('country-italy', 'country', 'Italy', 'Italy', 41.8719, 12.5674, 5, 6),
  entry('country-new-zealand', 'country', 'New Zealand', 'New Zealand', -40.9006, 174.886, 4, 8),
  entry('country-ireland', 'country', 'Ireland', 'Ireland', 53.1424, -7.6921, 6, 3),
  entry('country-malaysia', 'country', 'Malaysia', 'Malaysia', 4.2105, 101.9758, 5, 7),
  entry('country-mexico', 'country', 'Mexico', 'Mexico', 23.6345, -102.5528, 4, 12),
  entry('country-nigeria', 'country', 'Nigeria', 'Nigeria', 9.082, 8.6753, 5, 6),
  entry('country-sweden', 'country', 'Sweden', 'Sweden', 60.1282, 18.6435, 4, 9),
  entry('country-switzerland', 'country', 'Switzerland', 'Switzerland', 46.8182, 8.2275, 7, 2),
]

export function makePostalLocation(postalCode: string): CampaignTargetLocation {
  const existing = mockLocationSuggestions.find((item) => item.type === 'postal' && item.postalCode === postalCode)
  if (existing) return { ...existing, id: `pin-${postalCode}-${Date.now()}` }
  const prefix = postalCode.slice(0, 2)
  const center = prefix === '11' ? [28.6139, 77.209] : prefix === '40' || prefix === '41' ? [19.076, 72.8777] : prefix === '56' ? [12.9716, 77.5946] : prefix === '60' ? [13.0827, 80.2707] : prefix === '50' ? [17.385, 78.4867] : [20.5937, 78.9629]
  return entry(`pin-${postalCode}-${Date.now()}`, 'postal', postalCode, 'India', center[0], center[1], 14, undefined, postalCode)
}
