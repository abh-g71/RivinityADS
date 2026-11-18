'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
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
  Sun,
  Wallet,
  X,
} from 'lucide-react'

/* ---------- Theme (scoped to this page only) ---------- */
const themes = {
  dark: {
    '--bg': 'var(--color-navy-950)',
    '--fg': '#ffffff',
    '--muted': 'var(--color-slate-400)',
    '--line': 'rgb(255 255 255 / 0.1)',
    '--card': 'var(--color-navy-900)',
    '--accent': 'var(--color-brand-500)',
    '--navbg': 'var(--color-navy-950)',
  },
  light: {
    '--bg': '#ffffff',
    '--fg': 'var(--color-navy-900)',
    '--muted': 'var(--color-slate-600)',
    '--line': 'var(--color-slate-200)',
    '--card': '#ffffff',
    '--accent': 'var(--color-brand-600)',
    '--navbg': '#ffffff',
  },
}

const muted = 'text-[color:var(--muted)]'
const accent = 'text-[color:var(--accent)]'
const line = 'border-[color:var(--line)]'
const card = 'bg-[color:var(--card)]'
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2'
const outlineBtn = `inline-flex items-center justify-center gap-2 rounded-lg border ${line} ${card} px-5 py-3 text-sm font-semibold transition-colors duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`

/* ---------- Content ---------- */
const navLinks = [
  { label: 'Advertisers', href: '/advertisers' },
  { label: 'Publishers', href: '/publishers' },
  { label: 'Ad formats', href: '/ad-formats' },
  { label: 'FAQ', href: '#faq' },
]

const steps = [
  { name: 'Goal', user: 'I want more people to visit my store website.', ai: 'Great. Is your goal visits, leads, sales or awareness?' },
  { name: 'Where', user: 'Show it in Delhi, within 10 km.', ai: 'Got it. I set Delhi with a 10 km radius.' },
  { name: 'Budget', user: '₹500 a day.', ai: 'Done. ₹500 a day for 14 days. Want to change it?' },
  { name: 'Your ad', user: 'Use my shop photo and a Shop now button.', ai: 'Here is your preview. Ready to publish?' },
]

const points = [
  { title: 'Two sides, one place', text: 'Advertisers and publishers share one simple console.' },
  { title: 'An ad in two minutes', text: 'Short guided steps that move on by themselves.' },
  { title: 'AI or manual', text: 'Describe your goal, or fill in four easy steps.' },
  { title: 'Reach the right place', text: 'Choose a country, region, city or a spot on the map.' },
  { title: 'See before you publish', text: 'A live preview for every ad size.' },
  { title: 'Simple reports', text: 'Clear numbers in one place.' },
]

type Card = { icon: LucideIcon; title: string; text: string }

const cards: Record<'advertiser' | 'publisher', Card[]> = {
  advertiser: [
    { icon: Megaphone, title: 'Create a campaign', text: 'Pick a goal and follow short steps.' },
    { icon: MapPin, title: 'Choose where it shows', text: 'Country, region, city or a map.' },
    { icon: Eye, title: 'Preview every size', text: 'Feed, Story and Banner, live.' },
    { icon: Wallet, title: 'Set a budget', text: 'A daily amount in ₹ with a recommended default.' },
    { icon: LayoutGrid, title: 'Pick an ad format', text: 'Banner, Native, Popunder, Push or Social Bar.' },
    { icon: BarChart3, title: 'Track results', text: 'Clear numbers in one place.' },
  ],
  publisher: [
    { icon: Globe, title: 'Add your website', text: 'Tell us about your site.' },
    { icon: ShieldCheck, title: 'Verify ownership', text: 'Confirm that the site is yours.' },
    { icon: LayoutGrid, title: 'Create a placement', text: 'Choose where ads appear.' },
    { icon: Code, title: 'Copy the ad code', text: 'Paste one snippet on your site.' },
    { icon: BarChart3, title: 'Track earnings', text: 'See impressions and clicks.' },
    { icon: Banknote, title: 'Get paid', text: 'Payout details are simulated until payments are available.' },
  ],
}

const faqs = [
  { q: 'What is RivinityADS?', a: 'A simple console where advertisers create ads and publishers earn from their websites.' },
  { q: 'How do I create my first ad?', a: 'Choose a goal, pick where it shows, set a budget and add your ad. Or describe it to the AI assistant.' },
  { q: 'How do I earn as a publisher?', a: 'Add your website, verify it, create a placement and paste the ad code on your site.' },
  { q: 'Which ad formats are available?', a: 'Banner, Native, Popunder, Push and Social Bar.' },
  { q: 'Is this a live product?', a: 'No. Displayed data is simulated. Real ad delivery and payments are not active.' },
]

/* ---------- Nav ---------- */
function Nav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b ${line} bg-[color:var(--navbg)]`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--accent)] text-sm text-white">R</span>
            RivinityADS
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} className={`text-sm ${muted} transition hover:text-[color:var(--fg)]`}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${muted} transition hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}
          >
            {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>
          <Link href="/login" className="hidden text-sm font-medium sm:inline">Sign in</Link>
          <Link href="/signup" className="hidden rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white sm:inline-flex">
            Get started
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <div className={`border-t ${line} bg-[color:var(--bg)] px-4 pb-4 md:hidden`}>
          <nav className="flex flex-col py-2" aria-label="Mobile">
            {[...navLinks, { label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }].map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 text-sm font-medium">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

/* ---------- Product mock (drawn with HTML only) ---------- */
function ProductMock() {
  const [size, setSize] = useState<'Feed' | 'Story' | 'Banner'>('Feed')

  const shape = { Feed: 'h-24 w-44', Story: 'h-36 w-24', Banner: 'h-12 w-full max-w-xs' }[size]

  return (
    <div
      className={`overflow-hidden rounded-lg border ${line} bg-[color:var(--bg)]`}
    >
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${line} px-4 py-3 sm:px-5`}>
        <div>
          <p className="text-sm font-semibold">North &amp; Co. - Spring campaign</p>
          <p className={`mt-1 text-xs ${muted}`}>Apr 08 - Apr 14, 2025 <span className="mx-1.5">/</span> Delhi, India</p>
        </div>
        <span className={`rounded-md border ${line} px-2 py-1 text-[10px] font-medium ${muted}`}>Sample data</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b pb-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-[color:var(--line)] sm:pb-5">
          {[
            { label: 'Impressions', value: '48,260', note: '+12.4%' },
            { label: 'Clicks', value: '1,284', note: '+8.2%' },
            { label: 'Click-through rate', value: '2.66%', note: '7-day average' },
            { label: 'Spend', value: <><span aria-label="Indian rupees">INR</span> 3,240</>, note: 'of INR 5,000' },
          ].map((metric, index) => (
            <div key={metric.label} className={index > 0 ? 'sm:pl-4' : ''}>
              <p className={`text-[11px] ${muted}`}>{metric.label}</p>
              <p className="mt-1 text-lg font-semibold tracking-tight">{metric.value}</p>
              <p className={`mt-0.5 text-[10px] ${muted}`}>{metric.note}</p>
            </div>
          ))}
        </div>

        <div className={`mt-4 border-b ${line} pb-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium">Budget pacing</span>
            <span className={muted}>INR 3,240 spent <span className="mx-1">/</span> INR 5,000 total</span>
          </div>
          <div className={`mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--line)]`}>
            <div className="h-full w-[64.8%] rounded-full bg-[color:var(--accent)]" />
          </div>
        </div>

        <div className="grid gap-5 py-4 sm:grid-cols-[1.5fr_1fr]">
          <section aria-label="Campaign clicks chart">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold">Clicks over time</h3>
                <p className={`mt-1 text-[10px] ${muted}`}>Daily results for campaign period</p>
              </div>
              <span className={`text-[10px] ${muted}`}>Clicks</span>
            </div>
            <div className="mt-3 flex h-24 gap-2">
              <div className={`flex flex-col justify-between pb-4 text-[9px] ${muted}`} aria-hidden="true"><span>400</span><span>200</span><span>0</span></div>
              <div className="relative min-w-0 flex-1">
                <div className="absolute inset-0 flex flex-col justify-between pb-4" aria-hidden="true">
                  <span className={`border-t ${line}`} /><span className={`border-t ${line}`} /><span className={`border-t ${line}`} />
                </div>
                <svg viewBox="0 0 420 90" preserveAspectRatio="none" className="relative h-[calc(100%-1rem)] w-full" aria-hidden="true">
                  <path d="M4 75C38 72 51 58 80 63S122 51 150 56 188 36 216 43 251 46 279 35 318 32 347 24 387 28 416 9" fill="none" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  <circle cx="416" cy="9" r="3.5" fill="#3b82f6" />
                </svg>
                <div className={`absolute inset-x-0 bottom-0 flex justify-between text-[9px] ${muted}`} aria-hidden="true">
                  <span>Apr 08</span><span>10</span><span>12</span><span>14</span>
                </div>
              </div>
            </div>
          </section>

          <section className={`border-t ${line} pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0`} aria-label="Audience insights">
            <h3 className="text-xs font-semibold">Audience insights</h3>
            <p className={`mt-1 text-[10px] ${muted}`}>Top segments by impressions</p>
            <dl className="mt-3 space-y-2.5">
              {[
                { label: 'Delhi', value: '42%' },
                { label: 'Age 25-34', value: '38%' },
                { label: 'Mobile devices', value: '68%' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2 text-[11px]">
                  <dt className={muted}>{item.label}</dt><dd className="font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className={`overflow-x-auto border-t ${line} pt-4`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold">Recent campaigns</h3>
            <span className={`text-[10px] ${muted}`}>Sample data</span>
          </div>
          <table className="w-full min-w-[360px] text-left text-[10px]">
            <thead className={muted}><tr><th className="py-2 font-medium">Campaign</th><th className="py-2 font-medium">Status</th><th className="py-2 font-medium">Spend</th><th className="py-2 font-medium">Clicks</th></tr></thead>
            <tbody className={`divide-y ${line}`}>
              <tr><td className="py-2 font-medium">Spring collection</td><td className="py-2">Active</td><td className="py-2">INR 3,240</td><td className="py-2">1,284</td></tr>
              <tr><td className="py-2 font-medium">Weekend offers</td><td className="py-2">Paused</td><td className="py-2">INR 1,860</td><td className="py-2">742</td></tr>
            </tbody>
          </table>
        </div>

        <div className={`grid gap-4 border-t ${line} pt-4 sm:grid-cols-[1fr_1.2fr] sm:items-center`}>
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold">Campaign setup</h3>
              <span className={`text-[10px] ${muted}`}>Step 1 of {steps.length}: {steps[0].name}</span>
            </div>
            <p className={`mt-1.5 text-[10px] leading-4 ${muted}`}>{steps[0].ai}</p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className={`text-[10px] ${muted}`}>Ad format</span>
              <div className="flex gap-1" role="tablist" aria-label="Ad size">
                {(['Feed', 'Story', 'Banner'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={size === t}
                    onClick={() => setSize(t)}
                    className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${size === t ? 'bg-[color:var(--accent)] text-white' : muted}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex min-h-24 items-center justify-center overflow-hidden rounded-md bg-slate-100 p-2">
              <div className={`${shape} flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded border border-slate-200 bg-white p-2 text-left text-navy-900 ${size === 'Story' ? 'flex-col text-center' : 'flex-row'}`}>
                <div className={`flex shrink-0 items-center justify-center bg-slate-100 text-[9px] font-semibold text-slate-600 ${size === 'Story' ? 'h-8 w-8' : 'h-8 w-10'}`}>N&amp;C</div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">North &amp; Co.</p>
                  <p className="mt-0.5 truncate text-[10px] font-semibold">New season, made for everyday</p>
                  {size !== 'Banner' && <span className="mt-1 inline-flex rounded bg-blue-700 px-1.5 py-0.5 text-[8px] font-semibold text-white">Shop collection</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Page ---------- */
export function HomePage() {
  const [dark, setDark] = useState(true)
  const [tab, setTab] = useState<'advertiser' | 'publisher'>('advertiser')
  const [page, setPage] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setDark(localStorage.getItem('landing-theme') !== 'light')
      } catch {}
    })
    return () => cancelAnimationFrame(id)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    try {
      localStorage.setItem('landing-theme', next ? 'dark' : 'light')
    } catch {}
  }

  const vars = (dark ? themes.dark : themes.light) as unknown as CSSProperties
  const visible = cards[tab].slice(page * 3, page * 3 + 3)

  return (
    <div style={vars} className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] transition-colors duration-150">
      <Nav dark={dark} onToggle={toggleTheme} />

      <main>
        {/* Hero and product preview */}
        <section
          className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.78fr_1.22fr] lg:gap-12 lg:py-14"
          style={{ backgroundImage: 'linear-gradient(to right, #3b82f60a 1px, transparent 1px), linear-gradient(to bottom, #3b82f60a 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        >
          <div className="max-w-lg">
            <p className={`mb-5 text-xs font-semibold uppercase tracking-[0.16em] ${accent}`}>Digital advertising, in one place</p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Plan campaigns. Reach the right people.
            </h1>
            <p className={`mt-5 max-w-md text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}>
              Build digital ad campaigns with clear targeting and budget controls, then track performance in one place. Publishers can manage their inventory alongside them.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/signup" className={primaryBtn}>Get started</Link>
              <Link href="/publishers" className={outlineBtn}>For publishers</Link>
            </div>
            <div className={`mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${muted}`}>
              <span>Want a faster start?</span>
              <Link href="/campaigns/new/ai" className="font-medium text-[color:var(--fg)] underline decoration-[color:var(--line)] underline-offset-4 transition hover:decoration-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">
                Create a campaign with AI
              </Link>
            </div>
            <p className={`mt-3 text-xs ${muted}`}>Authentication and displayed data are simulated. No ads are delivered.</p>
          </div>

          <ProductMock />
        </section>
        {/* What is */}
        <section className={`border-t ${line}`}>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">What is RivinityADS?</h2>
              <p className={`mt-4 max-w-md text-lg leading-8 ${muted}`}>
                Advertisers create ads in a few short steps. Publishers add their websites and earn from the ads shown there.
              </p>
              <Link href="/advertisers" className="mt-6 inline-flex items-center gap-2 font-semibold">
                Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ol>
              {points.map((p, i) => (
                <li key={p.title} className={`flex gap-5 border-t ${line} py-5 first:border-t-0 lg:first:border-t`}>
                  <span className={`font-mono text-sm ${accent}`}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className={`mt-1 ${muted}`}>{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What can you do */}
        <section className={`border-t ${line}`}>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-4xl font-bold tracking-tight">What can you do?</h2>
            <p className={`mt-4 text-lg ${muted}`}>Create an ad from one sentence, or add your website and start earning.</p>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className={`inline-flex rounded-lg border ${line} ${card} p-1`} role="tablist" aria-label="Choose your side">
                {([['advertiser', "I'm an advertiser"], ['publisher', "I'm a publisher"]] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => {
                      setTab(key)
                      setPage(0)
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === key ? 'bg-[color:var(--accent)] text-white' : muted}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${muted}`}>{page + 1} / 2</span>
                <button
                  type="button"
                  aria-label="Previous"
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${line} disabled:opacity-40`}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${line} disabled:opacity-40`}
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-x-8 md:grid-cols-3">
              {visible.map(({ icon: Icon, title, text }) => (
                <Link
                  key={title}
                  href={tab === 'advertiser' ? '/advertisers' : '/publishers'}
                  className={`flex items-start gap-3 border-t ${line} ${card} py-4 transition-colors duration-150`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className={`mt-1 text-sm ${muted}`}>{text}</p>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={`border-t ${line}`}>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">FAQ</h2>
              <p className={`mt-4 text-lg ${muted}`}>
                Something else?{' '}
                <Link href="/support" className="underline">Contact us</Link>.
              </p>
            </div>
            <div>
              {faqs.map((f, i) => (
                <div key={f.q} className={`border-t ${line} last:border-b`}>
                  <button
                    type="button"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold"
                  >
                    {f.q}
                    <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </button>
                  {openFaq === i && <p className={`pb-5 ${muted}`}>{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className={`border-t ${line}`}>
          <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Start your first campaign</h2>
            <p className={`mx-auto mt-4 max-w-md ${muted}`}>Explore RivinityADS with simulated data. No setup needed.</p>
            <Link href="/signup" className={`${primaryBtn} mt-8`}>Get started</Link>
          </div>
        </section>
      </main>

      <footer className={`border-t ${line}`}>
        <div className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm sm:px-6 ${muted}`}>
          <span>© 2026 RivinityADS</span>
          <nav className="flex flex-wrap gap-5" aria-label="Footer">
            <Link href="/advertisers">Advertisers</Link>
            <Link href="/publishers">Publishers</Link>
            <Link href="/ad-formats">Ad formats</Link>
            <Link href="/support">Support</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
