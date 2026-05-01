import { test, expect } from '@playwright/test'
import {
  loginAs,
  mockAll200,
  mockAll200Authenticated,
} from './helpers/passwordReset'

test.describe('ResetPassForm routing', () => {
  test('unauthenticated user on /resetpass sees guest form (code field)', async ({
    page,
  }) => {
    await mockAll200(page)
    await page.goto('/resetpass')
    await expect(page.locator('#code')).toBeVisible({ timeout: 8000 })
  })

  test('authenticated user on /resetpass sees auth form (no code field)', async ({
    page,
  }) => {
    await mockAll200Authenticated(page)
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('#code')).not.toBeVisible({ timeout: 5000 })
  })
})
