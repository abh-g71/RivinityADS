'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, CircleUserRound, LifeBuoy, Menu, Settings } from 'lucide-react'
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
import type { ConsoleRole } from '@/data/navigation'

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
  const toast = useToast()
  const unreadCount = notifications.filter((notification) => !notification.read).length
  const balance = currency.format(mockAdvertiserBalance)

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
      <p className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm font-semibold text-navy-900">
        {role === 'publisher' ? 'Publisher Console' : role === 'admin' ? 'Admin Console' : 'Advertiser Console'}
      </p>

      <div className="flex w-full min-w-0 items-center justify-between gap-2 md:w-auto md:shrink-0 md:justify-start md:gap-1 lg:gap-3">
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
