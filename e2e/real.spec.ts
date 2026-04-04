/**
 * @real
 * Real E2E tests — no mocks, runs against a live backend.
 *
 * Usage:
 *   Against prod:   npm run test:e2e:prod
 *   Against local:  npm run test:e2e:local-real
 *
 * Requires the backend to be running and seeded.
 * Test credentials: olivia@example.com / p@ss1logic11
 */
import { test, expect } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.local' })

const EMAIL = process.env.E2E_EXISTING_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_EXISTING_PASSWORD ?? 'p@ss1logic11'

test('@real-only home page loads products', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })
})

test('@real-only sign in and redirect to home', async ({ page }) => {
  await page.goto('/signin?next=/')
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('#login-btn')
  await expect(page).not.toHaveURL(/\/signin/, { timeout: 15000 })
})

test('@real-only product detail page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 })
  await page.locator('[data-testid="product-card"]').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
  await expect(page.locator('h1').first()).toBeVisible()
})

test('@real-only cart page accessible when not logged in', async ({ page }) => {
  await page.goto('/cart')
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
})

test('@real-only favourites page accessible', async ({ page }) => {
  await page.goto('/favourites')
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
})
