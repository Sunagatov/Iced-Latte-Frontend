import type { Page } from '@playwright/test'
import { IS_REAL } from './mockRoute'
import { config } from 'dotenv'

config({ path: '.env.local' })

const EMAIL = process.env.E2E_EXISTING_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_EXISTING_PASSWORD ?? 'p@ss1logic11'

// Track last successful auth time to avoid checking on every test
let lastAuthMs = 0
const TOKEN_TTL_MS = 12 * 60 * 1000 // re-auth if within 3 min of 15-min expiry

/**
 * Ensures the page has a valid auth session in real mode.
 * Re-logs in if the token is close to expiry or missing.
 * No-op in mocked mode.
 */
export async function ensureAuth(page: Page): Promise<void> {
  if (!IS_REAL) return

  // Pause between tests to avoid rate limiting
  await new Promise((r) => setTimeout(r, 1000))

  const now = Date.now()
  if (now - lastAuthMs < TOKEN_TTL_MS) return // token still fresh

  const res = await page.context().request.get('/api/proxy/users')
  if (res.status() === 200) {
    lastAuthMs = now
    return
  }

  // Token expired — re-login
  await page.goto('/signin?next=/')
  // If already logged in, signin redirects away immediately
  if (!page.url().includes('/signin')) {
    lastAuthMs = Date.now()
    return
  }
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('#login-btn')
  await page.waitForURL(/^(?!.*\/signin)/, { timeout: 15000 })
  lastAuthMs = Date.now()
}
