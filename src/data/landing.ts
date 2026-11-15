// Mock examples for the public-site pricing illustration; these are not live plans.
export const demoPricingPlans = [
  {
    name: 'Starter',
    monthly: 0,
    description: 'Explore the campaign workspace',
    features: ['Campaign setup preview', 'Sample reporting views', 'No payment required'],
    action: 'Create a demo account',
    featured: false,
  },
  {
    name: 'Growth',
    monthly: 1499,
    description: 'An illustrative plan for growing teams',
    features: ['Campaign organization', 'Audience planning tools', 'Example performance reports'],
    action: 'Explore the demo',
    featured: true,
  },
  {
    name: 'Custom',
    monthly: null,
    description: 'A sample option for larger teams',
    features: ['Flexible campaign workflows', 'Workspace controls', 'Contact-ready setup'],
    action: 'Create a demo account',
    featured: false,
  },
] as const
