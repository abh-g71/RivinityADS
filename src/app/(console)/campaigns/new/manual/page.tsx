import { CampaignWizard } from '@/features/advertiser/CampaignWizard'

type ManualCampaignPageProps = {
  searchParams: Promise<{ template?: string; review?: string }>
}

export default async function ManualCampaignPage({ searchParams }: ManualCampaignPageProps) {
  const params = await searchParams
  return <CampaignWizard templateId={params.template ?? ''} startReview={params.review === 'true'} />
}
