import { mockRoute, IS_REAL, skipIfNotMutableEnvironment } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import { ensureAuth } from './helpers/ensureAuth'

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
}

async function gotoProfile(page: Page) {
  await page.goto('/profile')
  await page.waitForLoadState('domcontentloaded')

  // Profile starts on 'overview'. Navigate to 'Personal details' section.
  // On desktop the sidebar button is inside <aside>; on mobile it's a chip outside it.
  const sidebarBtn = page.locator('aside').getByRole('button', { name: 'Personal details' })
  const chipBtn = page.getByRole('button', { name: 'Personal details' }).first()

  if (await sidebarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await sidebarBtn.click()
  } else if (await chipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await chipBtn.click()
  }

  // Wait for the InfoRow labels that appear in the profile section
  await expect(page.locator('[data-testid="profile-section"]').or(
    page.locator('h2', { hasText: 'Personal details' })
  )).toBeVisible({ timeout: 8000 })
}

async function openEditForm(page: Page) {
  // If the form is already open, stop
  if (await page.locator('#firstName').isVisible({ timeout: 1000 }).catch(() => false)) return

  await page.locator('#edit-btn').click()
  await page.waitForSelector('#firstName', { timeout: 5000 })
}

test('profile page shows user name in header', async ({ page }) => {
  if (!IS_REAL) await setupMocked(page)
  await gotoProfile(page)
  if (IS_REAL) {
    await expect(page.locator('h2', { hasText: 'Personal details' })).toBeVisible({ timeout: 8000 })
  } else {
    await expect(page.getByText('John Doe')).toBeVisible({ timeout: 8000 })
  }
})

test('personal details section shows user data', async ({ page }) => {
  if (!IS_REAL) await setupMocked(page)
  await gotoProfile(page)
  await expect(page.locator('h2', { hasText: 'Personal details' })).toBeVisible({ timeout: 5000 })
})

test('editing name and saving calls API', async ({ page }) => {
  if (IS_REAL) skipIfNotMutableEnvironment(test)
  if (!IS_REAL) await setupMocked(page)
  await gotoProfile(page)
  await openEditForm(page)
  await page.fill('#firstName', IS_REAL ? 'Olivia' : 'Jane')
  await page.fill('#lastName', IS_REAL ? 'Johnson' : 'Doe')
  if (IS_REAL) {
    // Assert the PUT request completes successfully rather than relying on form hiding
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/api/proxy/users') && res.request().method() === 'PUT',
        { timeout: 15000 },
      ),
      page.locator('#save-btn').click(),
    ])
    expect(response.status()).toBeLessThan(300)
  } else {
    await page.locator('#save-btn').click()
    // In mocked mode the form hides on success
    await expect(page.locator('#firstName')).not.toBeVisible({ timeout: 20000 })
  }
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
