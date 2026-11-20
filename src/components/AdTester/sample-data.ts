import type { Creative } from './types'

export const sampleCreatives: { name: string; creative: Creative }[] = [
  {
    name: 'Nila Botanics · Summer Face Serum',
    creative: {
      brand: 'Nila Botanics',
      headline: 'A brighter routine, made simple',
      description: 'Meet a lightweight vitamin C serum made for warm, everyday skin care.',
      cta: 'Shop Now',
      destinationUrl: 'https://nilabotanics.example/products/brightening-serum',
      media: { src: '', name: 'Nila Botanics geometric sample', mimeType: 'image/sample', width: 1200, height: 628, sample: true },
    },
  },
  {
    name: 'LedgerLeaf · Invoicing for teams',
    creative: {
      brand: 'LedgerLeaf',
      headline: 'Get every invoice out on time',
      description: 'Create, send, and track GST-ready invoices from one simple workspace.',
      cta: 'Get Started',
      destinationUrl: 'https://ledgerleaf.example/invoicing',
      media: { src: '', name: 'LedgerLeaf geometric sample', mimeType: 'image/sample', width: 1200, height: 628, sample: true },
    },
  },
]

export const ctaOptions = ['Learn More', 'Shop Now', 'Get Started', 'Book Demo', 'Claim Offer'] as const
