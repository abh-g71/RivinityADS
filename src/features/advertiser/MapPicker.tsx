type MapPickerProps = {
  country: string
  state: string
  city: string
  radius: string
}

export function MapPicker({ country, state, city, radius }: MapPickerProps) {
  const place = [city, state, country].filter(Boolean).join(', ')

  return (
    <section
      role="region"
      aria-label="Map picker placeholder"
      className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center"
    >
      <p className="text-sm font-semibold text-navy-900">Map picker placeholder</p>
      <p className="mt-1 text-sm text-slate-600">
        {place || 'Choose a location to preview it here'}
        {radius ? ` · ${radius} km radius` : ''}
      </p>
      <p className="mt-2 text-xs text-slate-500">No map tiles or location tracking are loaded in this mock.</p>
    </section>
  )
}
