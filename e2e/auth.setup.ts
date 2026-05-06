/**
 * Auth setup project — runs once before dependent projects.
 * Logs in via the UI and saves storageState for reuse.
 *
 * Credentials come from env vars (E2E_EMAIL / E2E_PASSWORD)
 * or fall back to the default test account.
 */
import { test as setup, expect } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.local' })

const AUTH_FILE = 'e2e/.auth/user.json'
const EMAIL = process.env.E2E_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_PASSWORD ?? 'p@ss1logic11'

setup('authenticate', async ({ page }) => {
  await page.goto('/signin')

  await page.getByLabel('Enter your email address').fill(EMAIL)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Login' }).click()

  // Wait until redirected away from signin
  await expect(page).not.toHaveURL(/\/signin/, { timeout: 15_000 })

  await page.context().storageState({ path: AUTH_FILE })
})
