/**
 * Global setup — runs once before all tests.
 * In real mode (BASE_URL set): logs in and saves auth state to a file.
 * In mocked mode: no-op.
 */
import { chromium } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.local' })

const BASE_URL = process.env.BASE_URL
const EMAIL = process.env.E2E_EXISTING_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_EXISTING_PASSWORD ?? 'p@ss1logic11'

export default async function globalSetup() {
  if (!BASE_URL) return // mocked mode — no login needed

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${BASE_URL}/signin?next=/`)
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('#login-btn')
  await page.waitForURL(/^(?!.*\/signin)/, { timeout: 15000 })

  // Save cookies so all tests start authenticated
  await page.context().storageState({ path: 'e2e/.auth.json' })
  await browser.close()
}
