import { mockRoute } from './helpers/mockRoute'
import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test('forgot password form submits email and shows confirmation', async ({
  page,
}) => {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
  await page.goto('/forgotpass')
  await page.locator('input[type="email"]').fill('test@example.com')
  await page.locator('button[type="submit"]').click()
  await expect(page.locator('body')).toContainText(/sent|check|email/i, { timeout: 8000 })
})

test('reset password page renders a form', async ({ page }) => {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
  await page.goto('/resetpass?token=fake-reset-token')
  await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 })
})

test('sign-in form blocks submit with empty required fields', async ({
  page,
}) => {
  await page.goto('/signin')
  await page.locator('#login-btn').click()
  await expect(page).toHaveURL(/\/signin/)
})

test('sign-up form shows validation error for weak password', async ({
  page,
}) => {
  await page.goto('/signup')
  await page.fill('#firstName', 'Test')
  await page.fill('#lastName', 'User')
  await page.fill('#email', 'test@example.com')
  await page.fill('#password', '123')
  await page.locator('#register-btn').click()
  await expect(page.locator('.text-negative').first()).toBeVisible({
    timeout: 5000,
  })
})

test('confirm registration page renders correctly', async ({ page }) => {
  await page.goto('/confirm_registration')
  await expect(page.locator('main')).toBeVisible({ timeout: 5000 })
})
