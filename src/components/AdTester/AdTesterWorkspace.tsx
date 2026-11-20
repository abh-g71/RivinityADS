'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, Copy, FileImage, ImagePlus, Monitor, Smartphone, Upload, Video, X } from 'lucide-react'
import { ctaOptions, sampleCreatives } from './sample-data'
import type { AdFormat, CheckResult, Creative, MediaAsset, PreviewMode, VariantKey } from './types'

const initialCreatives: Record<VariantKey, Creative> = {
  A: sampleCreatives[0].creative,
  B: sampleCreatives[1].creative,
}

const inputIds = {
  brand: 'creative-brand',
  headline: 'creative-headline',
  description: 'creative-description',
  cta: 'creative-cta',
  destinationUrl: 'creative-url',
  media: 'creative-media',
} as const

function aspectRatio(width: number, height: number) {
  return height ? (width / height).toFixed(2) : '0.00'
}

function dimensionsLabel(media: MediaAsset) {
  if (!media.width || !media.height) return 'Reading media dimensions…'
  return `${media.width.toLocaleString()} × ${media.height.toLocaleString()} · ${aspectRatio(media.width, media.height)}:1`
}

function getChecks(creative: Creative, format: AdFormat): CheckResult[] {
  const headline = creative.headline.trim()
  const uppercase = headline.length > 0 && headline === headline.toLocaleUpperCase() && /[A-Z]/.test(headline)
  const headlineStatus: CheckResult['status'] = !headline || headline.length > 65 || uppercase || headline.includes('!!!')
    ? 'error'
    : headline.length < 10 || headline.length > 50 ? 'warning' : 'pass'

  const description = creative.description.trim()
  const descriptionStatus: CheckResult['status'] = !description ? 'error' : description.length < 20 || description.length > 120 ? 'warning' : 'pass'

  let urlStatus: CheckResult['status'] = 'error'
  let urlDetail = 'Add a valid HTTPS destination.'
  try {
    const url = new URL(creative.destinationUrl)
    if (url.protocol === 'https:') {
      urlStatus = 'pass'
      urlDetail = 'Secure destination verified.'
    } else if (url.protocol === 'http:') {
      urlDetail = 'Use HTTPS before launch.'
    }
  } catch {
    urlDetail = creative.destinationUrl.trim() ? 'Enter a complete destination URL.' : 'Destination URL is required.'
  }

  let mediaStatus: CheckResult['status'] = 'pass'
  let mediaDetail = 'Sample creative is ready for preview.'
  if (!creative.media) {
    mediaStatus = 'warning'
    mediaDetail = 'Add media to see placement cropping.'
  } else if (!creative.media.sample) {
    const { width, height, mimeType } = creative.media
    const ratio = width && height ? width / height : 0
    const targetRatio = format === 'Video' ? 16 / 9 : format === 'Native' ? 1.91 : 0
    const isVideo = mimeType.startsWith('video/')
    if (format === 'Video' && !isVideo) {
      mediaStatus = 'warning'
      mediaDetail = 'Choose a video for in-stream placement.'
    } else if (format !== 'Video' && isVideo) {
      mediaStatus = 'warning'
      mediaDetail = 'Video media is best suited to in-stream placement.'
    } else if (width && width < 600) {
      mediaStatus = 'warning'
      mediaDetail = 'Media is under 600 px wide and may look soft.'
    } else if (ratio && targetRatio && Math.abs(ratio - targetRatio) > 0.45) {
      mediaStatus = 'warning'
      mediaDetail = 'This aspect ratio may crop heavily in the selected placement.'
    } else {
      mediaDetail = 'Media dimensions suit the selected placement.'
    }
  }

  const headlineDetail = headlineStatus === 'error'
    ? uppercase || headline.includes('!!!') ? 'Avoid all caps and repeated punctuation.' : 'Use a headline between 10 and 65 characters.'
    : headlineStatus === 'warning' ? 'Recommended length is 10–50 characters.' : `${headline.length} characters · within range.`

  return [
    { id: 'headline', label: 'Headline length & style', status: headlineStatus, detail: headlineDetail },
    { id: 'description', label: 'Description length', status: descriptionStatus, detail: descriptionStatus === 'pass' ? `${description.length} characters · within range.` : descriptionStatus === 'error' ? 'Add a description before launch.' : 'Recommended length is 20–120 characters.' },
    { id: 'destinationUrl', label: 'Destination URL', status: urlStatus, detail: urlDetail },
    { id: 'media', label: 'Media & placement ratio', status: mediaStatus, detail: mediaDetail },
    { id: 'attribution', label: 'CTA & brand attribution', status: creative.brand.trim() && creative.cta ? 'pass' : 'error', detail: creative.brand.trim() && creative.cta ? 'Brand and call to action are set.' : 'Add a brand name and choose a call to action.' },
  ]
}

function PillTabs<T extends string>({ label, items, value, onChange }: { label: string; items: readonly T[]; value: T; onChange: (next: T) => void }) {
  return <div role="group" aria-label={label} className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-[#F8F9FA] p-1">
    {items.map((item) => <button key={item} type="button" aria-pressed={value === item} onClick={() => onChange(item)} className={`min-h-10 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 ${value === item ? 'bg-white text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-zinc-600 hover:text-zinc-950'}`}>{item}</button>)}
  </div>
}

function CreativeEditor({
  creative,
  variant,
  variants,
  onVariantChange,
  onCreativeChange,
  onUpload,
  onRemoveMedia,
  onDimensions,
  onDuplicate,
}: {
  creative: Creative
  variant: VariantKey
  variants: Record<VariantKey, Creative>
  onVariantChange: (next: VariantKey) => void
  onCreativeChange: (key: keyof Creative, value: string) => void
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveMedia: () => void
  onDimensions: (width: number, height: number) => void
  onDuplicate: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const media = creative.media

  return <section aria-labelledby="editor-title" className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm font-medium text-zinc-500">Creative setup</p><h2 id="editor-title" className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Edit your ad</h2></div>
      <button type="button" onClick={onDuplicate} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"><Copy size={16} /> Duplicate A → B</button>
    </div>
    <div className="mt-5 flex items-center gap-2 border-b border-zinc-200" role="tablist" aria-label="Creative variants">
      {(['A', 'B'] as const).map((key) => <button key={key} role="tab" aria-selected={variant === key} type="button" onClick={() => onVariantChange(key)} className={`min-h-11 border-b-2 px-3 text-sm font-medium ${variant === key ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}>Variant {key}<span className="ml-2 text-zinc-500">{variants[key].brand || 'Untitled'}</span></button>)}
    </div>

    <div className="mt-5 space-y-4">
      <label className="block text-sm font-medium text-zinc-800" htmlFor={inputIds.brand}>Brand / Advertiser Name
        <input id={inputIds.brand} value={creative.brand} onChange={(event) => onCreativeChange('brand', event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base font-normal text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950" placeholder="Your brand name" />
      </label>
      <label className="block text-sm font-medium text-zinc-800" htmlFor={inputIds.headline}>Headline <span className="float-right font-normal tabular-nums text-zinc-500">{creative.headline.length} / 50 recommended</span>
        <input id={inputIds.headline} maxLength={90} value={creative.headline} onChange={(event) => onCreativeChange('headline', event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base font-normal text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950" placeholder="Write a clear, specific headline" />
      </label>
      <label className="block text-sm font-medium text-zinc-800" htmlFor={inputIds.description}>Description <span className="float-right font-normal tabular-nums text-zinc-500">{creative.description.length} / 120</span>
        <textarea id={inputIds.description} rows={3} maxLength={240} value={creative.description} onChange={(event) => onCreativeChange('description', event.target.value)} className="mt-1.5 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-base font-normal leading-relaxed text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950" placeholder="Explain the value in one or two sentences" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-800" htmlFor={inputIds.cta}>Call to Action
          <select id={inputIds.cta} value={creative.cta} onChange={(event) => onCreativeChange('cta', event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base font-normal text-zinc-950 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"><option value="">Choose an action</option>{ctaOptions.map((cta) => <option key={cta} value={cta}>{cta}</option>)}</select>
        </label>
        <label className="block text-sm font-medium text-zinc-800" htmlFor={inputIds.destinationUrl}>Destination URL
          <input id={inputIds.destinationUrl} type="url" inputMode="url" value={creative.destinationUrl} onChange={(event) => onCreativeChange('destinationUrl', event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base font-normal text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950" placeholder="https://example.com/offer" />
        </label>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3"><span className="text-sm font-medium text-zinc-800">Creative Media</span>{media && <button type="button" onClick={onRemoveMedia} className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-950"><X size={15} /> Remove media</button>}</div>
        <input ref={fileInputRef} id={inputIds.media} type="file" accept="image/*,video/mp4,video/webm" className="sr-only" onChange={onUpload} />
        <div onDragEnter={(event) => { event.preventDefault(); setDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file && (file.type.startsWith('image/') || file.type === 'video/mp4' || file.type === 'video/webm') && fileInputRef.current) { const transfer = new DataTransfer(); transfer.items.add(file); fileInputRef.current.files = transfer.files; fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true })) } }} className={`rounded-lg border border-dashed p-4 transition-colors ${dragging ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-300 bg-[#F8F9FA]'}`}>
          {media ? <div className="flex flex-wrap items-center gap-3">
            <MediaThumbnail creative={creative} onDimensions={onDimensions} className="h-20 w-28 shrink-0 overflow-hidden rounded-md border border-zinc-200" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-zinc-900">{media.name}</p><p className="mt-1 text-sm tabular-nums text-zinc-600">{media.sample ? 'Built-in sample · ' : ''}{dimensionsLabel(media)}</p><p className="mt-1 text-sm text-zinc-500">{media.mimeType.startsWith('video/') ? 'Video' : 'Image'} media</p></div>
          </div> : <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-24 w-full flex-col items-center justify-center gap-2 text-center text-sm text-zinc-600"><span className="grid size-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700"><Upload size={18} /></span><span><span className="font-medium text-zinc-900">Choose a file</span> or drop it here</span><span>Images, MP4, or WebM</span></button>}
          {media && <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"><ImagePlus size={16} /> Replace media</button>}
        </div>
      </div>
    </div>
  </section>
}

function MediaThumbnail({ creative, onDimensions, className = '' }: { creative: Creative; onDimensions: (width: number, height: number) => void; className?: string }) {
  const media = creative.media
  if (!media) return <div className={`grid place-items-center bg-zinc-100 ${className}`}><FileImage size={22} className="text-zinc-500" /></div>
  if (media.sample) return <SampleArtwork brand={creative.brand} className={className} />
  if (media.mimeType.startsWith('video/')) return <video src={media.src} className={`bg-[#0D0F12] object-cover ${className}`} muted playsInline onLoadedMetadata={(event) => onDimensions(event.currentTarget.videoWidth, event.currentTarget.videoHeight)} />
  return <Image src={media.src} alt={`${creative.brand} creative`} width={media.width ?? 600} height={media.height ?? 314} unoptimized className={`bg-zinc-100 object-cover ${className}`} onLoad={(event) => onDimensions(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} />
}

function SampleArtwork({ brand, className = '' }: { brand: string; className?: string }) {
  const isSaaS = brand.toLowerCase().includes('ledger')
  return <div aria-label={`${brand} sample artwork`} className={`relative isolate overflow-hidden bg-[#0D0F12] ${className}`}>
    <div className={`absolute -right-1/4 top-1/4 h-3/4 w-3/4 rotate-12 border ${isSaaS ? 'border-emerald-400/70 bg-emerald-500/20' : 'border-[#7ECBF9]/70 bg-[#7ECBF9]/25'}`} />
    <div className="absolute bottom-0 left-0 top-0 w-[40%] bg-white/5" />
    <div className="absolute left-3 top-3 flex size-9 items-center justify-center border border-white/30 text-sm font-semibold text-white">{isSaaS ? 'L' : 'N'}</div>
    <div className="absolute bottom-3 left-3"><p className="text-sm font-medium text-white">{isSaaS ? 'Clear books.' : 'Daily care.'}</p><p className="mt-1 text-sm text-white/70">{isSaaS ? 'One view.' : 'Made simple.'}</p></div>
  </div>
}

function PublisherChrome({ children, mode }: { children: React.ReactNode; mode: PreviewMode }) {
  return <div className={`mx-auto w-full overflow-hidden rounded-lg border border-zinc-200 bg-white ${mode === 'Mobile' ? 'max-w-[390px]' : 'max-w-[900px]'}`}>
    <div className="flex h-11 items-center gap-2 border-b border-zinc-200 px-4"><span className="size-2.5 rounded-full bg-zinc-300" /><span className="size-2.5 rounded-full bg-zinc-300" /><span className="size-2.5 rounded-full bg-zinc-300" /><span className="ml-3 min-w-0 flex-1 truncate rounded border border-zinc-200 bg-[#F8F9FA] px-3 py-1 text-sm text-zinc-500">dailyledger.in / business</span></div>
    {children}
  </div>
}

function NativeAd({ creative, mode, onDimensions }: { creative: Creative; mode: PreviewMode; onDimensions: (width: number, height: number) => void }) {
  return <PublisherChrome mode={mode}><article className="p-5 sm:p-7"><p className="text-sm font-semibold uppercase tracking-wide text-zinc-700">The Daily Ledger <span className="font-normal text-zinc-500">/ Business</span></p><h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">A closer look at the choices shaping everyday business</h3><p className="mt-2 text-sm leading-relaxed text-zinc-600">Independent teams are finding practical ways to work with less friction and more clarity.</p><div className="mt-5 max-w-2xl border border-zinc-200 bg-white p-3"><div className="flex items-center gap-3"><MediaThumbnail creative={creative} onDimensions={onDimensions} className="aspect-[1.91/1] w-2/5 shrink-0 rounded-sm" /><div className="min-w-0"><span className="inline-flex rounded border border-zinc-200 px-2 py-1 text-sm font-medium text-zinc-600">Sponsored</span><p className="mt-2 text-sm font-medium text-zinc-600">{creative.brand || 'Your brand'}</p><p className="mt-1 line-clamp-2 text-base font-semibold text-zinc-950">{creative.headline || 'Your headline appears here'}</p><p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-600">{creative.description || 'Your description will appear here.'}</p><PreviewButton creative={creative} /></div></div></div><div className="mt-5 space-y-2" aria-hidden="true"><div className="h-2 rounded-full bg-zinc-100" /><div className="h-2 w-11/12 rounded-full bg-zinc-100" /><div className="h-2 w-4/5 rounded-full bg-zinc-100" /></div></article></PublisherChrome>
}

function PreviewButton({ creative }: { creative: Creative }) {
  return <span className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-[#09090B] px-3 text-sm font-semibold text-white">{creative.cta || 'Choose action'} <ArrowRight size={15} /></span>
}

function DisplayAds({ creative, mode, onDimensions }: { creative: Creative; mode: PreviewMode; onDimensions: (width: number, height: number) => void }) {
  const compact = mode === 'Mobile'
  const placement = (shape: 'rectangle' | 'leaderboard') => <div className={`relative flex overflow-hidden border border-zinc-200 bg-white p-3 ${shape === 'rectangle' ? 'h-[250px] w-[300px] max-w-full flex-col' : compact ? 'h-[100px] w-[320px] max-w-full items-center gap-3' : 'h-[90px] w-[728px] max-w-full items-center gap-4'}`}>
    <MediaThumbnail creative={creative} onDimensions={onDimensions} className={`${shape === 'rectangle' ? 'h-24 w-full' : 'h-full w-24 shrink-0'} rounded-sm`} />
    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-zinc-600">{creative.brand || 'Your brand'} · Sponsored</p><p className="mt-1 line-clamp-2 text-base font-semibold text-zinc-950">{creative.headline || 'Your headline appears here'}</p>{shape === 'leaderboard' && !compact && <p className="mt-1 line-clamp-1 text-sm text-zinc-600">{creative.description || 'Your description appears here.'}</p>}</div>
    <PreviewButton creative={creative} />
  </div>

  return <PublisherChrome mode={mode}><div className="p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold uppercase tracking-wide text-zinc-700">The Daily Ledger</p><p className="mt-1 text-sm text-zinc-600">Today’s business briefing</p></div><span className="rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600">Search</span></div><div className="mt-5 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]"><div><p className="mb-2 text-sm font-medium text-zinc-600">300 × 250 medium rectangle</p>{placement('rectangle')}</div><div className="min-w-0"><p className="mb-2 text-sm font-medium text-zinc-600">{compact ? '320 × 100 mobile banner' : '728 × 90 leaderboard'}</p>{placement('leaderboard')}<div className="mt-5 space-y-2" aria-hidden="true"><div className="h-2 rounded-full bg-zinc-100" /><div className="h-2 w-10/12 rounded-full bg-zinc-100" /></div></div></div></div></PublisherChrome>
}

function VideoAd({ creative, mode, onDimensions }: { creative: Creative; mode: PreviewMode; onDimensions: (width: number, height: number) => void }) {
  const media = creative.media
  const hasVideo = media && !media.sample && media.mimeType.startsWith('video/')
  return <PublisherChrome mode={mode}><div className="p-5 sm:p-7"><p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-700">Sponsored video · {creative.brand || 'Your brand'}</p><div className="relative mx-auto aspect-video max-h-[450px] overflow-hidden bg-[#0D0F12]">
    {hasVideo ? <video src={media.src} className="h-full w-full object-contain" controls playsInline onLoadedMetadata={(event) => onDimensions(event.currentTarget.videoWidth, event.currentTarget.videoHeight)} /> : <><MediaThumbnail creative={creative} onDimensions={onDimensions} className="absolute inset-0 h-full w-full opacity-40" /><div className="absolute inset-0 grid place-items-center"><span className="grid size-16 place-items-center rounded-full border border-white/80 bg-white text-[#09090B]"><Video size={24} /></span></div><span className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 text-sm font-medium tabular-nums text-white">0:15</span></>}
    <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-black/75 p-4 text-white"><div><p className="text-base font-semibold">{creative.headline || 'Your headline appears here'}</p><p className="mt-1 text-sm text-white/80">{creative.description || 'Your description appears here.'}</p></div><PreviewButton creative={creative} /></div>
  </div></div></PublisherChrome>
}

function SinglePreview({ creative, format, mode, onDimensions }: { creative: Creative; format: Exclude<AdFormat, 'All Formats'>; mode: PreviewMode; onDimensions: (width: number, height: number) => void }) {
  if (format === 'Native') return <NativeAd creative={creative} mode={mode} onDimensions={onDimensions} />
  if (format === 'Display') return <DisplayAds creative={creative} mode={mode} onDimensions={onDimensions} />
  return <VideoAd creative={creative} mode={mode} onDimensions={onDimensions} />
}

function AllFormatPreview({ creative, mode, onDimensions }: { creative: Creative; mode: PreviewMode; onDimensions: (width: number, height: number) => void }) {
  const formats: Exclude<AdFormat, 'All Formats'>[] = ['Native', 'Display', 'Video']
  return <div className="grid gap-4 xl:grid-cols-2">{formats.map((format) => <section key={format} className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white"><h3 className="border-b border-zinc-200 px-4 py-3 text-base font-semibold text-zinc-950">{format} placement</h3><div className="overflow-hidden"><SinglePreview creative={creative} format={format} mode={mode} onDimensions={onDimensions} /></div></section>)}</div>
}

function PreflightQA({ creative, format, onFocus }: { creative: Creative; format: AdFormat; onFocus: (id: CheckResult['id']) => void }) {
  const checks = getChecks(creative, format)
  const errors = checks.filter((check) => check.status === 'error').length
  const warnings = checks.filter((check) => check.status === 'warning').length
  const ready = errors === 0 && warnings === 0
  const statusText = errors ? `${errors} ${errors === 1 ? 'issue' : 'issues'} found` : warnings ? `${warnings} ${warnings === 1 ? 'check' : 'checks'} to review` : 'Ready to launch'

  return <section aria-labelledby="qa-title" className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-zinc-500">Deterministic checks</p><h2 id="qa-title" className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Pre-flight QA</h2></div><span className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium ${ready ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : errors ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}><span className={`size-2 rounded-full ${ready ? 'bg-emerald-600' : errors ? 'bg-red-600' : 'bg-amber-600'}`} />{statusText}</span></div>
    <p className="mt-2 text-sm leading-relaxed text-zinc-600">Checks use the creative fields and media dimensions entered here. Select a row to jump to its field.</p>
    <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">{checks.map((check) => {
      const pass = check.status === 'pass'
      const color = pass ? 'text-emerald-700' : check.status === 'error' ? 'text-red-700' : 'text-amber-700'
      return <li key={check.id}><button type="button" onClick={() => onFocus(check.id)} className="flex min-h-[68px] w-full items-center justify-between gap-4 py-3 text-left hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-950"><span className="min-w-0"><span className="block text-sm font-medium text-zinc-900">{check.label}</span><span className="mt-1 block text-sm leading-relaxed text-zinc-600">{check.detail}</span></span><span className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-medium ${color}`}>{pass && <Check size={16} />}{check.status === 'error' ? 'Fix' : check.status === 'warning' ? 'Review' : 'Pass'}</span></button></li>
    })}</ul>
    <p className="mt-3 text-sm text-zinc-500">No automated copy score or simulated approval is used.</p>
  </section>
}

export function AdTesterWorkspace() {
  const [variants, setVariants] = useState<Record<VariantKey, Creative>>(initialCreatives)
  const [activeVariant, setActiveVariant] = useState<VariantKey>('A')
  const [format, setFormat] = useState<AdFormat>('Native')
  const [mode, setMode] = useState<PreviewMode>('Desktop')
  const [compare, setCompare] = useState(false)
  const [sampleIndex, setSampleIndex] = useState(0)
  const objectUrls = useRef(new Set<string>())
  const activeCreative = variants[activeVariant]
  const launchFormat = format === 'All Formats' ? 'Native' : format
  const launchHref = useMemo(() => {
    const params = new URLSearchParams({
      headline: activeCreative.headline,
      description: activeCreative.description,
      destinationUrl: activeCreative.destinationUrl,
      cta: activeCreative.cta,
      format: launchFormat,
      brand: activeCreative.brand,
    })
    return `/campaigns/new?${params.toString()}`
  }, [activeCreative, launchFormat])

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrls.current.clear()
  }, [])

  useEffect(() => {
    const activeUrls = new Set(Object.values(variants).flatMap((creative) => creative.media && !creative.media.sample ? [creative.media.src] : []))
    objectUrls.current.forEach((url) => {
      if (!activeUrls.has(url)) {
        URL.revokeObjectURL(url)
        objectUrls.current.delete(url)
      }
    })
  }, [variants])

  const updateActive = useCallback((key: keyof Creative, value: string) => {
    setVariants((current) => ({ ...current, [activeVariant]: { ...current[activeVariant], [key]: value } }))
  }, [activeVariant])

  const addMedia = useCallback((file: File) => {
    const src = URL.createObjectURL(file)
    objectUrls.current.add(src)
    setVariants((current) => {
      const next = { ...current, [activeVariant]: { ...current[activeVariant], media: { src, name: file.name, mimeType: file.type, width: null, height: null, sample: false, file } } }
      return next
    })
  }, [activeVariant])

  const onUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) addMedia(file)
    event.target.value = ''
  }, [addMedia])

  const removeMedia = useCallback(() => {
    setVariants((current) => {
      const next = { ...current, [activeVariant]: { ...current[activeVariant], media: null } }
      return next
    })
  }, [activeVariant])

  const updateDimensions = useCallback((key: VariantKey, width: number, height: number) => {
    if (!width || !height) return
    setVariants((current) => {
      const media = current[key].media
      if (!media || media.sample || media.width === width && media.height === height) return current
      return { ...current, [key]: { ...current[key], media: { ...media, width, height } } }
    })
  }, [])

  const duplicateAtoB = useCallback(() => {
    const source = variants.A
    let media = source.media
    if (media && !media.sample && media.file) {
      const src = URL.createObjectURL(media.file)
      objectUrls.current.add(src)
      media = { ...media, src }
    }
    setVariants((current) => ({ ...current, B: { ...source, media } }))
    setActiveVariant('B')
  }, [variants.A])

  const loadSample = (index: number) => {
    setSampleIndex(index)
    const sample = sampleCreatives[index].creative
    setVariants((current) => ({ ...current, [activeVariant]: { ...sample, media: sample.media ? { ...sample.media } : null } }))
  }

  const focusCheck = (id: CheckResult['id']) => {
    const key = id === 'attribution' ? (!activeCreative.brand.trim() ? 'brand' : 'cta') : id
    const input = document.getElementById(inputIds[key])
    input?.focus()
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const renderPreview = (key: VariantKey) => <SinglePreview creative={variants[key]} format={launchFormat} mode={mode} onDimensions={(width, height) => updateDimensions(key, width, height)} />

  return <div className="min-h-screen bg-[#EEF0F3] text-zinc-950">
    <header className="sticky top-0 z-30 min-h-16 border-b border-zinc-200 bg-white sm:h-16">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-2 sm:h-full sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0">
        <div className="flex min-w-0 items-center gap-3"><Link href="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-zinc-950 hover:text-zinc-600"><ArrowLeft size={17} /> RivinityADS</Link><span aria-hidden="true" className="h-6 w-px bg-zinc-200" /><h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950">Ad Tester</h1></div>
        <div className="ml-auto flex max-w-full shrink-0 items-center gap-2 sm:gap-3"><label className="sr-only" htmlFor="sample-select">Load a sample creative</label><select id="sample-select" value={sampleIndex} onChange={(event) => loadSample(Number(event.target.value))} className="min-h-10 max-w-[130px] rounded-md border border-zinc-300 bg-white px-2 text-sm font-medium text-zinc-800 sm:max-w-none sm:px-3"><option value={0}>Load Sample · Nila Botanics</option><option value={1}>Load Sample · LedgerLeaf</option></select><Link aria-label="Launch with this creative" href={launchHref} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-md bg-[#09090B] px-3 text-sm font-semibold text-white hover:bg-zinc-800 sm:px-4"><span className="sm:hidden">Launch</span><span className="hidden sm:inline">Launch with this creative</span><ArrowRight size={16} /></Link></div>
      </div>
    </header>

    <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-5"><CreativeEditor creative={activeCreative} variant={activeVariant} variants={variants} onVariantChange={setActiveVariant} onCreativeChange={updateActive} onUpload={onUpload} onRemoveMedia={removeMedia} onDimensions={(width, height) => updateDimensions(activeVariant, width, height)} onDuplicate={duplicateAtoB} /></div>
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6 lg:col-span-7">
        <section aria-label="Preview controls" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3"><PillTabs label="Placement format" items={['Native', 'Display', 'Video', 'All Formats'] as const} value={format} onChange={setFormat} /><div className="hidden h-8 w-px bg-zinc-200 sm:block" /><PillTabs label="Preview size" items={['Desktop', 'Mobile'] as const} value={mode} onChange={setMode} /></div>
          <button type="button" aria-pressed={compare} onClick={() => setCompare((current) => !current)} className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium ${compare ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'}`}><Monitor size={16} /><Smartphone size={15} /> Compare A vs B</button>
        </section>

        <section aria-labelledby="preview-title" className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium text-zinc-500">Publisher context</p><h2 id="preview-title" className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Live placement preview</h2></div><span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm text-zinc-600">{mode === 'Desktop' ? <Monitor size={16} /> : <Smartphone size={16} />}{mode} · {format}</span></div>
          {compare ? <div className="grid min-w-0 gap-5 xl:grid-cols-2"><div className="min-w-0"><h3 className="mb-3 text-base font-semibold text-zinc-950">Variant A</h3>{format === 'All Formats' ? <AllFormatPreview creative={variants.A} mode={mode} onDimensions={(w, h) => updateDimensions('A', w, h)} /> : renderPreview('A')}</div><div className="min-w-0"><h3 className="mb-3 text-base font-semibold text-zinc-950">Variant B</h3>{format === 'All Formats' ? <AllFormatPreview creative={variants.B} mode={mode} onDimensions={(w, h) => updateDimensions('B', w, h)} /> : renderPreview('B')}</div></div>
            : format === 'All Formats' ? <AllFormatPreview creative={activeCreative} mode={mode} onDimensions={(w, h) => updateDimensions(activeVariant, w, h)} /> : renderPreview(activeVariant)}
        </section>

        <PreflightQA creative={activeCreative} format={format} onFocus={focusCheck} />
      </div>
    </main>
  </div>
}
