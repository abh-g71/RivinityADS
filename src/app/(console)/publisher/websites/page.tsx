'use client'

import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/shared/Toast'
import {
  createMockAdCode,
  mockVerificationCode,
  publisherAdFormats,
  publisherWebsiteCategories,
  type PublisherWebsite,
} from '@/data/publisher'
import { usePublisherData } from '@/components/shared/PublisherDataProvider'

const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i

export default function PublisherWebsitesPage() {
  const { websites, addWebsite, markWebsiteVerified } = usePublisherData()
  const [domain, setDomain] = useState('')
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [touched, setTouched] = useState({ domain: false, category: false })
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(
    websites.find((website) => website.status === 'Pending')?.id ?? '',
  )
  const [tipsVisible, setTipsVisible] = useState(true)
  const [activeCode, setActiveCode] = useState<{ key: string; code: string } | null>(null)
  const [copyMessages, setCopyMessages] = useState<Record<string, string>>({})
  const toast = useToast()

  const normalizedDomain = domain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '')
  const domainError = !normalizedDomain
    ? 'Enter a domain.'
    : !domainPattern.test(normalizedDomain)
      ? 'Enter a valid domain, such as example.com.'
      : websites.some((website) => website.domain === normalizedDomain.toLowerCase())
        ? 'This domain has already been added.'
        : undefined
  const categoryError = category ? undefined : 'Choose a category.'
  const selectedWebsite = websites.find((website) => website.id === selectedWebsiteId)
  const filteredWebsites = useMemo(
    () => websites.filter((website) => website.domain.toLowerCase().includes(query.trim().toLowerCase())),
    [query, websites],
  )

  function handleAddWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ domain: true, category: true })
    if (domainError || categoryError) return

    const newWebsite: PublisherWebsite = {
      id: `website-${Date.now()}`,
      domain: normalizedDomain.toLowerCase(),
      status: 'Pending',
      addedDate: new Date().toISOString().slice(0, 10),
      category,
    }
    addWebsite(newWebsite)
    setSelectedWebsiteId(newWebsite.id)
    setDomain('')
    setCategory('')
    setTouched({ domain: false, category: false })
    toast({ title: 'Mock website added', description: 'Ownership remains pending until you use the mock verification action.', variant: 'success' })
  }

  function verifySelectedWebsite() {
    if (!selectedWebsite) return
    if (selectedWebsite.status === 'Verified') {
      toast({ title: 'Website already verified', description: 'This is only a local prototype status.' })
      return
    }
    // Real website ownership verification and publisher permissions must be enforced by the backend.
    markWebsiteVerified(selectedWebsite.id)
    toast({ title: 'Mock verification complete', description: 'No website was contacted or checked.', variant: 'success' })
  }

  async function copyAdCode(key: string, code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopyMessages((current) => ({ ...current, [key]: 'Copied to clipboard.' }))
      toast({ title: 'Mock ad code copied', description: 'The reserved .example code does not serve ads.', variant: 'success' })
    } catch (error) {
      console.error('Unable to copy mock ad code', error)
      setCopyMessages((current) => ({ ...current, [key]: 'Clipboard unavailable. Select and copy the code manually.' }))
      toast({ title: 'Could not copy ad code', description: 'Select and copy the displayed code manually.', variant: 'error' })
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        breadcrumbs={[{ label: 'Publisher', href: '/publisher' }, { label: 'Websites' }]}
        title="Websites"
        description="Add a site and preview mock ownership verification and ad unit code."
        action={<Link href="#add-website" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Add website</Link>}
      />

      {tipsVisible && (
        <Card className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-foreground">Three steps to prepare a site</h2>
              <ol className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <li><span className="mr-2 font-semibold text-foreground">1.</span>Add and categorize your website.</li>
                <li><span className="mr-2 font-semibold text-foreground">2.</span>Complete the mock ownership check.</li>
                <li><span className="mr-2 font-semibold text-foreground">3.</span>Create placements and copy code.</li>
              </ol>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="shrink-0 px-2 py-1"
              onClick={() => {
                setTipsVisible(false)
                toast({ title: 'Setup tips dismissed' })
              }}
              aria-label="Dismiss setup tips"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      <section aria-label="Your websites" className="space-y-4">
        <Input
          id="website-search"
          label="Search websites"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by domain"
        />
        {filteredWebsites.length ? filteredWebsites.map((website) => (
          <Card key={website.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="break-all font-semibold text-foreground">{website.domain}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{website.category} · Added {website.addedDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={website.status === 'Verified' ? 'success' : 'warning'}>{website.status}</Badge>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedWebsiteId(website.id)}
                  aria-label={`Select ${website.domain} for verification`}
                >
                  {website.status === 'Verified' ? 'View verification' : 'Verify ownership'}
                </Button>
              </div>
            </div>
            <details className="mt-5 rounded-lg border border-border p-4">
              <summary className="cursor-pointer font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Ad units for {website.domain}
              </summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {publisherAdFormats.map((format) => {
                  const key = `${website.id}-${format}`
                  const code = createMockAdCode(key)
                  const codeIsActive = activeCode?.key === key
                  return (
                    <section key={format} className="min-w-0 rounded-lg bg-secondary p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-medium text-foreground">{format}</h3>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-2"
                            onClick={() => {
                              setActiveCode({ key, code })
                              toast({ title: 'Mock ad code ready', description: 'This code uses a reserved .example endpoint.' })
                            }}
                          >
                            Get code
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-2"
                            disabled={!codeIsActive}
                            onClick={() => copyAdCode(key, code)}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      {codeIsActive && (
                        <div className="mt-3">
                          <pre className="overflow-x-auto rounded-lg bg-dark-card p-3 text-sm text-white"><code>{activeCode.code}</code></pre>
                          {copyMessages[key] && <p role="status" className="mt-2 text-sm text-muted-foreground">{copyMessages[key]}</p>}
                          <p className="mt-2 text-sm text-muted-foreground">Preview only; no ads are delivered.</p>
                        </div>
                      )}
                    </section>
                  )
                })}
              </div>
            </details>
          </Card>
        )) : (
          <EmptyState
            title={websites.length ? 'No matching websites' : 'No websites yet'}
            description={websites.length ? 'Try another domain search.' : 'Add a website to begin the mock publisher setup.'}
          />
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card id="add-website" className="min-w-0 p-4">
          <h2 className="text-lg font-semibold text-foreground">Add a website</h2>
          <form className="mt-4 space-y-4" onSubmit={handleAddWebsite} noValidate>
            <Input
              id="publisher-domain"
              label="Domain"
              name="domain"
              placeholder="example.com"
              autoComplete="url"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, domain: true }))}
              error={touched.domain ? domainError : undefined}
            />
            <Select
              id="publisher-category"
              label="Category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, category: true }))}
              error={touched.category ? categoryError : undefined}
              options={[
                { value: '', label: 'Choose a category' },
                ...publisherWebsiteCategories.map((option) => ({ value: option, label: option })),
              ]}
            />
            <Button type="submit">Add website</Button>
          </form>
        </Card>

        <Card id="verify-website" className="min-w-0 p-4">
          <h2 className="text-lg font-semibold text-foreground">Verify ownership</h2>
          {selectedWebsite ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Add this mock verification tag to <span className="font-medium text-foreground">{selectedWebsite.domain}</span>:
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-dark-card p-4 text-sm text-white">
                <code>{mockVerificationCode}</code>
              </pre>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="button" onClick={verifySelectedWebsite} disabled={selectedWebsite.status === 'Verified'}>
                  {selectedWebsite.status === 'Verified' ? 'Verified' : 'Verify'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {selectedWebsite.status === 'Verified' ? 'Mock verification complete.' : 'Demo only; no site check is performed.'}
                </p>
              </div>
            </>
          ) : (
            <EmptyState title="No website selected" description="Add a website or select one above to preview its verification instructions." />
          )}
        </Card>
      </div>
    </div>
  )
}
