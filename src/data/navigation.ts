export type NavItem = { id: string; label: string; href: string }
export type NavGroup = { title?: string; items: NavItem[] }
export type ConsoleRole = 'advertiser' | 'publisher' | 'admin'

export const advertiserNavGroups: NavGroup[] = [
  {
    items: [
      { id: 'dashboard', label: 'Home', href: '/dashboard' },
      { id: 'campaigns', label: 'Campaigns', href: '/campaigns' },
      { id: 'create-campaign', label: 'Create', href: '/campaigns/new' },
      { id: 'reports', label: 'Reports', href: '/reports' },
      { id: 'finance', label: 'Billing', href: '/finance' },
      { id: 'support', label: 'Help', href: '/support' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'traffic-chart', label: 'Traffic Chart', href: '/traffic-chart' },
      { id: 'conversion-tracking', label: 'Conversion Tracking', href: '/conversion-tracking' },
      { id: 'add-funds', label: 'Add Funds', href: '/add-funds' },
      { id: 'domains', label: 'Domains', href: '/domains' },
      { id: 'post-ad', label: 'Post Ad', href: '/post-ad' },
      { id: 'email-marketing', label: 'Email Marketing', href: '/email-marketing' },
      { id: 'notifications', label: 'Notifications', href: '/notifications' },
      { id: 'ad-tester', label: 'Ad Tester', href: '/ad-tester' },
      { id: 'system-health', label: 'System Health', href: '/system-health' },
      { id: 'settings', label: 'Settings', href: '/settings' },
    ],
  },
]

export const publisherNavGroups: NavGroup[] = [
  {
    items: [
      { id: 'publisher-dashboard', label: 'Dashboard', href: '/publisher' },
      { id: 'publisher-websites', label: 'Websites', href: '/publisher/websites' },
      { id: 'publisher-placements', label: 'Ad Placements', href: '/publisher/placements' },
      { id: 'publisher-earnings', label: 'Earnings', href: '/publisher/earnings' },
      { id: 'reports', label: 'Reports', href: '/reports' },
      { id: 'support', label: 'Help', href: '/support' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'publisher-statistics', label: 'Statistics', href: '/publisher/statistics' },
      { id: 'publisher-payments', label: 'Payments', href: '/publisher/payments' },
      { id: 'settings', label: 'Settings', href: '/settings' },
    ],
  },
]

export const adminNavGroups: NavGroup[] = [
  {
    items: [
      { id: 'admin-dashboard', label: 'Dashboard', href: '/admin' },
      { id: 'admin-users', label: 'Users', href: '/admin/users' },
      { id: 'admin-advertisers', label: 'Advertisers', href: '/admin/advertisers' },
      { id: 'admin-publishers', label: 'Publishers', href: '/admin/publishers' },
      { id: 'admin-websites', label: 'Websites', href: '/admin/websites' },
      { id: 'admin-campaigns', label: 'Campaign Review', href: '/admin/campaigns' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'admin-support', label: 'Support Tickets', href: '/admin/support' },
      { id: 'admin-settings', label: 'Platform Settings', href: '/admin/settings' },
      { id: 'admin-billing', label: 'Billing', href: '/admin/billing' },
      { id: 'reports', label: 'Reports', href: '/reports' },
    ],
  },
]

export const navGroups = advertiserNavGroups

// Role-based navigation is a UI convenience; real permissions must be enforced by the backend.
export function getNavGroups(role: ConsoleRole): NavGroup[] {
  if (role === 'publisher') return publisherNavGroups
  if (role === 'admin') return adminNavGroups
  return advertiserNavGroups
}
