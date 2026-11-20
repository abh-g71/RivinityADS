'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Check, Menu, Play, ShieldCheck, Target, X } from 'lucide-react'

type Role = 'advertiser' | 'publisher'
type Format = 'Native' | 'Display' | 'Push' | 'Video'

const roleContent: Record<Role, {
  eyebrow: string
  headline: string
  description: string
  cta: string
  href: string
  stats: { value: string; label: string }[]
  metricLabel: string
  metric: string
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
    metricLabel: 'Blended ROAS',
    metric: '3.84x',
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
    metricLabel: 'Average eCPM',
    metric: '₹24.80',
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

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.14 }} transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

function Brand() {
  return <Link href="/" aria-label="RivinityADS home" className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-950"><span className="grid size-8 place-items-center rounded-md bg-[#0D0F12] text-sm font-semibold text-white">R</span><span>RivinityADS</span></Link>
}

function ProductWindow({ role }: { role: Role }) {
  const bars = role === 'advertiser' ? [30, 42, 35, 56, 48, 72, 61, 85, 75, 100] : [44, 34, 59, 51, 69, 58, 86, 74, 93, 82]
  const data = roleContent[role]
  return <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white">
    <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3">
      <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500" /><span className="text-xs font-medium text-zinc-700">{role === 'advertiser' ? 'Advertiser' : 'Publisher'} workspace</span></div>
      <span className="font-sans text-[11px] tabular-nums text-zinc-500">LAST 30 DAYS</span>
    </div>
    <div className="grid gap-4 p-4 sm:grid-cols-[1fr_0.8fr] sm:gap-6 sm:p-5">
      <div>
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-zinc-500">{data.metricLabel}</p><p className="mt-1 font-sans text-3xl font-semibold tabular-nums tracking-tight text-zinc-950">{data.metric}</p></div><span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 px-2.5 py-1 text-[11px] text-zinc-600"><span className="size-1.5 rounded-full bg-emerald-500" /> Live</span></div>
        <div className="mt-6 flex h-28 items-end gap-2 border-b border-zinc-200/80 pb-0.5" aria-label="Daily performance bars" role="img">{bars.map((height, index) => <span key={index} className={`flex-1 rounded-t-sm ${index === bars.indexOf(Math.max(...bars)) ? 'bg-emerald-500' : 'bg-zinc-200'}`} style={{ height: `${height}%` }} />)}</div>
        <div className="mt-2 flex justify-between font-sans text-[10px] tabular-nums text-zinc-500"><span>01 Nov</span><span>08 Nov</span><span>15 Nov</span><span>30 Nov</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:content-start">
        <div className="rounded-lg border border-zinc-200/80 p-3"><p className="text-[11px] text-zinc-500">{role === 'advertiser' ? 'Spend' : 'Earnings'}</p><p className="mt-1 font-sans text-lg font-semibold tabular-nums text-zinc-950">₹{role === 'advertiser' ? '4,153' : '28,460'}</p><p className="mt-1 text-[10px] text-emerald-700">+8.2% this period</p></div>
        <div className="rounded-lg border border-zinc-200/80 p-3"><p className="text-[11px] text-zinc-500">{role === 'advertiser' ? 'Conversions' : 'Filled requests'}</p><p className="mt-1 font-sans text-lg font-semibold tabular-nums text-zinc-950">{role === 'advertiser' ? '58' : '98.4%'}</p><p className="mt-1 text-[10px] text-zinc-500">Compared with prior period</p></div>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/80 px-4 py-2.5 text-[11px]"><span className="text-zinc-500">{role === 'advertiser' ? '3 campaigns delivering' : '4 sites connected'}</span><span className="font-sans tabular-nums text-zinc-700">{role === 'advertiser' ? '1,209 clicks' : '246,820 requests'}</span></div>
  </div>
}

function AdPreview({ format }: { format: Format }) {
  const copy = formats[format]
  return <AnimatePresence mode="wait">
    <motion.div key={format} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="grid h-full grid-rows-[auto_1fr]">
      <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-zinc-300" /><span className="size-2 rounded-full bg-zinc-300" /><span className="size-2 rounded-full bg-zinc-300" /></div><span className="font-sans text-[11px] text-zinc-500">sample-publication.com / stories</span><span className="hidden text-[11px] text-zinc-500 sm:block">•••</span></div>
      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_190px] sm:p-6">
        <article className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">The Daily Ledger <span className="mx-1 text-zinc-300">/</span> Business</p><h3 className="mt-3 max-w-lg text-xl font-semibold leading-tight tracking-[-0.03em] text-zinc-950 sm:text-2xl">What a changing market means for independent businesses</h3><p className="mt-2 text-xs text-zinc-500">By Morgan Lee <span className="px-1">·</span> 6 min read</p><div className="mt-4 h-20 rounded-md border border-zinc-200/80 bg-[#F8F9FA] sm:h-28" /><div className="mt-3 space-y-2"><div className="h-2 w-full rounded-full bg-zinc-100" /><div className="h-2 w-[88%] rounded-full bg-zinc-100" /><div className="h-2 w-[72%] rounded-full bg-zinc-100" /></div>
          {format === 'Native' && <div className="mt-4 rounded-lg border border-zinc-200/80 p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Sponsored</span><ArrowUpRight size={14} className="text-zinc-500" /></div><div className="mt-2 grid grid-cols-[58px_1fr] gap-3"><div className="h-12 rounded-sm bg-zinc-100" /><div><p className="text-xs font-semibold text-zinc-900">A practical guide to smarter energy use</p><p className="mt-1 text-[10px] text-zinc-500">See how small changes add up.</p></div></div></div>}
        </article>
        <aside className="space-y-3">
          {format === 'Display' && <div className="flex aspect-[6/5] flex-col justify-between border border-zinc-200/80 bg-[#F8F9FA] p-3"><span className="text-[10px] uppercase tracking-wide text-zinc-500">Ad</span><div><p className="text-sm font-semibold leading-tight text-zinc-900">Tools for work that moves</p><p className="mt-1 text-[10px] text-zinc-600">Explore the collection.</p></div><span className="inline-flex w-fit items-center gap-1 text-[10px] font-medium text-emerald-700">Learn more <ArrowRight size={12} /></span></div>}
          {format === 'Push' && <div className="rounded-lg border border-zinc-200/80 bg-white p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-zinc-700">Daily Ledger</span><span className="text-[10px] text-zinc-500">now</span></div><p className="mt-2 text-xs font-semibold text-zinc-900">Your morning market brief</p><p className="mt-1 text-[10px] leading-4 text-zinc-500">Five updates to start your day.</p><span className="mt-3 block text-[10px] text-zinc-500">Sponsored notification</span></div>}
          {format === 'Video' && <div className="relative flex aspect-video items-center justify-center border border-zinc-200/80 bg-[#F8F9FA]"><span className="grid size-9 place-items-center rounded-full border border-zinc-300 bg-white"><Play size={14} fill="currentColor" /></span><span className="absolute bottom-2 left-2 text-[10px] text-zinc-600">Sponsored video</span><span className="absolute bottom-2 right-2 font-sans text-[10px] tabular-nums text-zinc-600">0:15</span></div>}
          <div className="hidden rounded-md border border-zinc-200/80 p-3 sm:block"><p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Placement details</p><p className="mt-2 text-xs font-medium text-zinc-800">{copy.ratio}</p><p className="mt-1 text-[10px] leading-4 text-zinc-500">{copy.use}</p></div>
        </aside>
      </div>
    </motion.div>
  </AnimatePresence>
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

  return <div className="min-h-screen bg-white text-zinc-950 selection:bg-emerald-100 selection:text-zinc-950">
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[13px] font-medium text-zinc-600 lg:flex">{navLinks.map((item) => <Link key={item.label} href={item.href} className="transition-colors hover:text-zinc-950">{item.label}</Link>)}</nav>
        <div className="hidden items-center gap-5 sm:flex"><Link href="/login" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">Log in</Link><Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-[#0D0F12] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700">Get Started <ArrowUpRight size={15} /></Link></div>
        <button type="button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} className="grid size-10 place-items-center rounded-md border border-zinc-200/80 text-zinc-800 sm:hidden">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      <AnimatePresence>{mobileOpen && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-zinc-200/80 bg-white sm:hidden" aria-label="Mobile navigation"><div className="mx-auto grid max-w-7xl gap-1 px-4 py-3">{navLinks.map((item) => <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-[#F8F9FA]">{item.label}</Link>)}<div className="mt-2 flex gap-2 border-t border-zinc-200/80 pt-3"><Link href="/login" className="flex-1 rounded-md border border-zinc-200/80 px-3 py-2.5 text-center text-sm font-medium">Log in</Link><Link href="/signup" className="flex-1 rounded-md bg-[#0D0F12] px-3 py-2.5 text-center text-sm font-medium text-white">Get Started</Link></div></div></motion.nav>}</AnimatePresence>
    </header>

    <main>
      <section className="border-b border-zinc-200/80 bg-[#F8F9FA]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-20">
          <div>
            <div role="tablist" aria-label="Choose your role" className="relative inline-grid grid-cols-2 rounded-md border border-zinc-200/80 bg-white p-1">
              {(['advertiser', 'publisher'] as Role[]).map((item) => <button key={item} role="tab" aria-selected={role === item} onClick={() => setRole(item)} className={`relative z-10 rounded px-3 py-2 text-xs font-medium transition-colors sm:px-4 ${role === item ? 'text-white' : 'text-zinc-600 hover:text-zinc-950'}`}>{role === item && <motion.span layoutId="role-toggle" className="absolute inset-0 -z-10 rounded bg-[#0D0F12]" transition={{ type: 'spring', stiffness: 360, damping: 32 }} />}For {item === 'advertiser' ? 'Advertisers' : 'Publishers'}</button>)}
            </div>
            <AnimatePresence mode="wait"><motion.div key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{activeRole.eyebrow}</p>
              <h1 className="mt-3 max-w-xl text-[clamp(2.6rem,5.4vw,4.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-950">{activeRole.headline}</h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-zinc-600">{activeRole.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3"><Link href={activeRole.href} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">{activeRole.cta}<ArrowRight size={16} /></Link><Link href="/ad-formats" className="inline-flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-white">View ad formats <ArrowUpRight size={15} /></Link></div>
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-zinc-200/80 pt-4">{activeRole.stats.map((stat) => <div key={stat.label} className="min-w-0"><p className="truncate font-sans text-lg font-semibold tabular-nums tracking-tight text-zinc-950 sm:text-xl">{stat.value}</p><p className="mt-1 text-[10px] leading-4 text-zinc-500 sm:text-xs">{stat.label}</p></div>)}</div>
            </motion.div></AnimatePresence>
          </div>
          <Reveal><AnimatePresence mode="wait"><motion.div key={role} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}><ProductWindow role={role} /></motion.div></AnimatePresence></Reveal>
        </div>
      </section>

      <section aria-labelledby="capabilities-title" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
        <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Clear operations</p><h2 id="capabilities-title" className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em] text-zinc-950 sm:text-3xl">The details stay in view.</h2></div><p className="max-w-md text-sm leading-6 text-zinc-600">Tools for campaign setup, billing, and creative checks, with the same numbers from setup through delivery.</p></Reveal>
        <div className="grid divide-y divide-zinc-200 border-y border-zinc-200 bg-white md:grid-cols-[1fr_0.92fr_1.08fr] md:divide-x md:divide-y-0">
          <Reveal className="min-w-0 p-5 sm:p-6"><p className="font-sans text-xs font-medium tabular-nums text-zinc-500">01 <span className="mx-1 text-zinc-300">/</span> Precision Geo &amp; Audience</p><div className="relative mt-5 flex h-28 items-center justify-center overflow-hidden border border-zinc-200/80 bg-[#F8F9FA]"><div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(to right, #E4E4E7 1px, transparent 1px), linear-gradient(to bottom, #E4E4E7 1px, transparent 1px)', backgroundSize: '24px 24px' }} /><span className="absolute h-20 w-20 rounded-full border border-zinc-400" /><span className="absolute h-12 w-12 rounded-full border border-zinc-400" /><span className="absolute size-2 rounded-full bg-emerald-500" /><Target className="relative z-10 size-5 text-zinc-500" strokeWidth={1.5} /></div><h3 className="mt-4 text-sm font-semibold text-zinc-900">Choose a delivery area</h3><p className="mt-1.5 text-xs leading-5 text-zinc-600">Set country, region, or a custom radius around a location.</p><Link href="/campaigns/new" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-emerald-700">Set targeting <ArrowRight size={13} /></Link></Reveal>
          <Reveal delay={0.05} className="min-w-0 p-5 sm:p-6"><p className="font-sans text-xs font-medium tabular-nums text-zinc-500">02 <span className="mx-1 text-zinc-300">/</span> Transparent ₹ Billing</p><div className="mt-5 border border-zinc-200/80"><div className="grid grid-cols-3 border-b border-zinc-200/80 bg-[#F8F9FA] px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500"><span>Spend</span><span>Clicks</span><span>Platform fee</span></div><div className="grid grid-cols-3 items-center px-3 py-3 font-sans text-xs tabular-nums text-zinc-800"><span>₹4,153.00</span><span>1,209</span><span>₹0.00</span></div><div className="flex items-center gap-2 border-t border-zinc-200/80 px-3 py-2 text-[11px] text-zinc-600"><Check size={13} className="text-emerald-700" /> No hidden platform fees</div></div><h3 className="mt-4 text-sm font-semibold text-zinc-900">A line for every charge</h3><p className="mt-1.5 text-xs leading-5 text-zinc-600">Review spend and activity in the same ledger.</p><Link href="/finance" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-emerald-700">View billing <ArrowRight size={13} /></Link></Reveal>
          <Reveal delay={0.1} className="min-w-0 p-5 sm:p-6"><p className="font-sans text-xs font-medium tabular-nums text-zinc-500">03 <span className="mx-1 text-zinc-300">/</span> Instant Creative QA</p><div className="mt-5 space-y-2 border border-zinc-200/80 p-3"><div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 pb-2 text-xs"><span className="text-zinc-700">Headline</span><span className="inline-flex items-center gap-1.5 text-zinc-600"><Check size={13} className="text-emerald-700" /> OK</span></div><div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 pb-2 text-xs"><span className="text-zinc-700">Ratio</span><span className="font-sans tabular-nums text-zinc-800">1.91:1</span></div><div className="flex items-center justify-between gap-3 text-xs"><span className="text-zinc-700">Landing page</span><span className="inline-flex items-center gap-1.5 text-zinc-600"><ShieldCheck size={13} className="text-emerald-700" /> HTTPS verified</span></div></div><h3 className="mt-4 text-sm font-semibold text-zinc-900">Check before launch</h3><p className="mt-1.5 text-xs leading-5 text-zinc-600">Review destination and creative requirements early.</p><Link href="/ad-tester" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-emerald-700">Open ad tester <ArrowRight size={13} /></Link></Reveal>
        </div>
      </section>

      <section id="ad-formats" className="border-y border-zinc-200/80 bg-[#F8F9FA]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:px-8 lg:py-20">
          <div><Reveal><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Live ad slot</p><h2 className="mt-2 text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-950">See each format in context.</h2><p className="mt-3 text-sm leading-6 text-zinc-600">Select a placement to preview how it can appear within a publication.</p></Reveal>
            <div role="tablist" aria-label="Ad format preview" className="mt-6 flex flex-wrap gap-2">{(['Native', 'Display', 'Push', 'Video'] as Format[]).map((item) => <button key={item} type="button" role="tab" aria-selected={format === item} onClick={() => setFormat(item)} className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${format === item ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-400'}`}>{item}</button>)}</div>
            <AnimatePresence mode="wait"><motion.div key={`${format}-spec`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="mt-5 border-t border-zinc-200/80 pt-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-[11px] text-zinc-500">Placement spec</p><p className="mt-1 font-sans text-sm font-semibold tabular-nums text-zinc-900">{formats[format].ratio}</p></div><div><p className="text-[11px] text-zinc-500">Typical CTR</p><p className="mt-1 font-sans text-sm font-semibold tabular-nums text-zinc-900">{formats[format].ctr}</p></div></div><p className="mt-4 text-xs leading-5 text-zinc-600">{formats[format].use}</p></motion.div></AnimatePresence>
          </div>
          <div className="min-h-[360px] overflow-hidden rounded-lg border border-zinc-200/80 bg-white sm:min-h-[390px]"><AdPreview format={format} /></div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#0D0F12] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal className="flex flex-col justify-between gap-5 border-b border-zinc-800 pb-8 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-500">Auction workflow</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-4xl">From placement request to verified event in &lt; 40ms.</h2></div><p className="max-w-sm text-sm leading-6 text-zinc-400">Each step records what was requested, selected, delivered, and measured.</p></Reveal>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="absolute left-[10%] right-[10%] top-5 hidden h-px bg-zinc-800 lg:block" /><motion.span aria-hidden="true" className="absolute left-[10%] top-[17px] z-10 hidden size-2 rounded-full bg-emerald-500 lg:block" animate={{ left: ['10%', '90%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />{pipeline.map((item, index) => <Reveal key={item.number} delay={index * 0.05} className="relative border border-zinc-800 bg-[#0D0F12] p-4"><div className="flex items-center justify-between"><span className="font-sans text-xs tabular-nums text-emerald-500">{item.number}</span>{index < pipeline.length - 1 && <ArrowRight size={14} className="text-zinc-500 lg:hidden" />}</div><h3 className="mt-6 text-sm font-semibold text-white">{item.title}</h3><p className="mt-1.5 text-xs leading-5 text-zinc-400">{item.detail}</p></Reveal>)}</div>
          <div className="mt-8 grid gap-6 border border-zinc-800 p-4 sm:p-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">Reach &amp; budget estimator</p><p className="mt-2 font-sans text-2xl font-semibold tabular-nums tracking-tight text-white">{currency(budget)} <span className="text-sm font-normal text-zinc-400">monthly</span></p><label htmlFor="budget-range" className="sr-only">Monthly campaign budget</label><input id="budget-range" type="range" min="10000" max="500000" step="10000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-4 h-1.5 w-full cursor-pointer accent-[#10B981]" /><div className="mt-1 flex justify-between font-sans text-[10px] tabular-nums text-zinc-500"><span>₹10,000</span><span>₹5,00,000</span></div></div><div className="grid grid-cols-2 gap-3"><div className="border border-zinc-800 p-3"><p className="text-[11px] text-zinc-400">Estimated impressions</p><p className="mt-1 font-sans text-xl font-semibold tabular-nums text-white">{estimatedImpressions.toLocaleString('en-IN')}</p></div><div className="border border-zinc-800 p-3"><p className="text-[11px] text-zinc-400">Estimated clicks</p><p className="mt-1 font-sans text-xl font-semibold tabular-nums text-white">{estimatedClicks.toLocaleString('en-IN')}</p></div></div></div>
        </div>
      </section>

      <section className="border-b border-zinc-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-14 sm:px-6 sm:py-16 md:flex-row md:items-center lg:px-8"><Reveal><p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">RivinityADS</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-950 sm:text-4xl">Launch your first campaign in under 3 minutes.</h2></Reveal><div className="flex flex-wrap gap-3"><Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Start Advertising <ArrowRight size={15} /></Link><Link href="/publishers" className="inline-flex items-center gap-2 rounded-md border border-zinc-200/80 px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-[#F8F9FA]">Monetize Traffic <ArrowRight size={15} /></Link></div></div>
      </section>
    </main>

    <footer className="bg-white"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="grid gap-8 border-b border-zinc-200/80 pb-7 sm:grid-cols-[1fr_auto]"><div><Brand /><p className="mt-3 max-w-sm text-xs leading-5 text-zinc-500">Campaign delivery and publisher tools with clear reporting at every step.</p></div><nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-zinc-600 sm:grid-cols-3"><Link href="/advertisers" className="hover:text-zinc-950">Advertisers</Link><Link href="/publishers" className="hover:text-zinc-950">Publishers</Link><Link href="/ad-formats" className="hover:text-zinc-950">Ad formats</Link><Link href="/login" className="hover:text-zinc-950">Log in</Link><Link href="/signup" className="hover:text-zinc-950">Get started</Link><Link href="/forgot-password" className="hover:text-zinc-950">Account help</Link></nav></div><div className="flex flex-col gap-2 pt-4 text-[11px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 RivinityADS</span><span>Advertiser and publisher services</span></div></div></footer>
  </div>
}
