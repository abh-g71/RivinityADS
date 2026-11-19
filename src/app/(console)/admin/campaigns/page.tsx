'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/primitives/dialog'
import { Textarea } from '@/components/primitives/textarea'
import { Label } from '@/components/primitives/label'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/shared/Toast'
import { mockAdminCampaignReviews, type AdminCampaignReview, type AdminCampaignStatus } from '@/data/admin'

type PendingDecision = { campaignId: string; status: Exclude<AdminCampaignStatus, 'Pending'> } | null

export default function AdminCampaignReviewPage() {
  const [campaigns, setCampaigns] = useState(mockAdminCampaignReviews)
  const [query, setQuery] = useState('')
  const [decision, setDecision] = useState<PendingDecision>(null)
  const [reason, setReason] = useState('')
  const [reasonTouched, setReasonTouched] = useState(false)
  const toast = useToast()
  const rows = useMemo(
    () => campaigns.filter((campaign) => `${campaign.name} ${campaign.advertiser}`.toLowerCase().includes(query.trim().toLowerCase())),
    [campaigns, query],
  )

  const reasonError = reason.trim() ? '' : 'Enter a reason for rejection.'

  function openDecision(campaign: AdminCampaignReview, status: Exclude<AdminCampaignStatus, 'Pending'>) {
    setDecision({ campaignId: campaign.id, status })
    setReason('')
    setReasonTouched(false)
  }

  function confirmDecision() {
    if (!decision) return
    if (decision.status === 'Rejected' && reasonError) {
      setReasonTouched(true)
      return
    }
    // Campaign review permissions and delivery eligibility must be enforced by the backend in production.
    setCampaigns((current) => current.map((campaign) => campaign.id === decision.campaignId
      ? { ...campaign, status: decision.status }
      : campaign))
    toast({
      title: `Mock campaign ${decision.status.toLowerCase()}`,
      description: reason.trim() || 'No decision reason was entered.',
      variant: 'success',
    })
    setDecision(null)
  }

  const columns: DataTableColumn<AdminCampaignReview>[] = [
    { key: 'name', header: 'Campaign', render: (campaign) => <span className="font-medium text-foreground">{campaign.name}</span> },
    { key: 'advertiser', header: 'Advertiser', render: (campaign) => campaign.advertiser },
    { key: 'objective', header: 'Objective', render: (campaign) => campaign.objective },
    { key: 'budget', header: 'Budget', render: (campaign) => campaign.budget },
    { key: 'status', header: 'Status', render: (campaign) => <Badge tone={campaign.status === 'Approved' ? 'success' : campaign.status === 'Rejected' ? 'danger' : 'warning'}>{campaign.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (campaign) => (
        <div className="flex gap-2">
          <Button type="button" className="px-3 py-2" disabled={campaign.status !== 'Pending'} onClick={() => openDecision(campaign, 'Approved')}>Approve</Button>
          <Button type="button" variant="outline" className="px-3 py-2" disabled={campaign.status !== 'Pending'} onClick={() => openDecision(campaign, 'Rejected')}>Reject</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Campaign Review' }]}
        title="Campaign Review"
        description="Review mock campaigns and record an approval or rejection reason."
        action={<Link href="/admin/websites" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Review websites</Link>}
      />
      <div className="mt-6 max-w-md">
        <Input id="campaign-review-search" label="Search campaigns" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaign or advertiser" />
      </div>
      <section aria-label="Campaign review queue" className="mt-5">
        {rows.length
          ? <DataTable label="Campaign review queue" columns={columns} rows={rows} />
          : <EmptyState title="No campaigns in this view" description="No mock campaigns match this search." />}
      </section>

      <Dialog
        open={Boolean(decision)}
        onOpenChange={(open) => {
          if (!open) setDecision(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decision?.status === 'Approved' ? 'Approve campaign?' : 'Reject campaign?'}</DialogTitle>
            <DialogDescription>
              This records a mock review decision only. No campaign is activated or sent to an ad platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="decision-reason">Reason {decision?.status === 'Rejected' ? '(required)' : '(optional)'}</Label>
            <Textarea
              id="decision-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              onBlur={() => setReasonTouched(true)}
              aria-invalid={Boolean(reasonTouched && decision?.status === 'Rejected' && reasonError)}
              aria-describedby={reasonTouched && decision?.status === 'Rejected' && reasonError ? 'decision-reason-error' : undefined}
              placeholder="Add a review note"
              rows={3}
            />
            {reasonTouched && decision?.status === 'Rejected' && reasonError && (
              <p id="decision-reason-error" role="alert" className="text-sm text-red-700">{reasonError}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDecision(null)}>Cancel</Button>
            <Button type="button" onClick={confirmDecision}>
              {decision?.status === 'Approved' ? 'Confirm approval' : 'Confirm rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
