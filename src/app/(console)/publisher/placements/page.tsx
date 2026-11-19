'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/shared/Toast'
import Link from 'next/link'
import {
  createMockAdCode,
  publisherAdFormats,
  type PublisherPlacement,
} from '@/data/publisher'
import { usePublisherData } from '@/components/shared/PublisherDataProvider'

export default function PublisherPlacementsPage() {
  const { websites, placements, addPlacement } = usePublisherData()
  const [website, setWebsite] = useState('')
  const [format, setFormat] = useState('')
  const [name, setName] = useState('')
  const [touched, setTouched] = useState({ website: false, format: false, name: false })
  const [adCode, setAdCode] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const toast = useToast()

  const websiteError = website ? undefined : 'Choose a website.'
  const formatError = format ? undefined : 'Choose an ad format.'
  const nameError = name.trim() ? undefined : 'Enter a placement name.'

  function createPlacement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ website: true, format: true, name: true })
    if (websiteError || formatError || nameError) return

    const placementId = `rivinity-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    const newPlacement: PublisherPlacement = {
      id: placementId,
      name: name.trim(),
      website,
      format,
      status: 'Draft',
    }
    addPlacement(newPlacement)
    setAdCode(createMockAdCode(placementId))
    setCopyMessage('')
    toast({ title: 'Mock placement created', description: 'No ad delivery is connected to this placement.', variant: 'success' })
  }

  async function copyAdCode() {
    try {
      await navigator.clipboard.writeText(adCode)
      setCopyMessage('Copied to clipboard.')
      toast({ title: 'Mock ad code copied', description: 'The reserved .example endpoint does not serve ads.', variant: 'success' })
    } catch (error) {
      console.error('Unable to copy mock placement code', error)
      setCopyMessage('Could not access the clipboard. Select and copy the code manually.')
      toast({ title: 'Could not copy ad code', description: 'Select and copy the displayed code manually.', variant: 'error' })
    }
  }

  const columns: DataTableColumn<PublisherPlacement>[] = [
    { key: 'name', header: 'Placement', render: (placement) => <span className="font-medium text-foreground">{placement.name}</span> },
    { key: 'website', header: 'Website', render: (placement) => placement.website },
    { key: 'format', header: 'Format', render: (placement) => placement.format },
    { key: 'status', header: 'Status', render: (placement) => placement.status },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Publisher', href: '/publisher' }, { label: 'Ad Placements' }]}
        title="Ad Placements"
        description="Create a mock placement and preview a placeholder ad snippet."
        action={<Link href="#create-placement" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Create placement</Link>}
      />

      <Card id="create-placement" className="mt-6 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Create placement</h2>
        <form className="mt-5 grid gap-5 lg:grid-cols-2" onSubmit={createPlacement} noValidate>
          <Select
              id="placement-website"
              label="Website"
              name="website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, website: true }))}
              error={touched.website ? websiteError : undefined}
              options={[
                { value: '', label: 'Choose a website' },
                ...websites.map((site) => ({ value: site.domain, label: site.domain })),
              ]}
            />

          <Input
            id="placement-name"
            label="Placement name"
            name="placementName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, name: true }))}
            error={touched.name ? nameError : undefined}
          />

          <fieldset className="lg:col-span-2">
            <legend className="mb-2 text-sm font-medium text-foreground">Ad format</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {publisherAdFormats.map((option) => (
                <label key={option} className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="placement-format"
                    value={option}
                    checked={format === option}
                    onChange={() => setFormat(option)}
                    onBlur={() => setTouched((current) => ({ ...current, format: true }))}
                    aria-describedby={touched.format && formatError ? 'placement-format-error' : undefined}
                  />
                  <Card className={`p-4 text-center text-sm font-medium text-foreground transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${
                    format === option ? 'border-primary bg-secondary text-foreground ring-1 ring-ring' : 'hover:border-accent'
                  }`}>
                    {option}
                  </Card>
                </label>
              ))}
            </div>
            {touched.format && formatError && <p id="placement-format-error" className="mt-1.5 text-xs text-danger-600" role="alert">{formatError}</p>}
          </fieldset>

          <Button type="submit" className="lg:col-span-2 lg:w-fit">Create placement</Button>
        </form>
      </Card>

      {adCode && (
        <Card className="mt-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Ad code</h2>
              <p className="mt-1 text-sm text-muted-foreground">Mock snippet only; the reserved .example endpoint does not serve ads.</p>
            </div>
            <Button type="button" variant="outline" onClick={copyAdCode}>Copy</Button>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-dark-card p-4 text-xs text-white">
            <code>{adCode}</code>
          </pre>
          {copyMessage && <p className="mt-2 text-sm text-muted-foreground" role="status">{copyMessage}</p>}
        </Card>
      )}

      <section aria-labelledby="existing-placements" className="mt-8">
        <h2 id="existing-placements" className="mb-4 text-lg font-semibold text-foreground">Existing placements</h2>
        {placements.length > 0 ? (
          <DataTable label="Ad placements" columns={columns} rows={placements} />
        ) : (
          <EmptyState title="No placements yet" description="Create a placement to see it listed here." />
        )}
      </section>
    </div>
  )
}
