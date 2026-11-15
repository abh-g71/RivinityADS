import { CreateCampaignForm } from '@/features/advertiser/CreateCampaignForm'

type NewCampaignPageProps = {
  searchParams: Promise<{ country?: string; adUnit?: string }>
}

export default async function NewCampaignPage({ searchParams }: NewCampaignPageProps) {
  const params = await searchParams
  return (
    <CreateCampaignForm
      initialCountry={params.country ?? ''}
      initialAdUnit={params.adUnit ?? ''}
    />
  )
}
