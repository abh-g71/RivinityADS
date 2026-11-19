'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Menu, Moon, Plus, Sun, X } from 'lucide-react'

/* THEME: change the landing page colors here and nowhere else. */
const THEMES = {
  dark: {
    '--bg': '#0B1020',
    '--surface': '#111831',
    '--line': 'rgba(255,255,255,0.1)',
    '--fg': '#F5F7FA',
    '--muted': '#9AA4B2',
    '--accent': '#8B98FF',
    '--solid': '#4F63F0',
  },
  light: {
    '--bg': '#FFFFFF',
    '--surface': '#F6F7F9',
    '--line': '#E4E7EC',
    '--fg': '#101828',
    '--muted': '#5B6676',
    '--accent': '#3B4FE0',
    '--solid': '#3B4FE0',
  },
}

const MUTED = 'text-[color:var(--muted)]'
const ACCENT = 'text-[color:var(--accent)]'
const BORDER = 'border-[color:var(--line)]'
const SURFACE = 'bg-[color:var(--surface)]'
const SOLID = 'bg-[color:var(--solid)]'
const BTN_PRIMARY = `inline-flex items-center justify-center rounded-lg ${SOLID} px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]`
const BTN_OUTLINE = `inline-flex items-center justify-center rounded-lg border ${BORDER} ${SURFACE} px-5 py-3 text-sm font-semibold transition-colors hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`

/* ---------- Content ---------- */
const NAV = [
  { label: 'Advertisers', href: '/advertisers' },
  { label: 'Publishers', href: '/publishers' },
  { label: 'Ad formats', href: '/ad-formats' },
  { label: 'FAQ', href: '#faq' },
]

const POINTS = [
  { title: 'A console for each side', text: 'Advertisers and publishers each get their own workspace.' },
  { title: 'Four short steps', text: 'Goal, audience, budget, ad. One screen each.' },
  { title: 'Describe it or fill it in', text: 'Type what you want to promote, or use the manual steps.' },
  { title: 'Pick places, not only cities', text: 'Countries, cities, PIN codes or a radius on the map.' },
  { title: 'Preview before you publish', text: 'See the ad in Feed, Story and Banner sizes.' },
  { title: 'Numbers in one place', text: 'Spend, impressions, clicks and results for every campaign.' },
]

type Kind = 'steps' | 'places' | 'sizes' | 'budget' | 'formats' | 'bars' | 'site' | 'token' | 'placement' | 'code' | 'line' | 'payout'

const CARDS: Record<'advertiser' | 'publisher', { title: string; text: string; kind: Kind }[]> = {
  advertiser: [
    { title: 'Create a campaign', text: 'Four short steps from goal to ad.', kind: 'steps' },
    { title: 'Choose where it shows', text: 'Add as many places as you need.', kind: 'places' },
    { title: 'Preview every size', text: 'Check the ad before it goes live.', kind: 'sizes' },
    { title: 'Set a daily budget', text: 'Spend what you planned, in ₹.', kind: 'budget' },
    { title: 'Pick an ad format', text: 'Banner, Native, Popunder, Push or Social bar.', kind: 'formats' },
    { title: 'Track results', text: 'See what each campaign delivers.', kind: 'bars' },
  ],
  publisher: [
    { title: 'Add your website', text: 'Tell us which site will show ads.', kind: 'site' },
    { title: 'Verify ownership', text: 'Add one line to prove the site is yours.', kind: 'token' },
    { title: 'Create a placement', text: 'Choose where on the page ads appear.', kind: 'placement' },
    { title: 'Copy the ad code', text: 'Paste one snippet into your page.', kind: 'code' },
    { title: 'Track earnings', text: 'Impressions, clicks and revenue by day.', kind: 'line' },
    { title: 'See your payouts', text: 'Payout details are sample data for now.', kind: 'payout' },
  ],
}

const FAQS = [
  { q: 'What is RivinityADS?', a: 'An ad network. Advertisers launch campaigns, and publishers earn from the ads shown on their websites.' },
  { q: 'How do I create my first ad?', a: 'Choose a goal, set the audience and budget, then add your ad. You can also describe it to the assistant.' },
  { q: 'How do I earn as a publisher?', a: 'Add and verify your website, create a placement, then paste the ad code into your page.' },
  { q: 'Which ad formats are available?', a: 'Banner, Native, Popunder, Push and Social bar.' },
  { q: 'Is this a live product?', a: 'Not yet. This is a prototype with sample data. Real ad delivery and payments are not connected.' },
]

/* ---------- Small pieces ---------- */
function Logo() {
  return (
    <svg viewBox="0 0 24 24" className={`h-6 w-6 ${ACCENT}`} fill="currentColor" aria-hidden="true">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return <span className={`rounded-md border ${BORDER} px-2 py-1 text-xs`}>{children}</span>
}

function Snippet({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'steps':
      return (
        <ul className="w-full space-y-1.5 text-xs">
          {['Goal', 'Audience', 'Budget', 'Ad'].map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${BORDER} ${i < 2 ? `${SOLID} text-white` : ''}`}>
                {i < 2 && <Check className="h-3 w-3" aria-hidden="true" />}
              </span>
              <span className={i < 2 ? '' : MUTED}>{s}</span>
            </li>
          ))}
        </ul>
      )
    case 'places':
      return (
        <div className="flex flex-wrap gap-1.5">
          {['India', 'Pune', '110001', '10 km'].map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
      )
    case 'sizes':
      return (
        <div className="flex items-end gap-3">
          {[['Feed', 'h-14 w-14'], ['Story', 'h-20 w-11'], ['Banner', 'h-6 w-24']].map(([n, c]) => (
            <div key={n} className={`flex items-center justify-center rounded border ${BORDER} text-[10px] ${MUTED} ${c}`}>{n}</div>
          ))}
        </div>
      )
    case 'budget':
      return (
        <div className="w-full">
          <p className="font-mono text-sm">₹500 / day</p>
          <div className="relative mt-3 h-1 rounded bg-[color:var(--line)]">
            <div className={`h-1 w-2/5 rounded ${SOLID}`} />
            <span className={`absolute left-[40%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${SOLID}`} />
          </div>
        </div>
      )
    case 'formats':
      return (
        <div className="flex flex-wrap gap-1.5">
          {['Banner', 'Native', 'Popunder', 'Push', 'Social bar'].map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
      )
    case 'bars':
      return (
        <div className="flex h-14 w-full items-end gap-1.5" aria-hidden="true">
          {[30, 45, 38, 60, 52, 72].map((h, i) => <div key={i} className={`flex-1 rounded-sm ${SOLID}`} style={{ height: `${h}%` }} />)}
        </div>
      )
    case 'site':
      return (
        <div className="flex w-full items-center gap-2 text-xs">
          <span className={`flex-1 rounded-md border ${BORDER} px-3 py-2 font-mono ${MUTED}`}>yourwebsite.com</span>
          <span className={`rounded-md ${SOLID} px-3 py-2 font-semibold text-white`}>Add</span>
        </div>
      )
    case 'token':
      return <code className={`w-full rounded-md border ${BORDER} px-3 py-2 font-mono text-xs`}>rivinity-verify=7f3a91c2</code>
    case 'placement':
      return (
        <div className={`flex w-full items-center justify-between rounded-md border ${BORDER} px-3 py-2 text-xs`}>
          Sidebar · 300×250
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      )
    case 'code':
      return (
        <pre className={`w-full overflow-hidden rounded-md border ${BORDER} p-2 font-mono text-[11px] leading-4 ${MUTED}`}>{`<script async
  src=".../tag.js"
  data-slot="demo"></script>`}</pre>
      )
    case 'line':
      return (
        <svg viewBox="0 0 120 50" className={`h-14 w-full ${ACCENT}`} preserveAspectRatio="none" aria-hidden="true">
          <polyline points="0,40 20,32 40,36 60,22 80,26 100,14 120,10" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      )
    case 'payout':
      return (
        <div className="w-full text-xs">
          {[['Method', 'UPI'], ['Status', 'Sample'], ['Minimum', 'Set later']].map(([k, v]) => (
            <div key={k} className={`flex justify-between border-b ${BORDER} py-1.5 last:border-0`}>
              <span className={MUTED}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      )
  }
}

/* ---------- Product panel (sample data, drawn with HTML) ---------- */
function ProductPanel() {
  const rows = [
    { name: 'Diwali sale · Delhi', status: 'Active', dot: 'bg-green-500', spend: '₹6,200', ctr: '2.8%' },
    { name: 'Salon bookings · Pune', status: 'Active', dot: 'bg-green-500', spend: '₹4,150', ctr: '2.1%' },
    { name: 'App launch · India', status: 'Paused', dot: 'bg-amber-500', spend: '₹5,900', ctr: '1.7%' },
    { name: 'Event tickets · Mumbai', status: 'Draft', dot: 'bg-slate-400', spend: '₹0', ctr: '—' },
  ]
  return (
    <div className={`overflow-hidden rounded-xl border ${BORDER} ${SURFACE}`}>
      <div className={`flex items-center justify-between border-b ${BORDER} px-4 py-2.5`}>
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[color:var(--line)]" />)}
        </div>
        <span className={`text-xs ${MUTED}`}>Sample data</span>
        <span className="w-10" />
      </div>
      <div className="grid md:grid-cols-[180px_1fr]">
        <aside className={`hidden border-r ${BORDER} p-3 text-sm md:block`}>
          {['Home', 'Campaigns', 'Reports', 'Billing', 'Support'].map((n) => (
            <div key={n} className={`rounded-md px-3 py-2 ${n === 'Campaigns' ? 'bg-[color:var(--fg)] font-medium text-[color:var(--bg)]' : MUTED}`}>{n}</div>
          ))}
        </aside>
        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Campaigns</h2>
            <span className={`rounded-md ${SOLID} px-3 py-1.5 text-xs font-semibold text-white`}>Create</span>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-4">
            {[['Spend', '₹16,250'], ['Clicks', '6,214'], ['CTR', '2.31%']].map(([k, v]) => (
              <div key={k}>
                <dt className={`text-xs ${MUTED}`}>{k}</dt>
                <dd className="mt-1 font-mono text-lg">{v}</dd>
              </div>
            ))}
          </dl>
          <div className={`mt-4 rounded-lg border ${BORDER} p-3`}>
            <p className={`text-xs ${MUTED}`}>Clicks, last 7 days</p>
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className={`mt-2 h-24 w-full ${ACCENT}`} aria-label="Line chart of clicks over seven days">
              {[20, 50, 80].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />)}
              <polyline points="0,63 50,51 100,57 150,38 200,46 250,29 300,23" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className={`mt-1 flex justify-between text-[10px] ${MUTED}`}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className={`text-xs ${MUTED}`}>
                <tr>
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Spend</th>
                  <th className="py-2 text-right font-medium">CTR</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className={`border-t ${BORDER}`}>
                    <td className="py-2.5">{r.name}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${r.dot}`} aria-hidden="true" />
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono">{r.spend}</td>
                    <td className="py-2.5 text-right font-mono">{r.ctr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <header className={`sticky top-0 z-40 border-b ${scrolled ? `${BORDER} bg-[color:var(--bg)]` : 'border-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Logo />
            RivinityADS
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {NAV.map((l) => (
              <Link key={l.label} href={l.href} className={`text-sm ${MUTED} transition-colors hover:text-[color:var(--fg)]`}>{l.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${MUTED} hover:text-[color:var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}
          >
            {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>
          <Link href="/login" className="hidden px-2 text-sm font-medium sm:inline">Sign in</Link>
          <Link href="/signup" className={`hidden rounded-lg ${SOLID} px-4 py-2 text-sm font-semibold text-white hover:opacity-90 sm:inline-flex`}>Get started</Link>
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
        <nav className={`border-t ${BORDER} bg-[color:var(--bg)] px-4 pb-3 md:hidden`} aria-label="Mobile">
          {[...NAV, { label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }].map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3 text-sm font-medium">{l.label}</Link>
          ))}
        </nav>
      )}
    </header>
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

  const vars = (dark ? THEMES.dark : THEMES.light) as unknown as CSSProperties
  const visible = CARDS[tab].slice(page * 3, page * 3 + 3)

  return (
    <div style={vars} className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)]">
      <Nav dark={dark} onToggle={toggleTheme} />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Run ads in minutes.
            <br />
            Earn from your website.
          </h1>
          <p className={`mx-auto mt-6 max-w-xl text-lg leading-8 ${MUTED}`}>
            RivinityADS is an ad network. Advertisers launch campaigns, and publishers earn from the ads on their sites.
          </p>

          <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 lg:flex-row">
            <Link
              href="/campaigns/new/ai"
              className={`flex flex-1 items-center gap-3 rounded-lg border ${BORDER} ${SURFACE} px-4 py-3 text-left text-sm transition-colors hover:border-[color:var(--accent)]`}
            >
              <span className={`font-mono ${ACCENT}`} aria-hidden="true">›</span>
              <span className="min-w-0 flex-1 truncate">Promote my clothing store in Delhi, ₹500 a day</span>
              <span className={`inline-flex items-center gap-1 rounded-md ${SOLID} px-2.5 py-1 text-xs font-semibold text-white`}>
                Try it <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
            <Link href="/signup" className={BTN_PRIMARY}>Start advertising</Link>
            <Link href="/signup" className={BTN_OUTLINE}>Start earning</Link>
          </div>
          <p className={`mt-4 text-xs ${MUTED}`}>The assistant is a demo · All numbers on this page are sample data</p>
        </section>

        {/* Product */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <ProductPanel />
        </section>

        {/* What is */}
        <section className={`border-t ${BORDER}`}>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight">What is RivinityADS?</h2>
              <p className={`mt-4 max-w-md text-lg leading-8 ${MUTED}`}>
                Advertisers create a campaign in a few short steps. Publishers add a website and get paid for the ads that run on it.
              </p>
              <Link href="/advertisers" className="mt-6 inline-flex items-center gap-2 font-semibold hover:underline">
                Read more <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ol>
              {POINTS.map((p, i) => (
                <li key={p.title} className={`flex gap-5 border-t ${BORDER} py-5 first:border-t-0 lg:first:border-t`}>
                  <span className={`font-mono text-sm ${ACCENT}`}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className={`mt-1 ${MUTED}`}>{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What can you do */}
        <section className={`border-t ${BORDER}`}>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-4xl font-semibold tracking-tight">What can you do?</h2>
            <p className={`mt-4 text-lg ${MUTED}`}>Pick your side to see the steps.</p>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className={`inline-flex rounded-lg border ${BORDER} p-1`} role="tablist" aria-label="Choose your side">
                {([['advertiser', 'Advertiser'], ['publisher', 'Publisher']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => {
                      setTab(key)
                      setPage(0)
                    }}
                    className={`rounded-md px-4 py-2 text-sm font-semibold ${tab === key ? `${SOLID} text-white` : MUTED}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-sm ${MUTED}`}>{page + 1} / 2</span>
                <button type="button" aria-label="Previous" disabled={page === 0} onClick={() => setPage(0)} className={`flex h-10 w-10 items-center justify-center rounded-full border ${BORDER} disabled:opacity-40`}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Next" disabled={page === 1} onClick={() => setPage(1)} className={`flex h-10 w-10 items-center justify-center rounded-full border ${BORDER} disabled:opacity-40`}>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {visible.map((c) => (
                <Link
                  key={c.title}
                  href={tab === 'advertiser' ? '/advertisers' : '/publishers'}
                  className={`rounded-xl border ${BORDER} ${SURFACE} p-5 transition-colors hover:border-[color:var(--accent)]`}
                >
                  <div className={`flex h-32 items-center rounded-lg border ${BORDER} bg-[color:var(--bg)] p-4`}>
                    <Snippet kind={c.kind} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                  <p className={`mt-1 ${MUTED}`}>{c.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={`scroll-mt-16 border-t ${BORDER}`}>
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight">FAQ</h2>
              <p className={`mt-4 text-lg ${MUTED}`}>
                Something else? <Link href="/support" className="underline">Contact support</Link>.
              </p>
            </div>
            <div>
              {FAQS.map((f, i) => (
                <div key={f.q} className={`border-t ${BORDER} last:border-b`}>
                  <button
                    type="button"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold"
                  >
                    {f.q}
                    <Plus className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} aria-hidden="true" />
                  </button>
                  {openFaq === i && <p className={`pb-5 ${MUTED}`}>{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className={`border-t ${BORDER}`}>
          <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Start your first campaign</h2>
            <p className={`mx-auto mt-4 max-w-md ${MUTED}`}>Explore the prototype with sample data.</p>
            <Link href="/signup" className={`${BTN_PRIMARY} mt-8`}>Get started</Link>
          </div>
        </section>
      </main>

      <footer className={`border-t ${BORDER}`}>
        <div className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm sm:px-6 ${MUTED}`}>
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