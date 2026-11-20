export type AdFormat = 'Native' | 'Display' | 'Video' | 'All Formats'
export type PreviewMode = 'Desktop' | 'Mobile'
export type VariantKey = 'A' | 'B'
export type CallToAction = 'Learn More' | 'Shop Now' | 'Get Started' | 'Book Demo' | 'Claim Offer'

export type MediaAsset = {
  src: string
  name: string
  mimeType: string
  width: number | null
  height: number | null
  sample: boolean
  file?: File
}

export type Creative = {
  brand: string
  headline: string
  description: string
  cta: CallToAction | ''
  destinationUrl: string
  media: MediaAsset | null
}
