'use client'

import dynamic from 'next/dynamic'
import type { CampaignLocation } from '@/types/campaign'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-64 rounded-lg border border-slate-200 bg-slate-100" aria-label="Loading map" />,
})

export function MapPicker({
  location,
  onChange,
  pinCodes,
  onPinCodesChange,
}: {
  location: CampaignLocation
  onChange: (location: CampaignLocation) => void
  pinCodes: string[]
  onPinCodesChange: (pinCodes: string[]) => void
}) {
  return <LeafletMap location={location} onChange={onChange} pinCodes={pinCodes} onPinCodesChange={onPinCodesChange} />
}
