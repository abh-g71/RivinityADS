import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'

const placeholderSlugs = new Set([
  'domains',
  'email-marketing',
  'notifications',
  'ad-tester',
  'system-health',
])

export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!placeholderSlugs.has(slug)) notFound()
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card className="mt-6 p-8 text-center text-slate-500">This page will be built later.</Card>
    </div>
  )
}