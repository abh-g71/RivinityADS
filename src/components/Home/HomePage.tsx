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
  Check,
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
  Sparkles,
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
    '--card': 'rgb(255 255 255 / 0.04)',
    '--accent': 'var(--color-brand-500)',
    '--navbg': 'color-mix(in srgb, var(--color-navy-950) 80%, transparent)',
  },
  light: {
    '--bg': '#ffffff',
    '--fg': 'var(--color-navy-900)',
    '--muted': 'var(--color-slate-600)',
    '--line': 'var(--color-slate-200)',
    '--card': 'var(--color-slate-50)',
    '--accent': 'var(--color-brand-600)',
    '--navbg': 'color-mix(in srgb, white 80%, transparent)',
  },
}

const muted = 'text-[color:var(--muted)]'
const accent = 'text-[color:var(--accent)]'
const line = 'border-[color:var(--line)]'
const card = 'bg-[color:var(--card)]'
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2'
const outlineBtn = `inline-flex items-center justify-center gap-2 rounded-xl border ${line} ${card} px-5 py-3 text-sm font-semibold transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`

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
    { icon: Banknote, title: 'Get paid (sample)', text: 'Payout details are sample data for now.' },
  ],
}

const faqs = [
  { q: 'What is RivinityADS?', a: 'A simple console where advertisers create ads and publishers earn from their websites.' },
  { q: 'How do I create my first ad?', a: 'Choose a goal, pick where it shows, set a budget and add your ad. Or describe it to the AI assistant.' },
  { q: 'How do I earn as a publisher?', a: 'Add your website, verify it, create a placement and paste the ad code on your site.' },
  { q: 'Which ad formats are available?', a: 'Banner, Native, Popunder, Push and Social Bar.' },
  { q: 'Is this a live product?', a: 'No. It is a prototype with sample data. Real ad delivery and payments come later.' },
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
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled ? `${line} bg-[color:var(--navbg)] backdrop-blur-md` : 'border-transparent'
      }`}
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
          <Link href="/signup" className="hidden rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white sm:inline-flex">
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
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const [size, setSize] = useState<'Feed' | 'Story' | 'Banner'>('Feed')

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 3500)
    return () => clearInterval(id)
  }, [paused])

  const shape = { Feed: 'h-36 w-36', Story: 'h-48 w-28', Banner: 'h-14 w-56' }[size]

  return (
    <div
      className={`rounded-2xl border ${line} ${card} p-3`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <span className={`text-xs ${muted}`}>Mock preview</span>
      </div>

      <div className="grid gap-3 md:grid-cols-[200px_1fr_260px]">
        {/* Steps */}
        <ol className={`rounded-xl border ${line} p-3`} aria-label="Campaign steps">
          {steps.map((s, i) => (
            <li key={s.name} className={`flex items-center gap-3 py-2 text-sm ${i === step ? 'font-semibold' : muted}`}>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${line} ${
                  i < step ? 'bg-[color:var(--accent)] text-white' : i === step ? accent : ''
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              {s.name}
            </li>
          ))}
        </ol>

        {/* Ad preview */}
        <div className={`flex flex-col items-center rounded-xl border ${line} p-3`}>
          <div className="flex gap-1" role="tablist" aria-label="Ad size">
            {(['Feed', 'Story', 'Banner'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={size === t}
                onClick={() => setSize(t)}
                className={`rounded-lg px-3 py-1 text-xs font-medium ${size === t ? 'bg-[color:var(--accent)] text-white' : muted}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex h-52 items-center justify-center">
            <div className={`${shape} flex flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2 text-center text-white transition-all duration-300`}>
              <p className="text-sm font-bold leading-tight">Fresh styles near you</p>
              {size !== 'Banner' && <span className="mt-2 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-navy-900">Shop now</span>}
            </div>
          </div>
        </div>

        {/* Assistant */}
        <div className={`flex flex-col gap-2 rounded-xl border ${line} p-3 text-sm`}>
          <p className={`text-xs ${muted}`}>AI assistant (demo)</p>
          <p className="ml-6 rounded-xl bg-[color:var(--accent)] px-3 py-2 text-white">{steps[step].user}</p>
          <p className={`mr-6 rounded-xl border ${line} px-3 py-2`}>{steps[step].ai}</p>
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
    <div style={vars} className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] transition-colors duration-300">
      <Nav dark={dark} onToggle={toggleTheme} />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Create ads in minutes.
            <br />
            Earn from your website.
          </h1>
          <p className={`mx-auto mt-6 max-w-xl text-lg ${muted}`}>One simple console for advertisers and publishers.</p>

          <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 lg:flex-row">
            <Link
              href="/campaigns/new/ai"
              className={`flex flex-1 items-center gap-3 rounded-xl border ${line} ${card} px-4 py-2.5 text-left text-sm transition hover:opacity-80`}
            >
              <Sparkles className={`h-4 w-4 shrink-0 ${accent}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">Promote my clothing store in Delhi, ₹500 a day</span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-white">
                Try it <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
            <Link href="/signup" className={primaryBtn}>Get started</Link>
            <Link href="/publishers" className={outlineBtn}>For publishers</Link>
          </div>
          <p className={`mt-4 text-xs ${muted}`}>AI assistant (demo) · No setup needed to explore the prototype</p>
        </section>

        {/* Product visual */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
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
              <div className={`inline-flex rounded-xl border ${line} ${card} p-1`} role="tablist" aria-label="Choose your side">
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

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {visible.map(({ icon: Icon, title, text }) => (
                <Link
                  key={title}
                  href={tab === 'advertiser' ? '/advertisers' : '/publishers'}
                  className={`group rounded-2xl border ${line} ${card} p-6 transition hover:-translate-y-1`}
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl border ${line} ${accent}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className={`mt-1 ${muted}`}>{text}</p>
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
                    <Plus className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} aria-hidden="true" />
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
            <p className={`mx-auto mt-4 max-w-md ${muted}`}>Explore the prototype with sample data. No setup needed.</p>
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