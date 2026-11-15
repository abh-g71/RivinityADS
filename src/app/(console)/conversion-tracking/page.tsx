'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CodeBox } from '@/components/shared/CodeBox'

const mockEvents = ['event1', 'event2', 'event3']

export default function ConversionTrackingPage() {
  const [postbackUrl, setPostbackUrl] = useState('')

  function generatePostback() {
    setPostbackUrl('https://tracking.rivinityads.example/postback?click_id={click_id}&event={event}')
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header>
        <p className="text-sm font-medium text-brand-700">Advertiser workspace</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900">Conversion Tracking</h1>
        <p className="mt-2 text-sm text-slate-600">Mock tools only; this page does not collect or transmit conversion data.</p>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Postback URL</h2>
              <p className="mt-1 text-sm text-slate-600">Generate a placeholder URL for interface preview.</p>
            </div>
            <Button type="button" onClick={generatePostback}>Generate postback</Button>
          </div>
          {postbackUrl && (
            <div className="mt-5">
              <CodeBox title="Mock postback URL" code={postbackUrl} note="The .example address is reserved and does not receive events." />
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-navy-900">Optional multi-event tracking</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">A campaign may use up to 3 event labels in this mock interface. No events are configured or tracked.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {mockEvents.map((event) => <li key={event}><Badge tone="brand">{event}</Badge></li>)}
          </ul>
        </Card>
      </div>

      <Card className="mt-5 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-navy-900">Test conversion</h2>
          <p className="mt-1 text-sm text-slate-600">The demo does not send or validate a conversion.</p>
        </div>
        <Badge tone="warning">Waiting</Badge>
      </Card>
    </div>
  )
}
