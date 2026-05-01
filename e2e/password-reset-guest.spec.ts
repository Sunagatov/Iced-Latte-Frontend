import { test, expect } from '@playwright/test'
import { mockRoute } from './helpers/mockRoute'
import {
  mockAll200,
  mockPasswordChangeSuccess,
} from './helpers/passwordReset'

test.describe('Flow A — Step 4-6: GuestResetPassForm', () => {
  test('renders code, password and confirm fields with correct title', async ({
    page,
  }) => {
    await mockAll200(page)
    await page.goto('/resetpass')
    await expect(page.locator('h2')).toContainText('Reset your password')
    await expect(page.locator('#code')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirmPassword')).toBeVisible()
    await expect(page.locator('#reset-btn')).toBeVisible()
  })

  test('shows validation error when code is empty', async ({ page }) => {
    await mockAll200(page)
    await page.goto('/resetpass')
    await page.fill('#password', 'NewPass1!')
    await page.fill('#confirmPassword', 'NewPass1!')
    await page.locator('#reset-btn').click()
    await expect(page.locator('text=Code is required').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('shows validation error when code is not 9 digits', async ({ page }) => {
    await mockAll200(page)
    await page.goto('/resetpass')
    await page.fill('#code', '123')
    await page.fill('#password', 'NewPass1!')
    await page.fill('#confirmPassword', 'NewPass1!')
    await page.locator('#reset-btn').click()
    await expect(
      page.locator('text=Code must be exactly 9 digits').first(),
    ).toBeVisible({ timeout: 5000 })
  })

  test('shows validation error when passwords do not match', async ({
    page,
  }) => {
    await mockAll200(page)
    await page.goto('/resetpass')
    await page.fill('#code', '123456789')
    await page.fill('#password', 'NewPass1!')
    await page.fill('#confirmPassword', 'Different1!')
    await page.locator('#reset-btn').click()
    await expect(page.locator('text=Passwords must match').first()).toBeVisible(
      { timeout: 5000 },
    )
  })

  test('shows validation error for weak password', async ({ page }) => {
    await mockAll200(page)
    await page.goto('/resetpass')
    await page.fill('#code', '123456789')
    await page.fill('#password', 'weak')
    await page.fill('#confirmPassword', 'weak')
    await page.locator('#reset-btn').click()
    await expect(
      page.locator('.text-negative, .text-red-600, [class*="text-red"]').first(),
    ).toBeVisible({ timeout: 5000 })
  })

  test('on success shows "Password updated!" and "Sign in" button', async ({
    page,
  }) => {
    await mockAll200(page)
    await mockPasswordChangeSuccess(page)
    await page.goto('/resetpass')
    await page.fill('#code', '123456789')
    await page.fill('#password', 'NewPass1!')
    await page.fill('#confirmPassword', 'NewPass1!')
    await page.locator('#reset-btn').click()
    await expect(page.locator('h2')).toContainText('Password updated!', {
      timeout: 8000,
    })
    await expect(page.locator('#return-btn')).toContainText('Sign in')
  })

  test('"Sign in" button on success screen navigates to /signin', async ({
    page,
  }) => {
    await mockAll200(page)
    await mockPasswordChangeSuccess(page)
    await page.goto('/resetpass')
    await page.fill('#code', '123456789')
    await page.fill('#password', 'NewPass1!')
    await page.fill('#confirmPassword', 'NewPass1!')
    await page.locator('#reset-btn').click()
    await expect(page.locator('#return-btn')).toBeVisible({ timeout: 8000 })
    await page.locator('#return-btn').click()
    await expect(page).toHaveURL(/\/signin/, { timeout: 8000 })
  })

  test('invalid/expired token shows error message', async ({ page }) => {
    await mockRoute(page, '**/api/proxy/auth/password/change', (route) => {
      void route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Token is invalid or expired' }),
      })
    })
    await page.goto('/resetpass')
    await page.fill('#code', '000000000')
    await page.fill('#password', 'NewPass1!')
    await page.fill('#confirmPassword', 'NewPass1!')
    await page.locator('#reset-btn').click()
    await expect(
      page.locator('text=Token is invalid or expired').first(),
    ).toBeVisible({ timeout: 8000 })
    await expect(page).toHaveURL(/\/resetpass/)
  })

  test('sends correct payload to /auth/password/change', async ({ page }) => {
    let capturedBody: Record<string, string> = {}

    await mockRoute(page, '**/api/proxy/auth/password/change', async (route) => {
      capturedBody = JSON.parse(route.request().postData() ?? '{}') as Record<
        string,
        string
      >
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })
    await page.goto('/resetpass')
    await page.fill('#code', '123456789')
    await page.fill('#password', 'NewPass1!')
    await page.fill('#confirmPassword', 'NewPass1!')
    await page.locator('#reset-btn').click()
    await expect(page.locator('h2')).toContainText('Password updated!', {
      timeout: 8000,
    })
    expect(capturedBody.code).toBe('123456789')
    expect(capturedBody.password).toBe('NewPass1!')
    expect(capturedBody.email).toBeUndefined()
  })

  test('page refresh after success resets to form (local state, not persisted)', async ({
    page,
  }) => {
    await mockPasswordChangeSuccess(page)
    await page.goto('/resetpass')
    await page.fill('#code', '123456789')
    await page.fill('#password', 'NewPass1!')
    await page.fill('#confirmPassword', 'NewPass1!')
    await page.locator('#reset-btn').click()
    await expect(page.locator('h2')).toContainText('Password updated!', {
      timeout: 8000,
    })
    await page.reload()
    await expect(page.locator('#code')).toBeVisible({ timeout: 5000 })
  })
})
