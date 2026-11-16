'use client'

import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { CampaignLocation } from '@/types/campaign'

const cities = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
]

function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => onPlace(event.latlng.lat, event.latlng.lng) })
  return null
}

function MoveMap({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 11, { duration: 0.4 })
  }, [map, position])
  return null
}

export default function LeafletMap({
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
  const [query, setQuery] = useState('')
  const [pinInput, setPinInput] = useState(pinCodes.join(', '))
  const [pinMode, setPinMode] = useState(false)
  const [pinError, setPinError] = useState('')
  const position = useMemo<[number, number]>(() => [location.lat ?? 20.5937, location.lng ?? 78.9629], [location.lat, location.lng])
  const pinIcon = useMemo(() => L.divIcon({
    className: 'campaign-map-pin',
    html: '<span style="display:block;width:18px;height:18px;border:4px solid white;border-radius:999px;background:#2563eb;box-shadow:0 2px 8px #0f172a66"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }), [])
  const filteredCities = cities.filter((city) => city.name.toLowerCase().includes(query.toLowerCase()))

  function setCity(city: (typeof cities)[number]) {
    onChange({ ...location, label: city.name, lat: city.lat, lng: city.lng })
    setQuery('')
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      window.alert('Location access is not available in this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => onChange({
        ...location,
        label: 'Your location',
        lat: coords.latitude,
        lng: coords.longitude,
      }),
      () => window.alert('Location permission was not granted. You can search for a city instead.'),
      { timeout: 8000 },
    )
  }

  return (
    <div className="space-y-3 lg:h-full lg:flex lg:flex-col">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="city-search" className="sr-only">Search Indian cities</label>
          <input
            id="city-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a city in India"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          {query && (
            <div className="absolute z-[1000] mt-1 max-h-44 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              {filteredCities.length
                ? filteredCities.map((city) => (
                  <button key={city.name} type="button" onClick={() => setCity(city)} className="block min-h-10 w-full rounded-lg px-3 text-left text-sm hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    {city.name}
                  </button>
                ))
                : <p className="p-3 text-sm text-slate-500">No matching city in this demo.</p>}
            </div>
          )}
        </div>
        <button type="button" onClick={useMyLocation} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          Use my location
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 lg:min-h-0 lg:flex-1">
        <MapContainer center={position} zoom={location.lat === null ? 4 : 11} scrollWheelZoom={false} className="h-64 w-full lg:h-[28rem]">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {location.lat !== null && <MoveMap position={position} />}
          <ClickToPlace onPlace={(lat, lng) => onChange({ ...location, lat, lng, label: 'Pinned area' })} />
          {location.lat !== null && location.lng !== null && (
            <>
              <Marker
                position={[location.lat, location.lng]}
                icon={pinIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const point = event.target.getLatLng()
                    onChange({ ...location, lat: point.lat, lng: point.lng, label: 'Pinned area' })
                  },
                }}
              />
              <Circle center={[location.lat, location.lng]} radius={location.radiusKm * 1000} pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.12 }} />
            </>
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500">Select a city or click the map to place a pin. Map tiles come from OpenStreetMap.</p>
      <label className="block space-y-2 text-sm font-medium text-navy-900" htmlFor="campaign-map-radius">
        Reach radius: {location.radiusKm} km
        <input id="campaign-map-radius" type="range" min="1" max="50" value={location.radiusKm} onChange={(event) => onChange({ ...location, radiusKm: Number(event.target.value) })} className="w-full accent-brand-600" />
        <span className="block text-xs font-normal text-slate-500">A smaller radius focuses on nearby people.</span>
      </label>
      <button type="button" onClick={() => setPinMode((current) => !current)} aria-expanded={pinMode} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        {pinMode ? 'Hide PIN code targeting' : 'Add PIN codes instead'}
      </button>
      {pinMode && (
        <div className="space-y-2 rounded-xl bg-slate-50 p-3">
          <label htmlFor="pin-codes" className="text-sm font-medium text-navy-900">PIN codes</label>
          <p className="text-xs text-slate-500">Enter Indian PIN codes separated by commas.</p>
          <input id="pin-codes" value={pinInput} onChange={(event) => setPinInput(event.target.value)} onBlur={() => {
            const enteredPins = pinInput.split(',').map((pin) => pin.trim()).filter(Boolean)
            const pins = enteredPins.filter((pin) => /^\d{6}$/.test(pin)).slice(0, 6)
            setPinError(enteredPins.length !== pins.length ? 'Use up to 6 valid six-digit PIN codes.' : '')
            onPinCodesChange(pins)
            const oldPinsLabel = location.label.includes('PIN code')
            onChange({ ...location, label: pins.length ? `${pins.length} PIN code${pins.length === 1 ? '' : 's'}` : oldPinsLabel ? '' : location.label, lat: pins.length ? null : location.lat, lng: pins.length ? null : location.lng })
          }} placeholder="For example, 400001, 110001" className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
          <p className="text-xs text-slate-500">{pinCodes.length ? `${pinCodes.length} valid PIN code${pinCodes.length === 1 ? '' : 's'} added.` : 'Use six-digit PIN codes, separated by commas.'}</p>
          {pinError && <p role="alert" className="text-xs text-red-700">{pinError}</p>}
        </div>
      )}
      {location.label && <p className="text-sm font-medium text-navy-900">Selected: {location.label}</p>}
    </div>
  )
}
