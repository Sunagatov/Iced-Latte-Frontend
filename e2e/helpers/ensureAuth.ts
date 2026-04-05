import type { Page } from '@playwright/test'
import { IS_REAL } from './mockRoute'
import { config } from 'dotenv'

config({ path: '.env.local' })

const EMAIL = process.env.E2E_EXISTING_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_EXISTING_PASSWORD ?? 'p@ss1logic11'

/**
 * Ensures the page has a valid auth session in real mode.
 * Re-logs in if the session is missing or expired (401 on /api/proxy/users).
 * No-op in mocked mode.
 */
export async function ensureAuth(page: Page): Promise<void> {
  if (!IS_REAL) return

  const res = await page.context().request.get('/api/proxy/users')
  if (res.status() === 200) return

  // Token expired or missing — re-login
  await page.goto('/signin?next=/')
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('#login-btn')
  await page.waitForURL(/^(?!.*\/signin)/, { timeout: 15000 })
}
