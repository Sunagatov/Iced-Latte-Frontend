/**
 * @prod-smoke
 * Read-only smoke tests — no mocks, no mutations, safe against production.
 *
 * Usage:
 *   Against prod:   npm run test:e2e:prod-smoke
 *   Against local:  npm run test:e2e:local-real
 *
 * Requires the backend to be running.
 * Test credentials: olivia@example.com / p@ss1logic11
 */
import { test, expect } from '@playwright/test'
import { config } from 'dotenv'
import { IS_REAL } from './helpers/mockRoute'

config({ path: '.env.local' })

const EMAIL = process.env.E2E_EXISTING_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_EXISTING_PASSWORD ?? 'p@ss1logic11'

test('@real-only home page loads products', async ({ page }) => {
  if (!IS_REAL) { test.skip(true, 'real-only test')

    return }
  await page.goto('/')
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })
})

test.describe('unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('@real-only sign in and redirect to home', async ({ page }) => {
    if (!IS_REAL) { test.skip(true, 'real-only test')

      return }
    await page.goto('/signin?next=/')
    await page.fill('#email', EMAIL)
    await page.fill('#password', PASSWORD)
    await page.click('#login-btn')
    await expect(page).not.toHaveURL(/\/signin/, { timeout: 15000 })
  })
})

test('@real-only product detail page loads', async ({ page }) => {
  if (!IS_REAL) { test.skip(true, 'real-only test')

    return }
  await page.goto('/')
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })
  await page.locator('[data-testid="product-card"]').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
  await expect(page.locator('h1').first()).toBeVisible()
})

test('@real-only cart page accessible when not logged in', async ({ page }) => {
  if (!IS_REAL) { test.skip(true, 'real-only test')

    return }
  await page.goto('/cart')
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
})

test('@real-only favourites page accessible', async ({ page }) => {
  if (!IS_REAL) { test.skip(true, 'real-only test')

    return }
  await page.goto('/favourites')
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
})
