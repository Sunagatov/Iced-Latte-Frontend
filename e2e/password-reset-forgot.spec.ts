import { test, expect } from '@playwright/test'
import { mockRoute } from './helpers/mockRoute'
import {
  EXISTING_EMAIL,
  mockAll200,
  mockForgotPasswordSuccess,
} from './helpers/passwordReset'

test.describe('Flow A — Step 1-3: ForgotPassForm', () => {
  test('renders email input and submit button', async ({ page }) => {
    await mockAll200(page)
    await page.goto('/forgotpass')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#send-reset-btn')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Forgot password?')
  })

  test('shows validation error when email is empty', async ({ page }) => {
    await mockAll200(page)
    await page.goto('/forgotpass')
    await page.locator('#send-reset-btn').click()
    await expect(
      page.locator('.text-negative, .text-red-600, [class*="text-red"]').first(),
    ).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/\/forgotpass/)
  })

  test('shows validation error for invalid email format', async ({ page }) => {
    await mockAll200(page)
    await page.goto('/forgotpass')
    await page.fill('#email', 'not-an-email')
    await page.locator('#send-reset-btn').click()
    await expect(page.locator('.text-negative').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('on success shows "Check your inbox" screen', async ({ page }) => {
    await mockForgotPasswordSuccess(page)
    await page.goto('/forgotpass')
    await page.fill('#email', EXISTING_EMAIL)
    await page.locator('#send-reset-btn').click()
    await expect(page.locator('h2')).toContainText('Check your inbox', {
      timeout: 8000,
    })
    await expect(page.locator('#reset-continue-btn')).toBeVisible()
    await expect(page.locator('a[href="/signin"]').first()).toBeVisible()
  })

  test('"Continue to reset password" navigates to /resetpass', async ({
    page,
  }) => {
    await mockForgotPasswordSuccess(page)
    await page.goto('/forgotpass')
    await page.fill('#email', EXISTING_EMAIL)
    await page.locator('#send-reset-btn').click()
    await expect(page.locator('#reset-continue-btn')).toBeVisible({
      timeout: 8000,
    })
    await page.locator('#reset-continue-btn').click()
    await expect(page).toHaveURL(/\/resetpass/, { timeout: 8000 })
  })

  test('"Back to sign in" link goes to /signin', async ({ page }) => {
    await mockAll200(page)
    await page.goto('/forgotpass')
    await page.locator('a[href="/signin"]').first().click()
    await expect(page).toHaveURL(/\/signin/, { timeout: 8000 })
  })

  test('page refresh resets to form (not stuck on success screen)', async ({
    page,
  }) => {
    await mockForgotPasswordSuccess(page)
    await page.goto('/forgotpass')
    await page.fill('#email', EXISTING_EMAIL)
    await page.locator('#send-reset-btn').click()
    await expect(page.locator('h2')).toContainText('Check your inbox', {
      timeout: 8000,
    })
    await page.reload()
    await expect(page.locator('#email')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('h1')).toContainText('Forgot password?')
  })

  test('API error shows error message on form', async ({ page }) => {
    await mockRoute(page, '**/api/proxy/auth/password/forgot', (route) => {
      void route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' }),
      })
    })
    await page.goto('/forgotpass')
    await page.fill('#email', EXISTING_EMAIL)
    await page.locator('#send-reset-btn').click()
    await expect(
      page.locator('.text-negative, .text-red-600, [class*="text-red"]').first(),
    ).toBeVisible({ timeout: 8000 })
    await expect(page).toHaveURL(/\/forgotpass/)
  })
})
