import type { ConsoleRole } from '@/data/navigation'

export type SupportTicketStatus = 'Open' | 'In progress' | 'Resolved'

export type LocalSupportTicket = {
  id: string
  role: Exclude<ConsoleRole, 'admin'>
  subject: string
  category: string
  message: string
  status: SupportTicketStatus
  createdAt: string
}

// Ticket categories and browser-only storage support a mock UI; no request is sent to a support service.
export const mockSupportTicketStorageKey = 'rivinityads.support-tickets.v1'
export const mockSupportCategories: Record<Exclude<ConsoleRole, 'admin'>, readonly string[]> = {
  advertiser: ['Campaign setup', 'Billing question', 'Account access', 'Other'],
  publisher: ['Website verification', 'Ad placement', 'Payout question', 'Other'],
}
