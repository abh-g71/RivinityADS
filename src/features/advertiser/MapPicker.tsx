'use client'

import dynamic from 'next/dynamic'
import type { JSX } from 'react'
import type { CampaignLocation, CampaignTargetLocation } from '@/types/campaign'
import { makePostalLocation } from '@/features/advertiser/locationSuggestions'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-72 rounded-lg border border-border bg-muted" aria-label="Loading map" />,
})

type MultiLocationProps = { locations: CampaignTargetLocation[]; onChange: (locations: CampaignTargetLocation[]) => void }
type LegacyLocationProps = { location: CampaignLocation; pinCodes: string[]; onPinCodesChange: (pinCodes: string[]) => void; onChange: (location: CampaignLocation) => void }

export function MapPicker(props: MultiLocationProps): JSX.Element
export function MapPicker(props: LegacyLocationProps): JSX.Element
export function MapPicker(props: MultiLocationProps | LegacyLocationProps): JSX.Element {
  if ('locations' in props) return <LeafletMap locations={props.locations} onChange={props.onChange} />

  const legacy = props.location
  const locationName = legacy.cities?.[0] ?? legacy.regions?.[0] ?? legacy.countries?.[0] ?? legacy.label ?? 'Pinned location'
  const primary: CampaignTargetLocation[] = legacy.lat != null && legacy.lng != null
    ? [{
      id: 'legacy-map-location',
      type: legacy.pin ? 'radius' : legacy.mode === 'country' ? 'country' : legacy.mode === 'region' ? 'region' : 'city',
      name: locationName,
      label: legacy.label ?? locationName,
      country: legacy.countries?.[0] ?? 'India',
      lat: legacy.lat,
      lng: legacy.lng,
      zoom: legacy.mode === 'country' ? 4 : legacy.mode === 'region' ? 6 : 11,
      ...(legacy.pin ? { radiusKm: legacy.radiusKm ?? legacy.pin.radiusKm } : {}),
    }]
    : []
  const postal = props.pinCodes.map((pin) => ({ ...makePostalLocation(pin), id: `legacy-pin-${pin}` }))
  return <LeafletMap locations={[...primary, ...postal]} onChange={(locations) => {
    const nextPins = locations.filter((item) => item.type === 'postal').map((item) => item.postalCode ?? item.name)
    props.onPinCodesChange(nextPins)
    const next = [...locations].reverse().find((item) => item.type !== 'postal')
    if (!next) {
      if (primary.length) props.onChange({ ...legacy, label: '', lat: null, lng: null, pin: null, pinCodes: nextPins })
      return
    }
    const mode = next.type === 'country' ? 'country' : next.type === 'region' ? 'region' : next.type === 'radius' ? 'radius' : 'city'
    props.onChange({
      ...legacy,
      mode,
      countries: mode === 'country' ? [next.name] : legacy.countries,
      regions: mode === 'region' ? [next.name] : legacy.regions,
      cities: mode === 'city' ? [next.name] : legacy.cities,
      pin: mode === 'radius' ? { lat: next.lat, lng: next.lng, radiusKm: next.radiusKm ?? 10 } : null,
      pinCodes: nextPins,
      lat: next.lat,
      lng: next.lng,
      radiusKm: next.radiusKm ?? legacy.radiusKm,
      label: next.label,
    })
  }} />
}
