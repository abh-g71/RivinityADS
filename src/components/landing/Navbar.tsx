'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/primitives/sheet'

const links = [
  { label: 'Product', href: '/#product' },
  { label: 'Pricing', href: '/#faq' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md text-base font-bold tracking-tight text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white" aria-hidden="true">R</span>
          <span>RivinityADS</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="rounded-sm text-slate-600 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-sm font-semibold sm:gap-4">
          <Link href="/login" className="hidden min-h-10 items-center rounded-md px-2 text-navy-900 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 md:inline-flex">
            Sign in
          </Link>
          <Link href="/signup" className="hidden min-h-10 items-center rounded-lg bg-brand-600 px-4 text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 md:inline-flex">
            Get started
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,85vw)] border-slate-200 bg-white p-5 md:hidden">
              <SheetTitle className="mt-2 text-base">RivinityADS navigation</SheetTitle>
              <nav aria-label="Mobile navigation" className="mt-4 flex flex-col gap-1">
                {links.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-slate-200" />
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                  Sign in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="mt-1 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
                  Get started
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
