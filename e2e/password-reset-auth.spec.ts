import { test, expect } from '@playwright/test'
import {
  loginAs,
  mockAll200Authenticated,
  mockUsersPatch,
} from './helpers/passwordReset'

test.describe('Flow B — Logged-in: AuthResetPassForm', () => {
  test('renders "Change your password" title with current + new password fields', async ({
    page,
  }) => {
    await mockAll200Authenticated(page)
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('h2')).toContainText('Change your password', {
      timeout: 8000,
    })
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#newPassword')).toBeVisible()
    await expect(page.locator('#reset-confirm-btn')).toBeVisible()
  })

  test('shows validation error when current password is empty', async ({
    page,
  }) => {
    await mockAll200Authenticated(page)
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#newPassword', 'NewPass1!')
    await page.locator('#reset-confirm-btn').click()
    await expect(page.locator('.text-negative').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('shows validation error when new password is too weak', async ({
    page,
  }) => {
    await mockAll200Authenticated(page)
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#password', 'OldPass1!')
    await page.fill('#newPassword', 'weak')
    await page.locator('#reset-confirm-btn').click()
    await expect(page.locator('.text-negative').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('shows validation error when new password equals old password', async ({
    page,
  }) => {
    await mockAll200Authenticated(page)
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#password', 'SamePass1!')
    await page.fill('#newPassword', 'SamePass1!')
    await page.locator('#reset-confirm-btn').click()
    await expect(
      page.locator('text=New Password must not be the same').first(),
    ).toBeVisible({ timeout: 5000 })
  })

  test('on success shows "Password updated!" and "Go to profile" button', async ({
    page,
  }) => {
    await mockAll200Authenticated(page)
    await mockUsersPatch(page, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      }),
    )
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#password', 'OldPass1!')
    await page.fill('#newPassword', 'NewPass1!')
    await page.locator('#reset-confirm-btn').click()
    await expect(page.locator('h2')).toContainText('Password updated!', {
      timeout: 8000,
    })
    await expect(page.locator('#reset-pass-btn')).toContainText('Go to profile')
  })

  test('"Go to profile" button navigates to /profile', async ({ page }) => {
    await mockAll200Authenticated(page)
    await mockUsersPatch(page, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      }),
    )
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#password', 'OldPass1!')
    await page.fill('#newPassword', 'NewPass1!')
    await page.locator('#reset-confirm-btn').click()
    await expect(page.locator('#reset-pass-btn')).toBeVisible({ timeout: 8000 })
    await page.locator('#reset-pass-btn').click()
    await expect(page).toHaveURL(/\/profile/, { timeout: 8000 })
  })

  test('wrong current password shows "Current password is incorrect."', async ({
    page,
  }) => {
    await mockAll200Authenticated(page)
    await mockUsersPatch(page, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Current password is incorrect.' }),
      }),
    )
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#password', 'WrongOld1!')
    await page.fill('#newPassword', 'NewPass1!')
    await page.locator('#reset-confirm-btn').click()
    await expect(
      page.locator('text=Incorrect email or password').first(),
    ).toBeVisible({ timeout: 8000 })
    await expect(page).toHaveURL(/\/resetpass/)
  })

  test('sends correct payload to PATCH /users', async ({ page }) => {
    let capturedBody: Record<string, string> = {}

    await mockAll200Authenticated(page)
    await mockUsersPatch(page, async (route) => {
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
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#password', 'OldPass1!')
    await page.fill('#newPassword', 'NewPass1!')
    await page.locator('#reset-confirm-btn').click()
    await expect(page.locator('h2')).toContainText('Password updated!', {
      timeout: 8000,
    })
    expect(capturedBody.oldPassword).toBe('OldPass1!')
    expect(capturedBody.newPassword).toBe('NewPass1!')
  })

  test('page refresh after success resets to form (local state, not persisted)', async ({
    page,
  }) => {
    await mockAll200Authenticated(page)
    await mockUsersPatch(page, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      }),
    )
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#password', 'OldPass1!')
    await page.fill('#newPassword', 'NewPass1!')
    await page.locator('#reset-confirm-btn').click()
    await expect(page.locator('h2')).toContainText('Password updated!', {
      timeout: 8000,
    })
    await page.reload()
    await expect(page.locator('#password')).toBeVisible({ timeout: 5000 })
  })
})
