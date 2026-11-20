'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Switch } from '@/components/primitives/switch'
import { useToast } from '@/components/shared/Toast'
import { mockAdminPlatformSettings } from '@/data/admin'

const controls = [
  { key: 'websiteReviewRequired', label: 'Require website review', description: 'Keep new mock websites pending until they are reviewed.' },
  { key: 'campaignReviewRequired', label: 'Require campaign review', description: 'Keep new mock campaigns in the review queue.' },
  { key: 'advertiserRegistrationEnabled', label: 'Advertiser registration', description: 'Allow advertiser signup in the mock interface.' },
  { key: 'publisherRegistrationEnabled', label: 'Publisher registration', description: 'Allow publisher signup in the mock interface.' },
] as const

export default function AdminPlatformSettingsPage() {
  const [settings, setSettings] = useState(mockAdminPlatformSettings)
  const [saved, setSaved] = useState(false)
  const toast = useToast()

  function saveSettings() {
    // Platform configuration and permission enforcement must be persisted and enforced by a backend.
    setSaved(true)
    toast({ title: 'Mock settings saved', description: 'Changes are only held in this page state.', variant: 'success' })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Platform Settings' }]}
        title="Platform Settings"
        description="Preview non-production platform switches. No settings are sent to a service."
        action={<Button type="button" onClick={saveSettings}>Save settings</Button>}
      />
      <Card className="divide-y divide-border p-4">
        {controls.map((control) => (
          <div key={control.key} className="flex items-start justify-between gap-5 py-3 first:pt-0 last:pb-0">
            <div className="space-y-1">
              <label htmlFor={control.key} className="font-medium text-foreground">{control.label}</label>
              <p className="text-sm text-muted-foreground">{control.description}</p>
            </div>
            <Switch
              id={control.key}
              checked={settings[control.key]}
              onCheckedChange={(checked) => {
                setSettings((current) => ({ ...current, [control.key]: checked }))
                setSaved(false)
              }}
              aria-label={control.label}
            />
          </div>
        ))}
      </Card>
      <EmptyState title="No external integrations connected" description="This prototype has no payment, analytics, or delivery services configured." />
      <p className="text-sm text-muted-foreground">Saved settings are mock UI state only. Real platform rules, permissions, and persistence require backend enforcement.</p>
      {saved && <p role="status" className="text-sm text-foreground">Mock settings saved for this view.</p>}
    </div>
  )
}
