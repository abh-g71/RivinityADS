'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CircleUserRound, LifeBuoy, Menu, Search, Settings } from 'lucide-react'
import { Button, ButtonLink } from '../components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu'
import { useToast } from '@/components/shared/Toast'
import {
  mockAdvertiserBalance,
  mockConsoleNotifications,
  mockConsoleUser,
  type ConsoleNotification,
} from '@/data/console'
import { getNavGroups, type ConsoleRole } from '@/data/navigation'

type TopBarProps = {
  role: ConsoleRole
  onMenuClick: () => void
  onLogout: () => void
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
})

export function TopBar({ role, onMenuClick, onLogout }: TopBarProps) {
  const [notifications, setNotifications] = useState(mockConsoleNotifications)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const toast = useToast()
  const unreadCount = notifications.filter((notification) => !notification.read).length
  const balance = currency.format(mockAdvertiserBalance)

  // Every page in this role's menu, with its section name, is searchable.
  const pages = useMemo(
    () => getNavGroups(role).flatMap((group) => group.items.map((item) => ({ ...item, section: group.title ?? 'Main' }))),
    [role],
  )
  const q = query.trim().toLowerCase()
  const results = (q ? pages.filter((p) => `${p.label} ${p.section}`.toLowerCase().includes(q)) : pages).slice(0, 7)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function go(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
  }

  function markAllAsRead() {
    if (!unreadCount) return
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
    toast({ title: 'Notifications marked as read', description: 'All mock notifications are now read.', variant: 'success' })
  }

  function markNotificationAsRead(notification: ConsoleNotification) {
    setNotifications((current) => current.map((item) =>
      item.id === notification.id ? { ...item, read: true } : item,
    ))
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-6 md:h-16 md:flex-nowrap md:py-0">
      <Button
        variant="ghost"
        className="h-10 w-10 shrink-0 px-0"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy-900 md:hidden xl:block xl:flex-none">
        {role === 'publisher' ? 'Publisher Console' : role === 'admin' ? 'Admin Console' : 'Advertiser Console'}
      </p>

      {/* Search: own row on phones, centred on wider screens */}
      <div ref={searchRef} className="relative order-last w-full md:order-none md:mx-auto md:w-auto md:max-w-xl md:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
            if (e.key === 'Enter' && results[0]) go(results[0].href)
          }}
          placeholder="Search pages, e.g. reports, add funds"
          aria-label="Search pages"
          autoComplete="off"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white p-1" role="listbox" aria-label="Search results">
            {results.length ? results.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => go(p.href)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-navy-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span>{p.label}</span>
                <span className="text-xs text-slate-500">{p.section}</span>
              </button>
            )) : <p className="px-3 py-3 text-sm text-slate-500">No pages match &ldquo;{query}&rdquo;.</p>}
          </div>
        )}
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-1 lg:gap-3">
        {role === 'advertiser' && (
          <>
            <ButtonLink href="/campaigns/new" aria-label="Create Campaign" className="shrink-0 px-2 py-2 text-xs sm:px-3 sm:text-sm">
              <span className="lg:hidden">New</span>
              <span className="hidden lg:inline">Create Campaign</span>
            </ButtonLink>
            <Link
              href="/add-funds"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-3"
              aria-label={`Mock advertiser balance ${balance}. Add funds`}
            >
              <span className="hidden lg:inline">{balance}</span>
              <span aria-hidden="true">+</span>
            </Link>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-semibold leading-4 text-white">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center justify-between gap-2">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={!unreadCount}
                onSelect={markAllAsRead}
                className="text-xs text-brand-700"
              >
                Mark all as read
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onSelect={() => markNotificationAsRead(notification)}
                className="items-start gap-3 whitespace-normal py-3"
              >
                <span
                  aria-label={notification.read ? 'Read' : 'Unread'}
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-brand-600'}`}
                />
                <span className="min-w-0">
                  <span className="block font-medium text-navy-900">{notification.title}</span>
                  <span className="mt-1 block text-xs text-slate-600">{notification.description}</span>
                  <span className="mt-1 block text-xs text-slate-500">{notification.time}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-navy-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`Open user menu for ${mockConsoleUser.name}`}
          >
            <CircleUserRound className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">{mockConsoleUser.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{mockConsoleUser.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings aria-hidden="true" />
                Profile &amp; Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support" className="flex items-center gap-2">
                <LifeBuoy aria-hidden="true" />
                Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onLogout} variant="destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}