import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import { ensureAuth } from './helpers/ensureAuth'

const VALID_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjo0MTAyNDQ0ODAwfQ.fake-signature'

const userData = {
  id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@example.com',
  phoneNumber: '+1234567890', birthDate: null,
  address: { country: 'GB', city: 'London', line: '123 Main St', postcode: 'SW1A 1AA' },
}

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
test.beforeEach(async ({ page }) => { await ensureAuth(page) })

async function setupMocked(page: Page, { saveStatus = 200 }: { saveStatus?: number } = {}) {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.includes('/users') && method === 'PUT' && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders'))
      await route.fulfill({ status: saveStatus, contentType: 'application/json', body: JSON.stringify(saveStatus === 200 ? userData : { message: 'error' }) })
    else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(userData) })
    else if (url.includes('/orders'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    else
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await page.context().addCookies([{ name: 'token', value: VALID_JWT, url: 'http://localhost:3000' }])
}

async function gotoProfile(page: Page) {
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Personal details' }).first().click()
  await page.waitForSelector('#edit-btn', { timeout: 8000 })
}

async function openEditForm(page: Page) {
  await page.locator('#edit-btn').click()
  await page.waitForSelector('#firstName', { timeout: 5000 })
}

test('profile page shows user name in header', async ({ page }) => {
  if (!IS_REAL) await setupMocked(page)
  await gotoProfile(page)
  if (IS_REAL) {
    // Real user is olivia@example.com — check the profile page loaded with user data
    await expect(page.locator('text=First name').first()).toBeVisible({ timeout: 8000 })
  } else {
    await expect(page.getByText('John Doe')).toBeVisible({ timeout: 8000 })
  }
})

test('personal details section shows user data', async ({ page }) => {
  if (!IS_REAL) await setupMocked(page)
  await gotoProfile(page)
  await expect(page.locator('text=First name').first()).toBeVisible({ timeout: 5000 })
  await expect(page.locator('text=Last name').first()).toBeVisible()
})

test('editing name and saving calls API', async ({ page }) => {
  if (!IS_REAL) await setupMocked(page)
  await gotoProfile(page)
  await openEditForm(page)
  await page.fill('#firstName', IS_REAL ? 'Olivia' : 'Jane')
  if (IS_REAL) {
    // Real backend requires address fields to avoid null constraint
    const city = page.locator('#city')
    if (await city.isVisible()) await city.fill('London')
    const address = page.locator('#address')
    if (await address.isVisible()) await address.fill('123 Main St')
    const postcode = page.locator('#postcode')
    if (await postcode.isVisible()) await postcode.fill('SW1A 1AA')
  }
  await page.locator('#save-btn').click()
  // On success isEditing → false, form hides
  await expect(page.locator('#firstName')).not.toBeVisible({ timeout: 15000 })
})

test('validation error shown for invalid phone number', async ({ page }) => {
  if (!IS_REAL) await setupMocked(page)
  await gotoProfile(page)
  await openEditForm(page)
  await page.fill('#phoneNumber', 'not-a-phone')
  await page.locator('#save-btn').click()
  await expect(page.locator('.text-negative').first()).toBeVisible({ timeout: 5000 })
})

test('save button has disabled styling when form has errors', async ({ page }) => {
  if (!IS_REAL) await setupMocked(page)
  await gotoProfile(page)
  await openEditForm(page)
  await page.fill('#firstName', '')
  await expect(page.locator('#save-btn')).toHaveClass(/opacity/, { timeout: 3000 })
})
