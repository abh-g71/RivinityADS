export type NavItem = { id: string; label: string; href: string }
export type NavGroup = { title?: string; items: NavItem[] }
export type ConsoleRole = 'advertiser' | 'publisher' | 'admin'

export const advertiserNavGroups: NavGroup[] = [
  {
    items: [{ id: 'dashboard', label: 'Home', href: '/dashboard' }],
  },
  {
    title: 'Campaigns',
    items: [
      { id: 'campaigns', label: 'All campaigns', href: '/campaigns' },
      { id: 'create-campaign', label: 'Create campaign', href: '/campaigns/new' },
      { id: 'post-ad', label: 'Post Ad', href: '/post-ad' },
      { id: 'ad-tester', label: 'Ad Tester', href: '/ad-tester' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { id: 'reports', label: 'Reports', href: '/reports' },
      { id: 'traffic-chart', label: 'Traffic Chart', href: '/traffic-chart' },
      { id: 'conversion-tracking', label: 'Conversion Tracking', href: '/conversion-tracking' },
    ],
  },
  {
    title: 'Money',
    items: [
      { id: 'finance', label: 'Billing', href: '/finance' },
      { id: 'add-funds', label: 'Add Funds', href: '/add-funds' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'domains', label: 'Domains', href: '/domains' },
      { id: 'email-marketing', label: 'Email Marketing', href: '/email-marketing' },
      { id: 'notifications', label: 'Notifications', href: '/notifications' },
      { id: 'system-health', label: 'System Health', href: '/system-health' },
      { id: 'settings', label: 'Settings', href: '/settings' },
      { id: 'support', label: 'Support', href: '/support' },
    ],
  },
]

export const publisherNavGroups: NavGroup[] = [
  {
    items: [{ id: 'publisher-dashboard', label: 'Dashboard', href: '/publisher' }],
  },
  {
    title: 'Inventory',
    items: [
      { id: 'publisher-websites', label: 'Websites', href: '/publisher/websites' },
      { id: 'publisher-placements', label: 'Ad Placements', href: '/publisher/placements' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { id: 'publisher-statistics', label: 'Statistics', href: '/publisher/statistics' },
      { id: 'publisher-earnings', label: 'Earnings', href: '/publisher/earnings' },
      { id: 'reports', label: 'Reports', href: '/reports' },
    ],
  },
  {
    title: 'Money',
    items: [{ id: 'publisher-payments', label: 'Payments', href: '/publisher/payments' }],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings', href: '/settings' },
      { id: 'support', label: 'Support', href: '/support' },
    ],
  },
]

export const adminNavGroups: NavGroup[] = [
  {
    items: [{ id: 'admin-dashboard', label: 'Dashboard', href: '/admin' }],
  },
  {
    title: 'People',
    items: [
      { id: 'admin-users', label: 'Users', href: '/admin/users' },
      { id: 'admin-advertisers', label: 'Advertisers', href: '/admin/advertisers' },
      { id: 'admin-publishers', label: 'Publishers', href: '/admin/publishers' },
    ],
  },
  {
    title: 'Review',
    items: [
      { id: 'admin-websites', label: 'Websites', href: '/admin/websites' },
      { id: 'admin-campaigns', label: 'Campaign Review', href: '/admin/campaigns' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'admin-support', label: 'Support Tickets', href: '/admin/support' },
      { id: 'admin-billing', label: 'Billing', href: '/admin/billing' },
      { id: 'reports', label: 'Reports', href: '/reports' },
      { id: 'admin-settings', label: 'Platform Settings', href: '/admin/settings' },
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