'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Check, Globe2, Menu, Play, Target, X } from 'lucide-react'

type Role = 'advertiser' | 'publisher'
type Format = 'Native' | 'Display' | 'Push' | 'Video'

const roleContent: Record<Role, {
  eyebrow: string
  headline: string
  description: string
  cta: string
  href: string
  stats: { value: string; label: string }[]
}> = {
  advertiser: {
    eyebrow: 'For buying teams',
    headline: 'Reach the right audience. See what it costs.',
    description: 'Set a budget, choose where ads appear, and follow delivery from the first impression.',
    cta: 'Create a campaign',
    href: '/campaigns/new',
    stats: [
      { value: '₹4.2L+', label: 'daily spend managed' },
      { value: '1.2B', label: 'monthly impressions' },
      { value: '<40ms', label: 'auction response' },
    ],
  },
  publisher: {
    eyebrow: 'For supply teams',
    headline: 'Make every placement work harder.',
    description: 'Manage inventory, monitor fill, and follow earnings across your sites in one workspace.',
    cta: 'View publisher tools',
    href: '/publisher',
    stats: [
      { value: '98.4%', label: 'sample fill rate' },
      { value: '₹12L+', label: 'monthly payouts tracked' },
      { value: '<40ms', label: 'auction response' },
    ],
  },
}

const formats: Record<Format, { ratio: string; ctr: string; use: string }> = {
  Native: { ratio: '1.91:1', ctr: '1.20%', use: 'In-feed articles and recommendations' },
  Display: { ratio: '300 × 250', ctr: '0.42%', use: 'Sidebar and standard page placements' },
  Push: { ratio: '2:1', ctr: '1.80%', use: 'Opt-in alerts and return visits' },
  Video: { ratio: '16:9', ctr: '0.85%', use: 'In-stream and editorial video' },
}

const pipeline = [
  { number: '01', title: 'Placement request', detail: 'A page calls for an ad.' },
  { number: '02', title: 'Bid match', detail: 'Eligible campaigns compete.' },
  { number: '03', title: 'Creative delivery', detail: 'The selected ad is served.' },
  { number: '04', title: 'Verified attribution', detail: 'Delivery and events are recorded.' },
]

const builderSteps: { label: string; mediaSrc?: string }[] = [
  { label: 'Format & Goal' },
  { label: 'Geo & ₹ Budget' },
  { label: 'Creative & QA' },
  { label: 'Review & Launch' },
]

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.14 }} transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

function Brand() {
  return <Link href="/" aria-label="RivinityADS home" className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-950"><span className="grid size-8 place-items-center rounded-md bg-[#0D0F12] text-sm font-semibold text-white">R</span><span>RivinityADS</span></Link>
}

function CampaignWalkthroughWindow() {
  const [step, setStep] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (hovered) return
    const timer = window.setTimeout(() => {
      setStep((prev) => (prev + 1) % builderSteps.length)
    }, 3500)
    return () => window.clearTimeout(timer)
  }, [step, hovered])

  const selectStep = (index: number) => setStep(index)

  return <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_16px_40px_-16px_rgba(9,9,11,0.12)]" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <div className="grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-zinc-200/80 px-3 sm:px-4"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-zinc-200" /><i className="size-2 rounded-full bg-zinc-200" /><i className="size-2 rounded-full bg-zinc-200" /></span><span className="truncate rounded border border-zinc-200/80 bg-white px-3 py-1.5 text-sm text-zinc-600">rivinityads.com/campaigns/new</span><span className="justify-self-end whitespace-nowrap rounded border border-zinc-200/80 px-2 py-1 text-sm font-medium text-zinc-700">Step {step + 1}/4</span></div>
    <div className="relative min-h-[420px]"><CampaignBuilderPreview step={step} /></div>
    <div className="flex items-center justify-center gap-2 border-t border-zinc-200/80 bg-white px-4 py-3">{builderSteps.map((item, index) => <button key={item.label} type="button" aria-label={`Show step ${index + 1}: ${item.label}`} aria-pressed={step === index} onClick={() => selectStep(index)} className={`relative grid size-9 place-items-center overflow-hidden border text-sm font-semibold tabular-nums transition-colors ${step === index ? 'border-sky-400 text-zinc-950' : 'border-zinc-200/80 text-zinc-600 hover:border-zinc-400'}`}><span className="relative z-10">0{index + 1}</span>{step === index && <motion.span key={step} aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[#7ECBF9]" initial={{ scaleX: 0 }} animate={{ scaleX: hovered ? 0 : 1 }} transition={{ duration: 3.5, ease: 'linear' }} style={{ transformOrigin: 'left' }} />}</button>)}</div>
  </div>
}

function CampaignBuilderPreview({ step }: { step: number }) {
  const mediaSrc = builderSteps[step].mediaSrc
  const isVideo = mediaSrc?.toLowerCase().endsWith('.mp4') || mediaSrc?.toLowerCase().endsWith('.webm')

  if (mediaSrc && isVideo) {
    return <video src={mediaSrc} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-contain" />
  }

  if (mediaSrc) {
    return <Image src={mediaSrc} alt={`Campaign builder step ${step + 1}`} fill unoptimized className="object-contain" />
  }

  return <AnimatePresence mode="wait">
    <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="mx-auto flex min-h-[350px] w-full max-w-3xl items-center px-4 py-8 sm:min-h-[370px] sm:px-8">
      {step === 0 && <div className="w-full"><div className="mb-5"><p className="text-sm font-medium text-zinc-500">Choose an ad format</p><h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Where should your ad appear?</h3></div><div className="grid gap-3 sm:grid-cols-3">{[['Native', 'In-feed placements'], ['Display', 'Standard inventory'], ['Video', 'In-stream placements']].map(([name, detail]) => <div key={name} className={`relative border bg-white p-4 ${name === 'Native' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-zinc-200/80'}`}>{name === 'Native' && <><motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-emerald-500" animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} /><span className="absolute right-3 top-3 z-10 grid size-5 place-items-center rounded-full bg-emerald-600 text-white"><Check size={12} /></span></>}
        {name === 'Native' && <div className="mb-3 flex h-16 items-center gap-2 border border-zinc-200/80 bg-white p-2"><div className="grid size-11 shrink-0 place-items-center border border-emerald-200 bg-emerald-50"><span className="size-5 rounded-full border-2 border-emerald-600" /></div><div className="min-w-0 flex-1"><span className="inline-block border border-zinc-200 bg-white px-1.5 py-0.5 text-sm font-medium text-zinc-600">Sponsored</span><i className="mt-1.5 block h-1.5 w-full bg-zinc-700" /><i className="mt-1 block h-1.5 w-2/3 bg-zinc-300" /></div><span className="self-end bg-[#09090B] px-2 py-1 text-sm font-semibold text-white">Shop</span></div>}
        {name === 'Display' && <div className="mb-3 flex h-16 flex-col justify-between border border-zinc-200 bg-white p-2"><div className="flex items-center gap-2"><span className="size-6 border border-sky-200 bg-[#7ECBF9]/50" /><i className="h-1.5 w-1/2 bg-zinc-700" /></div><div className="flex items-center justify-between bg-[#7ECBF9] px-2 py-1"><span className="text-sm font-semibold text-zinc-950">A better way to work</span><span className="bg-[#09090B] px-1.5 py-0.5 text-sm font-medium text-white">CTA</span></div></div>}
        {name === 'Video' && <div className="relative mb-3 flex h-16 items-center justify-center overflow-hidden bg-[#0F172A]"><span className="grid size-8 place-items-center rounded-full border border-white/80 bg-white text-[#0F172A]"><Play size={14} fill="currentColor" /></span><span className="absolute right-1.5 top-1.5 bg-black/70 px-1.5 py-0.5 text-sm font-medium tabular-nums text-white">0:15</span><span className="absolute inset-x-2 bottom-2 h-1 bg-white/30"><i className="block h-full w-1/3 bg-[#7ECBF9]" /></span></div>}
        <p className="text-sm font-semibold text-zinc-900">{name}</p><p className="mt-1 text-sm text-zinc-600">{detail}</p></div>)}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/80 pt-4"><div><p className="text-sm font-medium text-zinc-500">Campaign goal</p><p className="mt-1 text-sm font-semibold text-zinc-900">Website Conversions</p></div><span className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"><Check size={14} /> Goal selected</span></div></div>}
      {step === 1 && <div className="grid w-full items-center gap-6 sm:grid-cols-2"><div><p className="text-sm font-medium text-zinc-500">Target location</p><h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Set your delivery area.</h3><div className="mt-5 flex h-36 items-center justify-center border border-zinc-200/80 bg-white"><div className="relative grid size-28 place-items-center rounded-full border border-dashed border-emerald-500 bg-emerald-500/10"><span className="grid size-8 place-items-center rounded-full bg-white text-emerald-700"><Target size={17} /></span><span className="absolute -right-4 top-0 size-2 rounded-full bg-emerald-500" /></div></div><span className="mt-3 inline-flex items-center gap-2 border border-zinc-200/80 bg-white px-3 py-2 text-sm font-medium text-zinc-800"><Globe2 size={15} className="text-emerald-700" /> Delhi NCR <span className="font-sans tabular-nums text-zinc-600">· 25 km</span></span></div><div className="border border-zinc-200/80 bg-white p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-zinc-500">Daily budget</p><p className="mt-1 font-sans text-3xl font-semibold tabular-nums tracking-tight text-zinc-950">₹500 <span className="text-sm font-medium text-zinc-500">/ day</span></p></div><span className="grid size-8 place-items-center border border-zinc-200/80 text-zinc-500"><span className="font-sans text-lg">₹</span></span></div><div className="mt-7 h-2 rounded-full bg-zinc-100"><motion.div initial={{ width: '35%' }} animate={{ width: '68%' }} transition={{ duration: 1, ease: 'easeOut' }} className="relative h-full rounded-full bg-emerald-500"><span className="absolute -right-1.5 -top-1 size-4 rounded-full border-2 border-emerald-600 bg-white" /></motion.div></div><div className="mt-2 flex justify-between font-sans text-sm tabular-nums text-zinc-500"><span>₹100</span><span>₹1,000</span></div><p className="mt-6 border-t border-zinc-200/80 pt-4 text-sm leading-5 text-zinc-600">Your daily limit keeps delivery within the campaign budget.</p></div></div>}
      {step === 2 && <div className="grid w-full items-center gap-6 sm:grid-cols-[1fr_0.9fr]"><div><p className="text-sm font-medium text-zinc-500">Creative preview</p><h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Review the message and destination.</h3><div className="mt-5 border border-zinc-200/80 p-4"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-medium text-zinc-500">Native · 1.91:1</span><span className="border border-zinc-200/80 px-2 py-1 text-sm text-zinc-600">Draft 01</span></div><div className="relative flex h-24 items-center overflow-hidden border border-zinc-200/80 bg-[#0F172A] px-5"><span className="absolute right-8 top-3 size-14 rotate-12 border border-[#7ECBF9]/70" /><span className="absolute right-12 top-7 size-14 -rotate-12 border border-emerald-400/80 bg-emerald-500/20" /><div className="relative max-w-[60%]"><span className="inline-flex border border-white/30 px-2 py-0.5 text-sm font-medium text-white">SUMMER EDIT</span><p className="mt-2 text-sm font-semibold text-white">Made for everyday.</p></div><span className="absolute bottom-2 right-2 text-sm font-medium text-white/70">Creative preview</span></div><motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-3 text-sm font-semibold text-zinc-900">A better fit for your everyday routine.</motion.p><p className="mt-1 text-sm text-zinc-500">rivinityads.example/collection</p></div></div><div className="space-y-3"><span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"><Check size={14} /> Pre-flight Check Passed</span>{['Headline length', 'Image ratio', 'Landing page'].map((item) => <div key={item} className="flex items-center justify-between gap-3 border border-zinc-200/80 bg-white px-3 py-3"><span className="text-sm text-zinc-700">{item}</span><span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check size={14} /> Passed</span></div>)}<div className="border border-zinc-200/80 bg-white px-3 py-3 text-sm leading-5 text-zinc-600">Pre-flight checks run before a campaign can be submitted.</div></div></div>}
      {step === 3 && <div className="w-full"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-500">Final review</p><h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">Everything is ready to launch.</h3></div><span className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"><Check size={15} /> Campaign Live</span></div><div className="mt-5 grid gap-3 border border-zinc-200/80 bg-white p-4 sm:grid-cols-3"><div><p className="text-sm text-zinc-500">Format &amp; goal</p><p className="mt-1 text-sm font-semibold text-zinc-900">Native · Website Conversions</p></div><div><p className="text-sm text-zinc-500">Location &amp; budget</p><p className="mt-1 font-sans text-sm font-semibold tabular-nums text-zinc-900">Delhi NCR · ₹500 / day</p></div><div><p className="text-sm text-zinc-500">Creative checks</p><p className="mt-1 text-sm font-semibold text-zinc-900">All checks passed</p></div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-zinc-200/80 bg-white px-4 py-3"><span className="text-sm text-zinc-700">Estimated delivery</span><span className="font-sans text-base font-semibold tabular-nums text-zinc-950">18K–24K impressions / day</span></div></div>}
    </motion.div>
  </AnimatePresence>
}

function AdPreview({ format }: { format: Format }) {
  return <AnimatePresence mode="wait">
    <motion.div key={format} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="h-full">
      <div className="flex h-12 items-center justify-between border-b border-zinc-200/80 px-4"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-zinc-300" /><span className="size-2 rounded-full bg-zinc-300" /><span className="size-2 rounded-full bg-zinc-300" /></div><span className="truncate rounded border border-zinc-200/80 bg-white px-3 py-1.5 text-sm text-zinc-600">sample-publication.com / stories</span><span className="hidden text-sm text-zinc-500 sm:block">•••</span></div>
      <article className="mx-auto max-w-4xl p-5 sm:p-7"><p className="text-sm font-medium uppercase tracking-[0.1em] text-zinc-600">The Daily Ledger <span className="mx-1 text-zinc-400">/</span> Business</p><h3 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.03em] text-zinc-950 sm:text-3xl">What a changing market means for independent businesses</h3><p className="mt-2 text-sm text-zinc-600">By Morgan Lee <span className="px-1">·</span> 6 min read</p><div className="mt-5 max-w-3xl space-y-2"><div className="h-2 w-full rounded-full bg-zinc-100" /><div className="h-2 w-[92%] rounded-full bg-zinc-100" /><div className="h-2 w-[78%] rounded-full bg-zinc-100" /></div>
        <div className="mt-5 max-w-3xl border border-zinc-200/80 bg-white p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><span className="inline-flex items-center border border-zinc-200/80 px-2.5 py-1 text-sm font-medium text-zinc-700">Sponsored</span><span className="text-sm text-zinc-500">{format}</span></div><div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center"><div className="relative flex h-28 items-center justify-center overflow-hidden bg-[#0D0F12] sm:h-32"><span className="absolute left-4 top-4 size-14 border border-zinc-500" /><span className="absolute bottom-4 right-4 h-16 w-16 border border-emerald-500 bg-emerald-500" /><span className="absolute left-1/2 top-1/2 h-10 w-24 -translate-x-1/2 -translate-y-1/2 border border-white/70" />{format === 'Video' && <span className="relative grid size-10 place-items-center border border-white bg-white text-zinc-950"><Play size={16} fill="currentColor" /></span>}{format === 'Push' && <span className="absolute left-2 top-2 bg-white px-2 py-1 text-sm font-medium text-zinc-800">Daily brief</span>}</div><div><p className="text-base font-semibold leading-snug text-zinc-950">A practical guide to smarter energy use</p><p className="mt-1.5 text-sm leading-relaxed text-zinc-600">See how small changes can make a measurable difference at home.</p><button type="button" className="mt-3 inline-flex items-center gap-2 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Learn more <ArrowRight size={14} /></button></div></div></div>
        <div className="mt-5 max-w-3xl space-y-2"><div className="h-2 w-full rounded-full bg-zinc-100" /><div className="h-2 w-[86%] rounded-full bg-zinc-100" /><div className="h-2 w-[70%] rounded-full bg-zinc-100" /></div>
      </article>
    </motion.div>
  </AnimatePresence>
}


type GeoRadius = 10 | 25 | 50
type LedgerFilter = 'all' | 'spring' | 'retargeting'

function GeoMapPreview() {
  const [radius, setRadius] = useState<GeoRadius>(25)
  const [center, setCenter] = useState({ x: 212, y: 98 })
  const radiusSize: Record<GeoRadius, number> = { 10: 25, 25: 48, 50: 82 }
  const reach: Record<GeoRadius, string> = { 10: '620K', 25: '1.4M', 50: '2.9M' }

  return <div className="relative mt-6 h-56 overflow-hidden border border-zinc-200/80 bg-white">
    <svg viewBox="0 0 420 208" preserveAspectRatio="none" className="absolute inset-0 h-full w-full cursor-crosshair" role="img" aria-label={`Map centered on Delhi NCR with a ${radius} kilometer targeting radius`} onClick={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      setCenter({
        x: Math.max(24, Math.min(396, ((event.clientX - bounds.left) / bounds.width) * 420)),
        y: Math.max(20, Math.min(188, ((event.clientY - bounds.top) / bounds.height) * 208)),
      })
    }}>
      <rect width="420" height="208" fill="#FFFFFF" />
      <path d="M0 149 52 132 99 142 138 121 188 133 218 117 260 126 300 108 345 120 420 95V208H0Z" fill="#F4F4F5" />
      <path d="M20 0h47v38H20zM82 12h58v35H82zM153 0h43v43h-43zM212 12h54v35h-54zM282 0h47v39h-47zM343 13h57v34h-57zM0 53h46v34H0zM60 58h55v39H60zM132 53h51v39h-51zM203 58h45v36h-45zM267 53h58v38h-58zM340 57h80v36h-80z" fill="#F4F4F5" />
      <path d="M-8 104 427 70M-4 183 425 145M44-8 77 216M184-4 164 213M322-4 344 215" fill="none" stroke="#E4E4E7" strokeWidth="5" />
      <path d="M0 31 420 187M12 122 399 40M112 0 286 208M402 0 228 208" fill="none" stroke="#D4D4D8" strokeWidth="2" />
      <path d="M0 160 55 142 107 152 142 133 197 147 230 128 274 137 310 119 356 132 420 108" fill="none" stroke="#E4E4E7" strokeWidth="1" />
      <motion.circle cx={center.x} cy={center.y} r={radiusSize[radius]} fill="rgba(16, 185, 129, 0.12)" stroke="#10B981" strokeWidth="1.5" strokeDasharray="5 4" animate={{ cx: center.x, cy: center.y, r: radiusSize[radius] }} transition={{ type: 'spring', stiffness: 150, damping: 22 }} />
      <motion.g animate={{ x: center.x - 212, y: center.y - 98 }} transition={{ type: 'spring', stiffness: 150, damping: 22 }}>
        <circle cx="212" cy="98" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M212 91c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Z" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" />
        <circle cx="212" cy="98" r="2" fill="#059669" />
      </motion.g>
    </svg>
    <div className="absolute left-2 top-2 flex flex-col gap-1.5">
      <span className="w-fit border border-black/10 bg-white px-2 py-1 text-sm font-medium text-zinc-900">Delhi NCR</span>
      <div role="group" aria-label="Targeting radius" className="flex border border-black/10 bg-white p-0.5">
        {([10, 25, 50] as GeoRadius[]).map((value) => <button key={value} type="button" aria-pressed={radius === value} onClick={() => setRadius(value)} className={`px-2 py-1 text-sm font-medium tabular-nums transition-colors ${radius === value ? 'bg-[#09090B] text-white' : 'text-zinc-700 hover:bg-sky-100'}`}>{value} km</button>)}
      </div>
    </div>
    <span aria-live="polite" className="absolute bottom-2 right-2 border border-black/10 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-900"><span className="font-sans tabular-nums">{reach[radius]}</span> est. reach</span>
  </div>
}

function BillingLedgerPreview() {
  const [filter, setFilter] = useState<LedgerFilter>('all')
  const totals: Record<LedgerFilter, { spend: string; clicks: string; fee: string }> = {
    all: { spend: '₹4,153.00', clicks: '1,209', fee: '₹0.00' },
    spring: { spend: '₹2,410.00', clicks: '718', fee: '₹0.00' },
    retargeting: { spend: '₹1,743.00', clicks: '491', fee: '₹0.00' },
  }
  const rows: { key: LedgerFilter; label: string; amount: string }[] = [
    { key: 'all', label: 'All campaigns', amount: '₹4,153.00' },
    { key: 'spring', label: 'Spring Launch · Native', amount: '₹2,410.00' },
    { key: 'retargeting', label: 'Retargeting · Display', amount: '₹1,743.00' },
  ]
  const activeTotals = totals[filter]

  return <div className="mt-6 flex h-56 flex-col border border-zinc-200/80 p-3">
    <div className="grid grid-cols-3 gap-2 border-b border-zinc-200/80 pb-1.5">
      <div><p className="whitespace-nowrap text-sm font-medium uppercase leading-4 tracking-wide text-zinc-600">Spend</p><p className="mt-0.5 whitespace-nowrap font-sans text-sm font-semibold leading-4 tabular-nums text-zinc-900">{activeTotals.spend}</p></div>
      <div><p className="whitespace-nowrap text-sm font-medium uppercase leading-4 tracking-wide text-zinc-600">Clicks</p><p className="mt-0.5 font-sans text-sm font-semibold leading-4 tabular-nums text-zinc-900">{activeTotals.clicks}</p></div>
      <div><p className="whitespace-nowrap text-sm font-medium uppercase leading-4 tracking-wide text-zinc-600">Fee</p><p className="mt-0.5 font-sans text-sm font-semibold leading-4 tabular-nums text-zinc-900">{activeTotals.fee}</p></div>
    </div>
    <div className="flex flex-1 flex-col justify-center gap-0">
      {rows.map((row) => <button key={row.key} type="button" aria-pressed={filter === row.key} onClick={() => setFilter((current) => current === row.key && row.key !== 'all' ? 'all' : row.key)} className={`flex w-full items-center justify-between gap-2 border px-2 py-0.5 text-left text-sm leading-5 transition-colors ${filter === row.key ? 'border-emerald-500/40 bg-zinc-50' : 'border-transparent hover:border-zinc-200 hover:bg-zinc-50'}`}><span className="truncate text-zinc-700">{row.label}</span><span className="shrink-0 font-sans tabular-nums text-zinc-900">{row.amount}</span></button>)}
    </div>
    <div className="flex items-center gap-2 border-t border-zinc-200/80 pt-1 text-sm leading-4 text-zinc-700"><Check size={14} className="shrink-0 text-emerald-700" />No hidden platform fees</div>
  </div>
}

function CreativeQAPreview() {
  const [hasIssue, setHasIssue] = useState(false)
  const rows = [
    { label: 'Headline length', valid: 'OK', issue: 'Avoid ALL CAPS', tone: 'amber' },
    { label: 'Image ratio', valid: '1.91:1', issue: '1.91:1', tone: 'neutral' },
    { label: 'Landing page', valid: 'HTTPS verified', issue: 'Missing HTTPS', tone: 'red' },
    { label: 'Policy check', valid: 'Passed', issue: 'Avoid ALL CAPS', tone: 'red' },
  ] as const

  return <div className="mt-6 flex h-56 flex-col border border-zinc-200/80 p-3">
    <div className="flex items-center gap-2.5 border-b border-zinc-200/80 pb-2">
      <span className="grid size-9 shrink-0 place-items-center border border-zinc-800 bg-[#09090B] text-sm font-semibold tabular-nums text-white"><span className="text-[#7ECBF9]">20</span>%</span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">Summer Sale — 20% Off</span>
      <div role="group" aria-label="Creative QA state" className="flex shrink-0 border border-zinc-200/80 p-0.5">
        <button type="button" aria-pressed={!hasIssue} onClick={() => setHasIssue(false)} className={`px-2 py-1 text-sm font-medium transition-colors ${!hasIssue ? 'bg-[#09090B] text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}>Valid</button>
        <button type="button" aria-pressed={hasIssue} onClick={() => setHasIssue(true)} className={`px-2 py-1 text-sm font-medium transition-colors ${hasIssue ? 'bg-[#09090B] text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}>Issue</button>
      </div>
    </div>
    <p className={`truncate py-1.5 text-sm font-medium ${hasIssue ? 'text-zinc-950' : 'text-zinc-700'}`}>{hasIssue ? 'BUY NOW!!! LIMITED OFFER' : 'A better fit for your everyday routine.'}</p>
    <div className="flex flex-1 flex-col justify-center divide-y divide-zinc-200/80">
      {rows.map((row) => {
        const warning = hasIssue && row.tone !== 'neutral'
        const result = hasIssue ? row.issue : row.valid
        const resultTone = warning ? row.tone === 'amber' ? 'text-amber-700' : 'text-red-700' : row.tone === 'neutral' && hasIssue ? 'text-zinc-700' : 'text-emerald-700'
        return <div key={row.label} className="flex items-center justify-between gap-2 py-1.5 text-sm"><span className="text-zinc-700">{row.label}</span><span className={`inline-flex shrink-0 items-center gap-1.5 font-medium ${resultTone}`}>{warning ? null : <Check size={13} />}{result}</span></div>
      })}
    </div>
  </div>
}

export function HomePage() {
  const [role, setRole] = useState<Role>('advertiser')
  const [format, setFormat] = useState<Format>('Native')
  const [budget, setBudget] = useState(100000)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeRole = roleContent[role]
  const estimatedImpressions = Math.round(budget / 24 * 1000)
  const estimatedClicks = Math.round(estimatedImpressions * 0.0098)
  const currency = (value: number) => `₹${value.toLocaleString('en-IN')}`

  const navLinks = [
    { label: 'Advertisers', href: '/advertisers' },
    { label: 'Publishers', href: '/publishers' },
    { label: 'Ad Formats', href: '/ad-formats' },
    { label: 'How It Works', href: '#how-it-works' },
  ]

  return <div className="min-h-screen bg-[#7ECBF9] text-zinc-950 selection:bg-sky-100 selection:text-zinc-950">
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#7ECBF9]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[15px] font-medium text-zinc-950 lg:flex">{navLinks.map((item) => <Link key={item.label} href={item.href} className="transition-colors hover:text-zinc-950">{item.label}</Link>)}</nav>
        <div className="hidden items-center gap-5 text-zinc-950 sm:flex"><Link href="/login" className="text-[15px] font-medium text-zinc-950 hover:text-zinc-700">Log in</Link><Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-[#09090B] px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-zinc-800">Get Started <ArrowUpRight size={15} /></Link></div>
        <button type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} className="grid size-10 place-items-center rounded-md border border-zinc-200/80 text-zinc-800 sm:hidden">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      <AnimatePresence>{mobileOpen && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-black/10 bg-white sm:hidden" aria-label="Mobile navigation"><div className="mx-auto grid max-w-7xl gap-1 px-4 py-3">{navLinks.map((item) => <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-sky-100">{item.label}</Link>)}<div className="mt-2 flex gap-2 border-t border-zinc-200/80 pt-3"><Link href="/login" className="flex-1 rounded-md border border-zinc-200/80 px-3 py-2.5 text-center text-sm font-medium">Log in</Link><Link href="/signup" className="flex-1 rounded-md bg-[#09090B] px-3 py-2.5 text-center text-sm font-medium text-white">Get Started</Link></div></div></motion.nav>}</AnimatePresence>
    </header>

    <main>
      <section className="border-b border-black/10 bg-[#7ECBF9]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-24 sm:px-6 sm:pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-28">
          <div>
            <div role="tablist" aria-label="Choose your role" className="relative inline-grid grid-cols-2 rounded-md border border-zinc-200/80 bg-white p-1">
              {(['advertiser', 'publisher'] as Role[]).map((item) => <button key={item} role="tab" aria-selected={role === item} onClick={() => setRole(item)} className={`relative z-10 rounded px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${role === item ? 'text-white' : 'text-zinc-600 hover:text-zinc-950'}`}>{role === item && <motion.span layoutId="role-toggle" className="absolute inset-0 -z-10 rounded bg-[#0D0F12]" transition={{ type: 'spring', stiffness: 360, damping: 32 }} />}For {item === 'advertiser' ? 'Advertisers' : 'Publishers'}</button>)}
            </div>
            <AnimatePresence mode="wait"><motion.div key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-slate-900/80">{activeRole.eyebrow}</p>
              <h1 className="mt-3 max-w-xl text-[clamp(2.6rem,5.4vw,4.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-950">{activeRole.headline}</h1>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-900/80 lg:text-xl">{activeRole.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3"><Link href={activeRole.href} className="inline-flex items-center gap-2 rounded-md bg-[#09090B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800">{activeRole.cta}<ArrowRight size={16} /></Link><Link href="/ad-formats" className="inline-flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-slate-900/80 hover:bg-white">View ad formats <ArrowUpRight size={15} /></Link></div>
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-zinc-300/80 pt-4">{activeRole.stats.map((stat) => <div key={stat.label} className="min-w-0"><p className="truncate font-sans text-2xl font-semibold tabular-nums tracking-tight text-zinc-950">{stat.value}</p><p className="mt-1 text-sm leading-5 text-slate-900/80">{stat.label}</p></div>)}</div>
            </motion.div></AnimatePresence>
          </div>
          <Reveal><CampaignWalkthroughWindow /></Reveal>
        </div>
      </section>

      <section aria-labelledby="capabilities-title" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16 lg:px-8 lg:py-20">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-900/80">Clear operations</p><h2 id="capabilities-title" className="mt-2 text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 lg:text-5xl">The details stay in view.</h2></div><p className="max-w-md text-base leading-relaxed text-slate-900/80">Tools for campaign setup, billing, and creative checks, with the same numbers from setup through delivery.</p></Reveal>
        <div className="grid items-stretch divide-y divide-[#E2E8F0] border border-black/10 bg-white md:grid-cols-[1fr_0.92fr_1.08fr] md:divide-x md:divide-y-0">
          <Reveal className="flex h-full min-w-0 flex-col p-7 lg:p-8"><p className="text-sm font-medium text-zinc-500"><span className="font-sans tabular-nums">01</span><span className="mx-2 text-zinc-300">/</span>Precision Geo &amp; Audience</p><GeoMapPreview /><h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950">Choose a delivery area</h3><p className="mt-2 text-base leading-relaxed text-zinc-600">Set country, region, or a custom radius around a location.</p><Link href="/campaigns/new" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-zinc-900 hover:text-emerald-600">Set targeting <ArrowRight size={15} /></Link></Reveal>

          <Reveal delay={0.05} className="flex h-full min-w-0 flex-col p-7 lg:p-8"><p className="text-sm font-medium text-zinc-500"><span className="font-sans tabular-nums">02</span><span className="mx-2 text-zinc-300">/</span>Transparent ₹ Billing</p><BillingLedgerPreview /><h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950">A line for every charge</h3><p className="mt-2 text-base leading-relaxed text-zinc-600">Review spend and activity in the same ledger.</p><Link href="/finance" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-zinc-900 hover:text-emerald-600">View billing <ArrowRight size={15} /></Link></Reveal>

          <Reveal delay={0.1} className="flex h-full min-w-0 flex-col p-7 lg:p-8"><p className="text-sm font-medium text-zinc-500"><span className="font-sans tabular-nums">03</span><span className="mx-2 text-zinc-300">/</span>Instant Creative QA</p><CreativeQAPreview /><h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950">Check before launch</h3><p className="mt-2 text-base leading-relaxed text-zinc-600">Review destination and creative requirements early.</p><Link href="/ad-tester" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-zinc-900 hover:text-emerald-600">Open ad tester <ArrowRight size={15} /></Link></Reveal>
        </div>
      </section>

      <section id="ad-formats" className="scroll-mt-20 border-y border-black/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:px-8 lg:py-20">
          <div><Reveal><p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-900/80">Live ad slot</p><h2 className="mt-2 text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 lg:text-5xl">See each format in context.</h2><p className="mt-3 text-base leading-relaxed text-slate-900/80">Select a placement to preview how it can appear within a publication.</p></Reveal>
            <div role="tablist" aria-label="Ad format preview" className="mt-6 flex flex-wrap gap-2">{(['Native', 'Display', 'Push', 'Video'] as Format[]).map((item) => <button key={item} type="button" role="tab" aria-selected={format === item} onClick={() => setFormat(item)} className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${format === item ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-400'}`}>{item}</button>)}</div>
            <AnimatePresence mode="wait"><motion.div key={`${format}-spec`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="mt-5 border-t border-zinc-200/80 pt-4"><dl className="divide-y divide-zinc-300/80"><div className="flex items-center justify-between gap-4 py-3"><dt className="text-sm text-zinc-700">Placement ratio</dt><dd className="font-sans text-base font-semibold tabular-nums text-zinc-950">{formats[format].ratio}</dd></div><div className="flex items-center justify-between gap-4 py-3"><dt className="text-sm text-zinc-700">Typical CTR</dt><dd className="font-sans text-base font-semibold tabular-nums text-zinc-950">{formats[format].ctr}</dd></div><div className="flex items-start justify-between gap-4 py-3"><dt className="text-sm text-zinc-700">Best for</dt><dd className="max-w-56 text-right text-sm leading-relaxed text-zinc-700">{formats[format].use}</dd></div></dl></motion.div></AnimatePresence>
          </div>
          <div className="min-h-[360px] overflow-hidden rounded-lg border border-black/10 bg-white sm:min-h-[390px]"><AdPreview format={format} /></div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-[#0D0F12] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal className="flex flex-col justify-between gap-5 border-b border-zinc-800 pb-8 sm:flex-row sm:items-end"><div><p className="text-sm font-medium uppercase tracking-[0.14em] text-emerald-500">Auction workflow</p><h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">From placement request to verified event in &lt; 40ms.</h2></div><p className="max-w-sm text-base leading-relaxed text-zinc-300">Each step records what was requested, selected, delivered, and measured.</p></Reveal>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="absolute left-[10%] right-[10%] top-5 hidden h-px bg-zinc-800 lg:block" /><motion.span aria-hidden="true" className="absolute left-[10%] top-[17px] z-10 hidden size-2 rounded-full bg-[#7ECBF9] lg:block" animate={{ left: ['10%', '90%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />{pipeline.map((item, index) => <Reveal key={item.number} delay={index * 0.05} className="relative border border-zinc-800 bg-[#0D0F12] p-4"><div className="flex items-center justify-between"><span className="font-sans text-sm tabular-nums text-emerald-500">{item.number}</span>{index < pipeline.length - 1 && <ArrowRight size={14} className="text-zinc-500 lg:hidden" />}</div><h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{item.detail}</p></Reveal>)}</div>
          <div className="mt-8 grid gap-6 border border-zinc-800 p-4 sm:p-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-sm font-medium uppercase tracking-[0.12em] text-zinc-300">Reach &amp; budget estimator</p><p className="mt-2 font-sans text-2xl font-semibold tabular-nums tracking-tight text-white">{currency(budget)} <span className="text-sm font-normal text-zinc-300">monthly</span></p><label htmlFor="budget-range" className="sr-only">Monthly campaign budget</label><input id="budget-range" type="range" min="10000" max="500000" step="10000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-4 h-1.5 w-full cursor-pointer accent-[#7ECBF9]" /><div className="mt-1 flex justify-between font-sans text-sm tabular-nums text-zinc-400"><span>₹10,000</span><span>₹5,00,000</span></div></div><div className="grid grid-cols-2 gap-3"><div className="border border-zinc-800 p-3"><p className="text-sm text-zinc-300">Estimated impressions</p><p className="mt-1 font-sans text-xl font-semibold tabular-nums text-white">{estimatedImpressions.toLocaleString('en-IN')}</p></div><div className="border border-zinc-800 p-3"><p className="text-sm text-zinc-300">Estimated clicks</p><p className="mt-1 font-sans text-xl font-semibold tabular-nums text-white">{estimatedClicks.toLocaleString('en-IN')}</p></div></div></div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#7ECBF9]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-14 sm:px-6 sm:py-16 md:flex-row md:items-center lg:px-8"><Reveal><p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-900/80">RivinityADS</p><h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-[#09090B] lg:text-5xl">Launch your first campaign in under 3 minutes.</h2></Reveal><div className="flex flex-wrap gap-3"><Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-[#09090B] px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800">Start Advertising <ArrowRight size={15} /></Link><Link href="/publishers" className="inline-flex items-center gap-2 rounded-md border border-black/10 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-white/50">Monetize Traffic <ArrowRight size={15} /></Link></div></div>
      </section>
    </main>

    <footer className="bg-[#7ECBF9]"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="grid gap-8 border-b border-zinc-200/80 pb-7 sm:grid-cols-[1fr_auto]"><div><Brand /><p className="mt-3 max-w-sm text-sm leading-6 text-slate-900/80">Campaign delivery and publisher tools with clear reporting at every step.</p></div><nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-900/80 sm:grid-cols-3"><Link href="/advertisers" className="hover:text-zinc-950">Advertisers</Link><Link href="/publishers" className="hover:text-zinc-950">Publishers</Link><Link href="/ad-formats" className="hover:text-zinc-950">Ad formats</Link><Link href="/login" className="hover:text-zinc-950">Log in</Link><Link href="/signup" className="hover:text-zinc-950">Get started</Link><Link href="/forgot-password" className="hover:text-zinc-950">Account help</Link></nav></div><div className="flex flex-col gap-2 pt-4 text-sm text-slate-900/80 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 RivinityADS</span><span>Advertiser and publisher services</span></div></div></footer>
  </div>
}
