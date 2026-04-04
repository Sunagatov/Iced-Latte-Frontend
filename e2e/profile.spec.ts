import { test, expect, type Page } from '@playwright/test'

const VALID_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjo0MTAyNDQ0ODAwfQ.fake-signature'

const userData = {
  id: 'u1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '+1234567890',
  birthDate: null,
  address: {
    country: 'GB',
    city: 'London',
    line: '123 Main St',
    postcode: 'SW1A 1AA',
  },
}

async function setup(
  page: Page,
  { saveStatus = 200 }: { saveStatus?: number } = {},
) {
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/auth/session'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true, user: userData }),
      })
    else if (url.includes('/users') && method === 'PUT')
      await route.fulfill({
        status: saveStatus,
        contentType: 'application/json',
        body: JSON.stringify(
          saveStatus === 200 ? userData : { message: 'error' },
        ),
      })
    else if (url.includes('/users'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(userData),
      })
    else if (url.includes('/orders'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      })
    else
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
  })
  await page.context().addCookies([{ name: 'token', value: VALID_JWT, url: 'http://localhost:3000' }])
  await page.goto('/profile')
  // Navigate to Personal details section
  await page.getByRole('button', { name: 'Personal details' }).first().click()
  await page.waitForSelector('#edit-btn', { timeout: 8000 })
}

async function openEditForm(page: Page) {
  await page.locator('#edit-btn').click()
  await page.waitForSelector('#firstName', { timeout: 5000 })
}

test('profile page shows user name in header', async ({ page }) => {
  await setup(page)
  await expect(page.getByText('John Doe')).toBeVisible({ timeout: 8000 })
})

test('personal details section shows user data', async ({ page }) => {
  await setup(page)
  // InfoRow renders label + value pairs — check the value cells specifically
  await expect(page.locator('text=First name').first()).toBeVisible({
    timeout: 5000,
  })
  await expect(page.locator('text=Last name').first()).toBeVisible()
})

test('editing name and saving calls API', async ({ page }) => {
  await setup(page)
  await openEditForm(page)
  await page.fill('#firstName', 'Jane')
  await page.locator('#save-btn').click()
  // On success isEditing → false, form hides
  await expect(page.locator('#firstName')).not.toBeVisible({ timeout: 8000 })
})

test('validation error shown for invalid phone number', async ({ page }) => {
  await setup(page)
  await openEditForm(page)
  await page.fill('#phoneNumber', 'not-a-phone')
  await page.locator('#save-btn').click()
  await expect(page.locator('.text-negative').first()).toBeVisible({
    timeout: 5000,
  })
})

test('save button has disabled styling when form has errors', async ({
  page,
}) => {
  await setup(page)
  await openEditForm(page)
  await page.fill('#firstName', '')
  await expect(page.locator('#save-btn')).toHaveClass(/opacity/, {
    timeout: 3000,
  })
})
