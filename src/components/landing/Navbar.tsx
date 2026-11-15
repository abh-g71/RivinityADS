'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiMenu } from 'react-icons/fi'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/primitives/sheet'

const links = [
  { label: 'Home', href: '/' },
  { label: 'For Advertisers', href: '/advertisers' },
  { label: 'For Publishers', href: '/publishers' },
  { label: 'Ad Formats', href: '/ad-formats' },
  { label: 'Pricing', href: '/#pricing' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white" aria-hidden="true">R</span>
        RivinityADS
      </Link>

      <nav aria-label="Main navigation" className="hidden gap-8 text-sm font-medium md:flex">
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            aria-current={pathname === l.href ? 'page' : undefined}
            className={pathname === l.href ? 'text-brand-700' : 'text-slate-700 transition-colors hover:text-navy-900'}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 text-sm font-semibold">
        <Link href="/login" className="hidden sm:inline">Sign in</Link>
        <Link href="/signup" className="rounded-xl bg-navy-900 px-4 py-2 text-white transition-colors hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          Sign up
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button type="button" className="rounded-xl p-2 text-navy-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden" aria-label="Open menu">
              <FiMenu className="h-6 w-6" aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent id="mobile-navigation" side="right" className="w-[min(20rem,85vw)] border-slate-200 bg-white p-5 md:hidden">
            <SheetTitle className="sr-only">Main navigation</SheetTitle>
            <nav aria-label="Mobile navigation" className="mt-8 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}