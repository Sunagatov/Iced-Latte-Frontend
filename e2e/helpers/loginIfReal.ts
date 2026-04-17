import type { Page } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.local' })

const EMAIL = process.env.E2E_EXISTING_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_EXISTING_PASSWORD ?? 'p@ss1logic11'

/**
 * Logs in via the real sign-in form and waits for redirect.
 * No-op in mocked mode (IS_REAL=false) since mocks handle auth.
 */
export async function loginIfReal(page: Page): Promise<void> {
  const { IS_REAL } = await import('./mockRoute')

  if (!IS_REAL) return

  await page.goto('/signin?next=/')
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('#login-btn')
  await page.waitForURL(/^(?!.*\/signin)/, { timeout: 15000 })
}
