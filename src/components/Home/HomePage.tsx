'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Banknote,
  BarChart3,
  Code,
  Eye,
  Globe,
  LayoutGrid,
  MapPin,
  Megaphone,
  Menu,
  Moon,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Wallet,
  X,
} from 'lucide-react'

const themes = {
  dark: {
    '--bg': '#101C27',
    '--fg': '#F3F2ED',
    '--muted': '#AEBBC0',
    '--line': '#354650',
    '--card': '#162631',
    '--surface-muted': '#20343D',
    '--accent': '#83B8B5',
    '--accent-fg': '#102329',
    '--navbg': '#101C27',
    '--soft': '#1B303A',
  },
  light: {
    '--bg': '#F4F2EB',
    '--fg': '#172631',
    '--muted': '#586A70',
    '--line': '#D2DAD7',
    '--card': '#FFFEFA',
    '--surface-muted': '#E7ECE8',
    '--accent': '#2E7180',
    '--accent-fg': '#FFFFFF',
    '--navbg': '#F4F2EB',
    '--soft': '#EDF0EB',
  },
}

const muted = 'text-[color:var(--muted)]'
const accent = 'text-[color:var(--accent)]'
const line = 'border-[color:var(--line)]'
const card = 'bg-[color:var(--card)]'
const primaryBtn = 'inline-flex min-h-12 items-center justify-center gap-2 bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--accent-fg)] transition-colors duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]'
const secondaryBtn = `inline-flex min-h-12 items-center justify-center gap-2 border ${line} px-5 py-3 text-sm font-semibold transition-colors duration-200 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`

const navLinks = [
  { label: 'Advertisers', href: '/advertisers' },
  { label: 'Publishers', href: '/publishers' },
  { label: 'Ad formats', href: '/ad-formats' },
  { label: 'FAQ', href: '#faq' },
]

type Feature = { icon: LucideIcon; title: string; text: string }
const cards: Record<'advertiser' | 'publisher', Feature[]> = {
  advertiser: [
    { icon: Megaphone, title: 'Create a campaign', text: 'Choose a goal and move through a short guided setup.' },
    { icon: MapPin, title: 'Choose where it shows', text: 'Set cities, regions, countries, PIN codes or a radius.' },
    { icon: Eye, title: 'Preview every size', text: 'Check Feed, Story and Banner creative as you build.' },
    { icon: Wallet, title: 'Set a budget', text: 'Choose a daily budget and review sample estimates.' },
    { icon: LayoutGrid, title: 'Pick an ad format', text: 'Explore Banner, Native, Popunder, Push and Social Bar.' },
    { icon: BarChart3, title: 'Review results', text: 'Campaign reporting is shown with sample data.' },
  ],
  publisher: [
    { icon: Globe, title: 'Add your website', text: 'Register a site to prepare its advertising placements.' },
    { icon: ShieldCheck, title: 'Verify ownership', text: 'Confirm that the website belongs to you.' },
    { icon: LayoutGrid, title: 'Create a placement', text: 'Choose a format and where it belongs on your site.' },
    { icon: Code, title: 'Add the code', text: 'Copy the placement snippet for your website.' },
    { icon: BarChart3, title: 'Review activity', text: 'See placement impressions and clicks in the console.' },
    { icon: Banknote, title: 'Manage payout details', text: 'Payout setup is shown in the publisher console.' },
  ],
}

const formats = [
  { name: 'Banner', mark: '▰', text: 'A display placement shown within page content.' },
  { name: 'Native', mark: '▤', text: 'An ad styled to fit alongside surrounding content.' },
  { name: 'Popunder', mark: '↗', text: 'A page that opens behind the active browser window.' },
  { name: 'Push Notification', mark: '▣', text: 'A brief message delivered as a browser notification.' },
  { name: 'Social Bar', mark: '━', text: 'An interactive, floating ad placement on a page.' },
]

const faqs = [
  { q: 'What is RivinityADS?', a: 'A platform where advertisers create campaigns and publishers prepare website advertising placements.' },
  { q: 'How do I create my first campaign?', a: 'Choose a campaign goal, set its audience and budget, then prepare the ad. You can use the guided manual flow or start with the AI assistant.' },
  { q: 'How do I get started as a publisher?', a: 'Add your website, verify ownership, create a placement and add its code to your site.' },
  { q: 'Which ad formats are available?', a: 'The product includes Banner, Native, Popunder, Push and Social Bar formats.' },
  { q: 'Are the numbers on this page live?', a: 'No. This homepage uses sample data. Live ad delivery and payments are not active.' },
]

function Nav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--navbg)] text-[color:var(--fg)]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 text-base font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">
            <span className="flex h-8 w-8 items-center justify-center bg-[color:var(--accent)] text-sm font-bold text-[color:var(--accent-fg)]">R</span>
            <span>Rivinity<span className="ml-0.5 font-medium tracking-[0.08em]">ADS</span></span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {navLinks.map((item) => <Link key={item.label} href={item.href} className={`text-sm font-medium ${muted} transition-colors duration-200 hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}>{item.label}</Link>)}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={onToggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} className={`flex h-10 w-10 items-center justify-center ${muted} transition-colors hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}>
            {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>
          <Link href="/login" className="hidden min-h-10 items-center px-2 text-sm font-medium transition-colors hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] sm:inline-flex">Sign in</Link>
          <Link href="/signup" className="hidden min-h-10 items-center justify-center bg-[color:var(--accent)] px-4 text-sm font-semibold text-[color:var(--accent-fg)] transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] sm:inline-flex">Get started</Link>
          <button type="button" className="flex h-10 w-10 items-center justify-center md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && <div className="border-t border-[color:var(--line)] px-4 pb-5 md:hidden"><nav className="mx-auto flex max-w-[1440px] flex-col py-2" aria-label="Mobile">
        {[...navLinks, { label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }].map((item) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="border-b border-[color:var(--line)] px-1 py-3 text-sm font-medium transition-colors hover:text-[color:var(--accent)] last:border-b-0">{item.label}</Link>)}
      </nav></div>}
    </header>
  )
}

function AdPreview({ size, onSizeChange }: { size: 'Feed' | 'Story' | 'Banner'; onSizeChange: (size: 'Feed' | 'Story' | 'Banner') => void }) {
  const shape = { Feed: 'aspect-[1.45/1] w-full max-w-[18rem]', Story: 'aspect-[9/15] w-32', Banner: 'aspect-[5/1] w-full max-w-[22rem]' }[size]
  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${accent}`}>Publisher placement</p><h3 className="mt-1 text-sm font-semibold">Ad preview</h3></div>
        <div className={`flex border ${line}`} role="tablist" aria-label="Ad preview size">
          {(['Feed', 'Story', 'Banner'] as const).map((format) => <button key={format} type="button" role="tab" aria-selected={size === format} onClick={() => onSizeChange(format)} className={`px-2.5 py-2 text-[11px] font-medium transition-colors duration-200 ${size === format ? 'bg-[color:var(--accent)] text-[color:var(--accent-fg)]' : `${muted} hover:bg-[color:var(--surface-muted)]`}`}>{format}</button>)}
        </div>
      </div>
      <div className="flex min-h-[16rem] items-center justify-center bg-[color:var(--surface-muted)] p-5 sm:min-h-[18rem]">
        <div key={size} className={`${shape} flex items-center justify-center overflow-hidden border border-[color:var(--line)] bg-[color:var(--card)] p-4 text-left animate-preview-in ${size === 'Story' ? 'flex-col text-center' : 'flex-row gap-3'}`}>
          <div className={`flex shrink-0 items-center justify-center bg-[color:var(--soft)] text-sm font-semibold ${accent} ${size === 'Story' ? 'mb-3 h-10 w-10' : 'h-12 w-12'}`}>N&amp;C</div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide">North &amp; Co.</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-[color:var(--fg)]">New season, made for everyday</p>
            {size !== 'Banner' && <span className="mt-3 inline-flex bg-[color:var(--accent)] px-2.5 py-1.5 text-[10px] font-semibold text-[color:var(--accent-fg)]">Shop collection</span>}
          </div>
        </div>
      </div>
      <div className={`mt-3 flex items-center justify-between border-t ${line} pt-3 text-[11px] ${muted}`}><span>Illustrative creative</span><span>Sample data</span></div>
    </div>
  )
}

function ProductShowcase() {
  const [size, setSize] = useState<'Feed' | 'Story' | 'Banner'>('Feed')
  return (
    <div className={`grid overflow-hidden border ${line} ${card} xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.75fr)]`}>
      <div className="min-w-0 p-4 sm:p-6 lg:p-8">
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${line} pb-4 sm:pb-5`}>
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-[color:var(--accent)] text-sm font-bold text-[color:var(--accent-fg)]">R</span><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em]">RivinityADS / Campaigns</p><h2 className="mt-0.5 text-base font-semibold">Spring collection</h2></div></div>
          <span className={`border ${line} px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${muted}`}>Sample workspace</span>
        </div>
        <div className={`grid grid-cols-2 gap-4 border-b ${line} py-5 sm:grid-cols-4 sm:gap-6 sm:py-6`}>
          {[
            { label: 'Spend', value: 'INR 3,240', note: 'of INR 5,000' },
            { label: 'Impressions', value: '48,260', note: 'sample total' },
            { label: 'Clicks', value: '1,284', note: 'sample total' },
            { label: 'Click-through rate', value: '2.66%', note: 'sample average' },
          ].map((metric) => <div key={metric.label} className="min-w-0"><p className={`text-[11px] font-medium ${muted}`}>{metric.label}</p><p className="mt-1 truncate text-lg font-semibold tracking-tight tabular-nums sm:text-xl">{metric.value}</p><p className={`mt-1 text-[10px] ${muted}`}>{metric.note}</p></div>)}
        </div>
        <div className="grid gap-6 border-b border-[color:var(--line)] py-5 sm:grid-cols-[minmax(0,1.65fr)_minmax(12rem,0.75fr)] sm:gap-8 sm:py-6">
          <section aria-label="Sample campaign performance">
            <div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-semibold">Campaign performance</h3><p className={`mt-1 text-xs ${muted}`}>Daily clicks / last 7 days</p></div><span className={`text-[10px] font-medium uppercase tracking-[0.1em] ${muted}`}>Sample</span></div>
            <div className="mt-4 flex h-32 gap-3">
              <div className={`flex flex-col justify-between pb-5 text-[10px] ${muted}`} aria-hidden="true"><span>400</span><span>200</span><span>0</span></div>
              <div className="relative min-w-0 flex-1"><div className="absolute inset-0 flex flex-col justify-between pb-5" aria-hidden="true"><span className={`border-t ${line}`} /><span className={`border-t ${line}`} /><span className={`border-t ${line}`} /></div>
                <svg viewBox="0 0 420 100" preserveAspectRatio="none" className="relative h-[calc(100%-1.25rem)] w-full" aria-hidden="true"><path className="chart-stroke" d="M4 82C38 78 51 60 80 66S122 55 150 59 188 36 216 45 251 48 279 36 318 32 347 24 387 29 416 9" fill="none" stroke="var(--accent)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /><circle cx="416" cy="9" r="4" fill="var(--accent)" /></svg>
                <div className={`absolute inset-x-0 bottom-0 flex justify-between text-[10px] ${muted}`} aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span></div>
              </div>
            </div>
          </section>
          <section className={`border-t ${line} pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0`} aria-label="Sample audience and budget settings">
            <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Audience &amp; budget</h3><SlidersHorizontal className={`h-4 w-4 ${muted}`} aria-hidden="true" /></div>
            <dl className={`mt-4 space-y-3 text-xs ${muted}`}><div className="flex items-start justify-between gap-3"><dt>Location</dt><dd className="text-right font-medium text-[color:var(--fg)]">Pune, India / 10 km</dd></div><div className="flex items-start justify-between gap-3"><dt>Audience</dt><dd className="text-right font-medium text-[color:var(--fg)]">Ages 21-45 / Shopping</dd></div><div className="flex items-start justify-between gap-3"><dt>Daily budget</dt><dd className="text-right font-medium text-[color:var(--fg)]">INR 500</dd></div></dl>
            <div className={`mt-4 h-1 overflow-hidden ${line}`}><div className="h-full w-[64.8%] bg-[color:var(--accent)]" /></div><p className={`mt-1 text-right text-[9px] ${muted}`}>Illustrative budget pacing</p>
          </section>
        </div>
        <section className="pt-5 sm:pt-6" aria-label="Sample campaign list"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Campaigns</h3><span className={`text-[10px] ${muted}`}>Workspace preview</span></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[320px] text-left text-xs"><thead className={muted}><tr><th className="py-2 font-medium">Campaign</th><th className="py-2 font-medium">Status</th><th className="py-2 text-right font-medium">Spend</th></tr></thead><tbody className={`divide-y ${line}`}><tr><td className="py-3 font-medium">Spring collection</td><td className="py-3"><span className="mr-2 inline-block h-2 w-2 bg-[color:var(--accent)]" />Active</td><td className="py-3 text-right tabular-nums">INR 3,240</td></tr><tr><td className="py-3 font-medium">Weekend offers</td><td className="py-3"><span className="mr-2 inline-block h-2 w-2 bg-[color:var(--muted)]" />Paused</td><td className="py-3 text-right tabular-nums">INR 1,860</td></tr></tbody></table></div>
        </section>
      </div>
      <aside className={`border-t ${line} p-4 sm:p-6 lg:p-8 xl:border-l xl:border-t-0`}><AdPreview size={size} onSizeChange={setSize} /></aside>
    </div>
  )
}

export function HomePage() {
  const [dark, setDark] = useState(true)
  const [tab, setTab] = useState<'advertiser' | 'publisher'>('advertiser')
  const [page, setPage] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try { setDark(localStorage.getItem('landing-theme') !== 'light') } catch {}
    })
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }), { threshold: 0.12 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    try { localStorage.setItem('landing-theme', next ? 'dark' : 'light') } catch {}
  }

  const vars = (dark ? themes.dark : themes.light) as unknown as CSSProperties
  const visible = cards[tab].slice(page * 3, page * 3 + 3)

  return (
    <div style={vars} className="min-h-screen overflow-x-clip bg-[color:var(--bg)] text-[color:var(--fg)] transition-colors duration-200">
      <style>{`
        @keyframes home-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes preview-in { from { opacity: .5; transform: translateY(5px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes chart-draw { to { stroke-dashoffset: 0; } }
        .hero-rise { animation: home-rise .7s cubic-bezier(.2,.7,.2,1) both; }
        .animate-preview-in { animation: preview-in .24s ease-out both; }
        .chart-stroke { stroke-dasharray: 560; stroke-dashoffset: 560; animation: chart-draw 1.35s .25s ease-out forwards; }
        .reveal { opacity: 0; transform: translateY(18px); transition: opacity .55s ease, transform .55s ease; }
        .reveal.is-visible { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } .reveal { opacity: 1; transform: none; } }
      `}</style>
      <Nav dark={dark} onToggle={toggleTheme} />
      <main>
        <section className={`relative border-b ${line}`}>
          <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-10 lg:pb-12 lg:pt-16">
            <div className="grid items-end gap-8 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-7 hero-rise">
                <p className={`mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] ${accent}`}>One ecosystem / two connected sides</p>
                <h1 className="max-w-4xl text-[clamp(3.25rem,8vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.065em]">Campaigns meet<br /><span className={accent}>their placement.</span></h1>
              </div>
              <div className="max-w-xl md:col-span-5 md:justify-self-end hero-rise" style={{ animationDelay: '100ms' }}>
                <p className={`text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>RivinityADS connects advertisers building campaigns with publishers preparing the places they can appear.</p>
                <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
                  <Link href="/signup" className={primaryBtn}>Create a campaign <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                  <Link href="/publishers" className={secondaryBtn}>For publishers</Link>
                </div>
                <Link href="/campaigns/new/ai" className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${muted} transition-colors hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}><span className={`inline-flex h-6 w-6 items-center justify-center border ${line}`}><ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" /></span>Start with the AI campaign assistant</Link>
              </div>
            </div>
            <div className="mt-10 sm:mt-12 lg:mt-14" data-reveal>
              <div className={`mb-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${muted}`}><span>Campaign workspace / placement preview</span><span>Prototype interface / sample data</span></div>
              <ProductShowcase />
              <p className={`mt-3 text-right text-[10px] ${muted}`}>Illustrative interface and sample metrics. No live ad delivery or payments.</p>
            </div>
          </div>
        </section>

        <section className={`border-b ${line}`}>
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-14 lg:px-10 lg:py-24">
            <div className="lg:col-span-5" data-reveal>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${accent}`}>A shared ecosystem</p>
              <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">Two sides of advertising, connected by the placement.</h2>
              <p className={`mt-5 max-w-md leading-7 ${muted}`}>A campaign needs a place to appear. A placement needs an ad to show. RivinityADS gives each side a dedicated workflow in one platform.</p>
              <Link href="/advertisers" className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${accent} hover:underline`}>Explore the platform <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="lg:col-span-7" data-reveal>
              <div className={`grid border-y ${line} sm:grid-cols-[1fr_auto_1fr]`}>
                <div className="py-6 sm:py-8"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center bg-[color:var(--soft)] ${accent}`}><Megaphone className="h-5 w-5" aria-hidden="true" /></span><span className="text-xs font-semibold uppercase tracking-[0.14em]">Advertiser</span></div><p className="mt-5 text-2xl font-semibold tracking-tight">Create the campaign.</p><p className={`mt-2 max-w-xs text-sm leading-6 ${muted}`}>Choose an objective, audience, budget and creative.</p></div>
                <div className={`flex items-center border-y ${line} py-4 sm:border-x sm:border-y-0 sm:px-6 sm:py-0`}><div className="flex items-center gap-3 sm:flex-col"><span className="h-px w-8 bg-[color:var(--accent)] sm:h-8 sm:w-px" /><span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${accent}`}>Connect</span><span className="h-px w-8 bg-[color:var(--accent)] sm:h-8 sm:w-px" /></div></div>
                <div className="py-6 sm:py-8 sm:pl-8"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center bg-[color:var(--soft)] ${accent}`}><Globe className="h-5 w-5" aria-hidden="true" /></span><span className="text-xs font-semibold uppercase tracking-[0.14em]">Publisher</span></div><p className="mt-5 text-2xl font-semibold tracking-tight">Prepare the placement.</p><p className={`mt-2 max-w-xs text-sm leading-6 ${muted}`}>Register a website, verify it and set up an ad position.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[color:var(--line)] bg-[color:var(--soft)]">
          <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4" data-reveal>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${accent}`}>Choose your workflow</p>
                <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">Built for the work you do.</h2>
                <p className={`mt-5 max-w-sm leading-7 ${muted}`}>Campaign creation and website placements have different jobs. Start with the path that fits.</p>
                <div className={`mt-8 inline-flex border ${line} p-1`} role="tablist" aria-label="Choose your side">
                  {([['advertiser', "I'm an advertiser"], ['publisher', "I'm a publisher"]] as const).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => { setTab(key); setPage(0) }} className={`px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${tab === key ? 'bg-[color:var(--accent)] text-[color:var(--accent-fg)]' : `${muted} hover:text-[color:var(--fg)]`}`}>{label}</button>)}
                </div>
              </div>
              <div className="lg:col-span-8" data-reveal>
                <div className="flex items-center justify-between border-b border-[color:var(--line)] pb-4"><p className={`text-xs font-semibold uppercase tracking-[0.14em] ${muted}`}>{tab === 'advertiser' ? 'Campaign workflow' : 'Publisher workflow'}</p><div className="flex items-center gap-3"><span className={`text-xs tabular-nums ${muted}`}>{page + 1} / 2</span><button type="button" aria-label="Previous" disabled={page === 0} onClick={() => setPage(0)} className={`flex h-9 w-9 items-center justify-center border ${line} transition-colors hover:text-[color:var(--accent)] disabled:opacity-35`}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button><button type="button" aria-label="Next" disabled={page === 1} onClick={() => setPage(1)} className={`flex h-9 w-9 items-center justify-center border ${line} transition-colors hover:text-[color:var(--accent)] disabled:opacity-35`}><ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div></div>
                <div className="grid gap-x-8 md:grid-cols-2">
                  {visible.map(({ icon: Icon, title, text }, index) => <Link key={title} href={tab === 'advertiser' ? '/advertisers' : '/publishers'} className={`group flex gap-4 border-b ${line} py-5 transition-colors hover:border-[color:var(--accent)]`}><span className={`pt-0.5 font-mono text-xs ${accent}`}>0{page * 3 + index + 1}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-3"><span className="text-base font-semibold">{title}</span><Icon className={`h-4 w-4 shrink-0 ${muted} transition-colors group-hover:text-[color:var(--accent)]`} aria-hidden="true" /></span><span className={`mt-1 block text-sm leading-6 ${muted}`}>{text}</span></span></Link>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`border-b ${line}`}>
          <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal><div><p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${accent}`}>Formats for different placements</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">The shape of the ad depends on where it lives.</h2></div><Link href="/ad-formats" className={`inline-flex shrink-0 items-center gap-2 text-sm font-semibold ${accent} hover:underline`}>See all formats <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
            <div className={`mt-10 grid border-t ${line} sm:grid-cols-2 lg:grid-cols-5`} data-reveal>{formats.map((format, index) => <Link key={format.name} href="/ad-formats" className={`group border-b ${line} py-5 transition-colors hover:bg-[color:var(--soft)] sm:px-4 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0`}><span className={`font-mono text-sm ${accent}`}>0{index + 1}</span><span className="ml-3 text-sm font-semibold">{format.name}</span><p className={`mt-3 text-sm leading-6 ${muted}`}>{format.text}</p><span className={`mt-5 inline-flex h-10 w-10 items-center justify-center border ${line} text-lg transition-colors group-hover:border-[color:var(--accent)] group-hover:text-[color:var(--accent)]`}>{format.mark}</span></Link>)}</div>
          </div>
        </section>

        <section id="faq" className={`border-b ${line}`}>
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-14 lg:px-10 lg:py-24">
            <div className="lg:col-span-5" data-reveal><p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${accent}`}>Good to know</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Questions, answered.</h2><p className={`mt-5 max-w-sm leading-7 ${muted}`}>Want to talk through a specific setup? <Link href="/support" className="underline decoration-[color:var(--line)] underline-offset-4 hover:text-[color:var(--fg)]">Contact support</Link>.</p></div>
            <div className="lg:col-span-7" data-reveal>{faqs.map((faq, index) => <div key={faq.q} className={`border-t ${line} last:border-b`}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold"><span>{faq.q}</span><Plus className={`h-5 w-5 shrink-0 transition-transform duration-200 ${openFaq === index ? 'rotate-45 text-[color:var(--accent)]' : muted}`} aria-hidden="true" /></button>{openFaq === index && <p className={`max-w-2xl pb-5 leading-7 ${muted}`}>{faq.a}</p>}</div>)}</div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[color:var(--accent)] text-[color:var(--accent-fg)]">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-12 md:items-end lg:px-10 lg:py-20" data-reveal><div className="md:col-span-8"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-75">Make the connection</p><h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-6xl">Start with a campaign.<br className="hidden sm:block" /> Build toward its placement.</h2><p className="mt-5 max-w-xl leading-7 opacity-80">Explore the RivinityADS prototype with sample data. Create an advertiser account to get started.</p></div><div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:justify-end"><Link href="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[color:var(--bg)] px-5 py-3 text-sm font-semibold text-[color:var(--fg)] transition-opacity hover:opacity-90">Create a campaign <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/publishers" className="inline-flex min-h-12 items-center justify-center border border-current/40 px-5 py-3 text-sm font-semibold transition-colors hover:bg-black/5">For publishers</Link></div></div>
        </section>
      </main>
      <footer className={`border-t ${line}`}><div className={`mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-7 text-sm sm:px-6 lg:px-10 ${muted}`}><span>© 2026 RivinityADS</span><nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer"><Link href="/advertisers" className="hover:text-[color:var(--fg)]">Advertisers</Link><Link href="/publishers" className="hover:text-[color:var(--fg)]">Publishers</Link><Link href="/ad-formats" className="hover:text-[color:var(--fg)]">Ad formats</Link><Link href="/support" className="hover:text-[color:var(--fg)]">Support</Link></nav></div></footer>
    </div>
  )
}
