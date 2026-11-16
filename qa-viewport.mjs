import { chromium } from 'playwright'

const baseUrl = 'http://localhost:3000'
const routes = [
  '/',
  '/campaigns/new',
  '/campaigns/new/ai',
  '/campaigns/new/manual',
  '/campaigns/new/advanced',
  '/dashboard',
  '/campaigns',
  '/publisher',
]
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))

for (const width of [360, 1280]) {
  await page.setViewportSize({ width, height: 900 })
  for (const route of routes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(250)
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    }))
    console.log(`${width}px ${route} ${response?.status()} scroll=${dimensions.content}/${dimensions.viewport}`)
    if (!response?.ok()) errors.push(`${route} returned ${response?.status()}`)
    if (dimensions.content > dimensions.viewport + 1) errors.push(`${route} overflows at ${width}px`)
  }
}

await page.setViewportSize({ width: 360, height: 900 })
await page.goto(`${baseUrl}/campaigns/new/ai`, { waitUntil: 'domcontentloaded' })
await page.getByLabel('Your campaign details').fill('Get website visits in Pune')
await page.getByRole('button', { name: 'Send message' }).click()
await page.getByText(/What daily budget would you like to set/).waitFor()
await page.getByRole('button', { name: '₹500' }).click()
await page.getByLabel('Your campaign details').fill('headline: Try our Pune store')
await page.getByRole('button', { name: 'Send message' }).click()
await page.getByText(/What would you like the ad to say/).waitFor()
await page.getByLabel('Your campaign details').fill('text: Explore our new local collection')
await page.getByRole('button', { name: 'Send message' }).click()
await page.getByText(/What website link should the ad open/).waitFor()
await page.getByLabel('Your campaign details').fill('https://example.com')
await page.getByRole('button', { name: 'Send message' }).click()
await page.getByText(/Your draft is ready to review/).waitFor()
await page.getByRole('button', { name: 'Use this campaign' }).click()
await page.getByRole('heading', { name: 'Review your campaign' }).waitFor()
await page.getByRole('button', { name: 'Publish campaign' }).click()
await page.getByRole('button', { name: 'Confirm publish' }).click()
await page.getByRole('heading', { name: 'Your campaign is ready for review' }).waitFor()
console.log('AI-to-manual review and publish-confirmation flow passed at 360px')

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('No route, overflow, or browser runtime errors.')
}

await browser.close()
