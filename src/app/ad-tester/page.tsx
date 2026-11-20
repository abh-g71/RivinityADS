import { AdTesterWorkspace } from '@/components/AdTester/AdTesterWorkspace'
import { ConsoleLayout } from '@/layout/ConsoleLayout'

export const metadata = {
  title: 'Ad Tester | RivinityADS',
  description: 'Preview creative across simulated ad placements.',
}

export default function AdTesterPage() {
  return <ConsoleLayout><AdTesterWorkspace /></ConsoleLayout>
}
