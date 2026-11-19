'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { X } from 'lucide-react'
import type { CampaignTargetLocation } from '@/types/campaign'
import { makePostalLocation, mockLocationSuggestions } from '@/features/advertiser/locationSuggestions'

function MapCamera({ locations }: { locations: CampaignTargetLocation[] }) {
  const map = useMap()
  const signature = locations.map((item) => item.id).join('|')
  useEffect(() => {
    if (!locations.length) return
    if (locations.length > 1) {
      map.fitBounds(L.latLngBounds(locations.map((item) => [item.lat, item.lng])), { padding: [32, 32], maxZoom: 10, animate: true })
      return
    }
    const location = locations[0]
    if (location.bounds) map.fitBounds(location.bounds, { padding: [24, 24], maxZoom: location.zoom, animate: true })
    else map.flyTo([location.lat, location.lng], location.zoom, { duration: 0.45 })
  // The signature tracks the selected location set. Radius changes do not need to move the map.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, signature])
  return null
}

function MapClick({ enabled, onPlace }: { enabled: boolean; onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => { if (enabled) onPlace(event.latlng.lat, event.latlng.lng) } })
  return null
}

export default function LeafletMap({ locations, onChange }: { locations: CampaignTargetLocation[]; onChange: (locations: CampaignTargetLocation[]) => void }) {
  const [query, setQuery] = useState('')
  const [radiusMode, setRadiusMode] = useState(false)
  const [activeRadiusId, setActiveRadiusId] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const sequence = useRef(0)
  const center = useMemo<[number, number]>(() => locations.length ? [locations[0].lat, locations[0].lng] : [20.5937, 78.9629], [locations])
  const pinIcon = useMemo(() => L.divIcon({
    className: 'campaign-map-pin',
    html: '<span style="display:block;width:18px;height:18px;border:4px solid white;border-radius:999px;background:#2563eb"></span>',
    iconSize: [18, 18], iconAnchor: [9, 9],
  }), [])
  const normalizedQuery = query.trim().toLowerCase()
  const suggestions = normalizedQuery.length >= 2
    ? mockLocationSuggestions
      .filter((item) => `${item.name} ${item.label} ${item.country} ${item.postalCode ?? ''}`.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => Number(right.name.toLowerCase() === normalizedQuery) - Number(left.name.toLowerCase() === normalizedQuery))
      .slice(0, 8)
    : []
  const activeRadius = locations.find((item) => item.id === activeRadiusId && item.type === 'radius') ?? [...locations].reverse().find((item) => item.type === 'radius')

  function addLocation(location: CampaignTargetLocation) {
    sequence.current += 1
    const added = { ...location, id: `${location.id}-${Date.now()}-${sequence.current}` }
    onChange([...locations, added])
    setQuery('')
    setRadiusMode(false)
    if (added.type === 'radius') setActiveRadiusId(added.id)
  }

  function removeLocation(id: string) {
    onChange(locations.filter((item) => item.id !== id))
    if (activeRadiusId === id) setActiveRadiusId('')
  }

  function addRadiusPoint(lat: number, lng: number) {
    sequence.current += 1
    const id = `radius-${Date.now()}-${sequence.current}`
    const radius = 10
    const location: CampaignTargetLocation = { id, type: 'radius', name: 'Pinned location', label: `${radius} km around Pinned location, India`, country: 'India', lat, lng, zoom: 11, radiusKm: radius }
    onChange([...locations, location])
    setActiveRadiusId(id)
  }

  function addPostalCodes() {
    const parts = pinInput.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean)
    const invalid = parts.filter((value) => !/^\d{6}$/.test(value))
    if (!parts.length || invalid.length) {
      setPinError('Enter one or more valid six-digit Indian PIN codes.')
      return
    }
    const existing = new Set(locations.filter((item) => item.type === 'postal').map((item) => item.postalCode))
    const next = [...new Set(parts)].filter((pin) => !existing.has(pin)).map(makePostalLocation)
    onChange([...locations, ...next])
    setPinInput('')
    setPinError('')
  }

  function updateRadius(radiusKm: number) {
    if (!activeRadius) return
    const label = `${radiusKm} km around ${activeRadius.name}, ${activeRadius.country}`
    onChange(locations.map((item) => item.id === activeRadius.id ? { ...item, radiusKm, label } : item))
  }

  return <div className="min-w-0 space-y-4">
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative min-w-0 flex-1">
        <label htmlFor="location-search" className="mb-1 block text-sm font-medium text-navy-900">Add a location</label>
        <input id="location-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a city, country or PIN code" autoComplete="off" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
        {query && <div className="absolute z-[1000] mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm" role="listbox" aria-label="Location suggestions">
          {suggestions.map((item) => <button key={item.id} type="button" role="option" aria-selected="false" onClick={() => addLocation(item)} className="block min-h-10 w-full rounded-md px-3 py-2 text-left text-sm text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><span className="block font-medium">{item.label}</span><span className="mt-0.5 block text-xs capitalize text-slate-500">{item.type === 'postal' ? 'PIN code' : item.type}</span></button>)}
          {!suggestions.length && /^\d{6}$/.test(query.trim()) && <button type="button" onClick={() => { addLocation(makePostalLocation(query.trim())) }} className="block min-h-10 w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50">Add PIN code {query.trim()}, India</button>}
          {!suggestions.length && !/^\d{6}$/.test(query.trim()) && <p className="p-3 text-sm text-slate-500">No matches in the sample list. Try a city, country or six-digit PIN.</p>}
        </div>}
      </div>
      <button type="button" aria-pressed={radiusMode} onClick={() => setRadiusMode((active) => !active)} className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${radiusMode ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>Around a point</button>
    </div>
    <p className="text-xs text-slate-500">Choose a suggestion to add it. Select Around a point, then click the map to place a radius.</p>

    <section aria-label="Selected locations">
      <h3 className="text-sm font-semibold text-navy-900">Locations ({locations.length})</h3>
      {locations.length ? <ul className="mt-2 flex flex-wrap gap-2">
        {locations.map((item) => <li key={item.id} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-1.5 text-sm text-navy-900"><span className="max-w-[min(70vw,22rem)] truncate">{item.label}</span><button type="button" aria-label={`Remove ${item.label}`} onClick={() => removeLocation(item.id)} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><X className="h-4 w-4" aria-hidden="true" /></button></li>)}
      </ul> : <p className="mt-2 text-sm text-slate-500">No locations added yet.</p>}
    </section>

    <div className="overflow-hidden rounded-lg border border-slate-200">
      <MapContainer center={center} zoom={locations.length ? locations[0].zoom : 4} scrollWheelZoom={false} className="h-72 w-full sm:h-80 lg:h-[28rem]">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapCamera locations={locations} />
        <MapClick enabled={radiusMode} onPlace={addRadiusPoint} />
        {locations.map((item) => <Fragment key={`marker-${item.id}`}>
          <Marker position={[item.lat, item.lng]} icon={pinIcon} eventHandlers={{ click: () => item.type === 'radius' && setActiveRadiusId(item.id) }}>
            <Tooltip direction="top" offset={[0, -8]}>{item.label}</Tooltip>
          </Marker>
          {item.type === 'radius' && item.radiusKm && <Circle center={[item.lat, item.lng]} radius={item.radiusKm * 1000} pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.1 }} />}
        </Fragment>)}
      </MapContainer>
    </div>
    {activeRadius && <label className="block text-sm font-medium text-navy-900" htmlFor="campaign-map-radius">Radius around {activeRadius.name}, {activeRadius.country}: {activeRadius.radiusKm ?? 10} km
      <input id="campaign-map-radius" type="range" min="1" max="50" value={activeRadius.radiusKm ?? 10} onChange={(event) => updateRadius(Number(event.target.value))} className="mt-2 w-full accent-brand-600" />
      <span className="block text-xs font-normal text-slate-500">Radius can be set from 1 to 50 km.</span>
    </label>}
    <div className="space-y-2 rounded-lg border border-slate-200 p-3">
      <label htmlFor="pin-codes" className="block text-sm font-medium text-navy-900">Add PIN codes</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input id="pin-codes" value={pinInput} onChange={(event) => { setPinInput(event.target.value); setPinError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addPostalCodes() } }} placeholder="Comma-separated, e.g. 411001, 110001" className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
        <button type="button" onClick={addPostalCodes} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-medium text-navy-900 hover:bg-slate-50">Add PIN codes</button>
      </div>
      {pinError && <p role="alert" className="text-sm text-red-700">{pinError}</p>}
    </div>
  </div>
}
