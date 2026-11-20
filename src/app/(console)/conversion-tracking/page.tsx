'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CodeBox } from '@/components/shared/CodeBox'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useToast } from '@/components/shared/Toast'
import { mockConversionEvents, mockPostbackTemplate } from '@/data/advertiser'

export default function ConversionTrackingPage() {
  const [postbackUrl, setPostbackUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [testResult, setTestResult] = useState('')
  const toast = useToast()

  function generatePostback() {
    setPostbackUrl(mockPostbackTemplate)
    setTestResult('')
    toast({ title: 'Mock postback generated', description: 'This reserved .example URL is not connected to a tracking service.', variant: 'success' })
  }

  function runMockTest() {
    // Any real event validation or ingestion must be authorized and enforced by a backend.
    setTestResult(`Local preview complete with ${selectedEvents.length} placeholder event label(s). No request was sent and no conversion was recorded.`)
    toast({ title: 'Mock test complete', description: 'No network request or conversion tracking occurred.' })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Advertiser' }, { label: 'Conversion Tracking' }]}
        title="Conversion Tracking"
        description="Mock tools only; this page does not collect or transmit conversion data."
        action={<Button type="button" onClick={generatePostback}>Generate postback</Button>}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Card className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Postback URL</h2>
              <p className="mt-1 text-sm text-muted-foreground">Generate a placeholder URL for interface preview.</p>
            </div>
          </div>
          {postbackUrl && (
            <div className="mt-5">
              <CodeBox title="Mock postback URL" code={postbackUrl} note="The .example address is reserved and does not receive events." />
            </div>
          )}
          {!postbackUrl && <div className="mt-5"><EmptyState title="No postback URL generated" description="Generate a placeholder URL to preview its format. It will not receive events." /></div>}
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold text-foreground">Optional multi-event tracking</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Select placeholder event labels for the interface preview. They have no configured meaning and are not tracked.</p>
          <fieldset className="mt-4 space-y-3">
            <legend className="sr-only">Mock conversion events</legend>
            {mockConversionEvents.map((event) => (
              <label key={event} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm text-foreground focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event)}
                  onChange={() => {
                    setSelectedEvents((current) => current.includes(event) ? current.filter((value) => value !== event) : [...current, event])
                    setTestResult('')
                  }}
                  className="h-4 w-4 accent-primary"
                />
                <span className="flex-1">{event}</span>
                <Badge tone="brand">Mock label</Badge>
              </label>
            ))}
          </fieldset>
          <p className="mt-3 text-sm text-muted-foreground">{selectedEvents.length} placeholder event label{selectedEvents.length === 1 ? '' : 's'} selected.</p>
        </Card>
      </div>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Test conversion</h2>
          <p className="mt-1 text-sm text-muted-foreground">The local preview does not send or validate a conversion.</p>
          {testResult && <p role="status" className="mt-3 text-sm text-foreground">{testResult}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={testResult ? 'brand' : 'warning'}>{testResult ? 'Preview complete' : 'Waiting'}</Badge>
          <Button type="button" variant="outline" disabled={!postbackUrl} onClick={runMockTest}>Run mock test</Button>
        </div>
      </Card>
    </div>
  )
}
