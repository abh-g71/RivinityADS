// Mock-only console shell content. No balance, user, or notification data is connected to a backend.
export const mockConsoleUser = {
  name: 'Abhi',
  initials: 'A',
}

export const mockConsoleEmail = 'abhi@example.invalid'
export const mockApiKey = 'rva_demo_local-preview-key'
export const mockSettingsStorageKeys = {
  profile: 'rivinityads.settings-profile.v1',
  notifications: 'rivinityads.settings-notifications.v1',
  apiKey: 'rivinityads.settings-api-key.v1',
} as const
export const mockNotificationPreferences = {
  security: true,
  product: false,
  account: true,
}

// Generated values are deliberately fake and must never be accepted as credentials.
export function createMockApiKey() {
  return `rva_demo_${Math.random().toString(36).slice(2, 14).padEnd(12, '0')}`
}

export const mockAdvertiserBalance = 0

export type ConsoleNotification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

export const mockConsoleNotifications: ConsoleNotification[] = [
  {
    id: 'campaign-review',
    title: 'Campaign review',
    description: 'A sample campaign has an updated mock review status.',
    time: 'Today',
    read: false,
  },
  {
    id: 'website-verification',
    title: 'Website verification',
    description: 'Review the sample ownership checklist for your website.',
    time: 'Earlier',
    read: false,
  },
]
