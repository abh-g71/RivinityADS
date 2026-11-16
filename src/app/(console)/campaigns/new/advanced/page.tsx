import { CreateCampaignForm } from '@/features/advertiser/CreateCampaignForm'

type AdvancedCampaignPageProps = {
  searchParams: Promise<{ country?: string; adUnit?: string }>
}

export default async function AdvancedCampaignPage({ searchParams }: AdvancedCampaignPageProps) {
  const params = await searchParams
  return (
    <CreateCampaignForm
      initialCountry={params.country ?? ''}
      initialAdUnit={params.adUnit ?? ''}
    />
  )
}
