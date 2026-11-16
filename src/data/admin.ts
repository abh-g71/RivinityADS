export type AdminRole = 'Advertiser' | 'Publisher' | 'Admin'
export type AdminUserStatus = 'Active' | 'Suspended'
export type AdminWebsiteStatus = 'Pending' | 'Approved' | 'Rejected'
export type AdminCampaignStatus = 'Pending' | 'Approved' | 'Rejected'
export type AdminTicketStatus = 'Open' | 'In progress' | 'Resolved'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  status: AdminUserStatus
}

export type AdminWebsite = {
  id: string
  domain: string
  owner: string
  category: string
  status: AdminWebsiteStatus
  submittedAt: string
}

export type AdminCampaignReview = {
  id: string
  name: string
  advertiser: string
  objective: string
  budget: string
  status: AdminCampaignStatus
}

export type AdminTicketMessage = {
  author: string
  body: string
  createdAt: string
}

export type AdminSupportTicket = {
  id: string
  subject: string
  requester: string
  status: AdminTicketStatus
  messages: AdminTicketMessage[]
}

export type AdminBillingRow = {
  id: string
  date: string
  account: string
  type: string
  amount: string
  status: string
}

export type AdminActivity = {
  id: string
  description: string
  date: string
}

// These anonymized fixtures exist only to preview admin workflows. They are not platform users, requests, metrics, or billing records.
export const mockAdminUsers: AdminUser[] = [
  { id: 'mock-user-advertiser', name: 'Demo Advertiser', email: 'advertiser@example.invalid', role: 'Advertiser', status: 'Active' },
  { id: 'mock-user-publisher', name: 'Demo Publisher', email: 'publisher@example.invalid', role: 'Publisher', status: 'Active' },
]

export const mockAdminWebsites: AdminWebsite[] = [
  { id: 'mock-website-review', domain: 'publisher.example.invalid', owner: 'Demo Publisher', category: 'Other', status: 'Pending', submittedAt: 'Mock sample' },
]

export const mockAdminCampaignReviews: AdminCampaignReview[] = [
  { id: 'mock-campaign-review', name: 'Demo campaign', advertiser: 'Demo Advertiser', objective: 'Traffic', budget: 'Not provided', status: 'Pending' },
]

export const mockAdminSupportTickets: AdminSupportTicket[] = [
  {
    id: 'mock-ticket-001',
    subject: 'Demo support request',
    requester: 'Demo Publisher',
    status: 'Open',
    messages: [{ author: 'Demo Publisher', body: 'This is a placeholder ticket for the admin interface preview.', createdAt: 'Mock sample' }],
  },
]

export const mockAdminBillingRows: AdminBillingRow[] = []
export const mockAdminActivity: AdminActivity[] = [
  { id: 'mock-activity-website', description: 'Demo website submitted for review', date: 'Mock sample' },
  { id: 'mock-activity-campaign', description: 'Demo campaign added to the review queue', date: 'Mock sample' },
  { id: 'mock-activity-ticket', description: 'Demo support ticket opened', date: 'Mock sample' },
]

export const mockAdminPlatformSettings = {
  websiteReviewRequired: true,
  campaignReviewRequired: true,
  advertiserRegistrationEnabled: true,
  publisherRegistrationEnabled: true,
}
