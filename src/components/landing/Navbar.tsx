'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Advertisers', href: '/advertisers' },
  { label: 'Publishers', href: '/publishers' },
  { label: 'Ad formats', href: '/ad-formats' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <div className="landing-navbar-wrap">
      <header className="landing-navbar">
        <Link href="/" className="landing-brand" aria-label="RivinityADS home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#09090B] text-sm font-bold text-white" aria-hidden="true">R</span>
          <span>RivinityADS</span>
        </Link>

        <nav aria-label="Main navigation" className="landing-nav-links">
          {links.map((link) => <Link key={link.label} href={link.href} className="landing-nav-link">{link.label}</Link>)}
        </nav>

        <div className="landing-nav-actions">
          <Link href="/login" className="landing-nav-signin">Sign in</Link>
          <Link href="/signup" className="landing-nav-cta">Get started</Link>
        </div>

        <button
          type="button"
          className="landing-menu-button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </header>
      {open && (
        <nav className="landing-mobile-menu" aria-label="Mobile navigation">
          {links.map((link) => <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className="landing-nav-link">{link.label}</Link>)}
          <Link href="/login" onClick={() => setOpen(false)} className="landing-nav-link">Sign in</Link>
          <Link href="/signup" onClick={() => setOpen(false)} className="landing-nav-cta">Get started</Link>
        </nav>
      )}
    </div>
  )
}
