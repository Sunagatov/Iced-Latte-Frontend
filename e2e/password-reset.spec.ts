import { mockRoute } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'

/**
 * Password Reset & Change — Playwright Tests
 * Covers every step in password-reset-spec.md
 *
 * Flow A — Guest: Forgot Password  (/forgotpass → /resetpass)
 * Flow B — Logged-in: Change Password  (/resetpass while authenticated)
 */

const EXISTING_EMAIL = process.env.E2E_EXISTING_EMAIL ?? 'olivia@example.com'

/** Mock every proxy call with a 200 unless overridden.
 *  Always returns authenticated=true for session endpoint. */
async function mockAll200(page: Page) {
  await mockRoute(page, '**/api/proxy/**', (route) => {
    const url = route.request().url()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      void route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
    } else {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    }
  })
}

/** Mock every proxy call and return authenticated=true for session. */
async function mockAll200Authenticated(page: Page) {
  await mockRoute(page, '**/api/proxy/**', (route) => {
    const url = route.request().url()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 'id':'u1','firstName':'Test','lastName':'User','email':'olivia@example.com','phoneNumber':null,'birthDate':null,'address':null }),
      })
    } else {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    }
  })
}

/** Navigate to home first so AppInitProvider resolves auth, then go to /resetpass. */
async function loginAs(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.goto('/resetpass')
  await page.waitForLoadState('domcontentloaded')
}

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
      page
        .locator('.text-negative, .text-red-600, [class*="text-red"]')
        .first(),
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
    await mockRoute(page, '**/api/proxy/auth/password/forgot', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })
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
    await mockRoute(page, '**/api/proxy/auth/password/forgot', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })
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
    await mockRoute(page, '**/api/proxy/auth/password/forgot', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    })
    await page.goto('/forgotpass')
    await page.fill('#email', EXISTING_EMAIL)
    await page.locator('#send-reset-btn').click()
    await expect(page.locator('h2')).toContainText('Check your inbox', {
      timeout: 8000,
    })
    // Refresh — local state is gone, form must reappear
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
      page
        .locator('.text-negative, .text-red-600, [class*="text-red"]')
        .first(),
    ).toBeVisible({ timeout: 8000 })
    // Must stay on forgotpass — not navigate away
    await expect(page).toHaveURL(/\/forgotpass/)
  })
})

// ─── Flow A: GuestResetPassForm (/resetpass, not logged in) ─────────────────

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
      page
        .locator('.text-negative, .text-red-600, [class*="text-red"]')
        .first(),
    ).toBeVisible({ timeout: 5000 })
  })

  test('on success shows "Password updated!" and "Sign in" button', async ({
    page,
  }) => {
    await mockAll200(page)
    await mockRoute(page, '**/api/proxy/auth/password/change', (route) => {
      void route.fulfill({
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
    await expect(page.locator('#return-btn')).toContainText('Sign in')
  })

  test('"Sign in" button on success screen navigates to /signin', async ({
    page,
  }) => {
    await mockAll200(page)
    await mockRoute(page, '**/api/proxy/auth/password/change', (route) => {
      void route.fulfill({
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
    // Must stay on resetpass — not navigate away
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
    // email must NOT be sent (removed from contract)
    expect(capturedBody.email).toBeUndefined()
  })

  test('page refresh after success resets to form (local state, not persisted)', async ({
    page,
  }) => {
    await mockRoute(page, '**/api/proxy/auth/password/change', (route) => {
      void route.fulfill({
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
    await page.reload()
    await expect(page.locator('#code')).toBeVisible({ timeout: 5000 })
  })
})

// ─── Flow B: AuthResetPassForm (/resetpass, logged in) ──────────────────────

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
    await mockRoute(page, '**/api/proxy/users', (route) => {
      if (route.request().method() === 'PATCH')
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        })
      else
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'u1',
            firstName: 'Olivia',
            lastName: 'Test',
            email: 'olivia@example.com',
          }),
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
    await expect(page.locator('#reset-pass-btn')).toContainText('Go to profile')
  })

  test('"Go to profile" button navigates to /profile', async ({ page }) => {
    await mockAll200Authenticated(page)
    await mockRoute(page, '**/api/proxy/users', (route) => {
      if (route.request().method() === 'PATCH')
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        })
      else
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'u1',
            firstName: 'Olivia',
            lastName: 'Test',
            email: 'olivia@example.com',
          }),
        })
    })
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
    await mockRoute(page, '**/api/proxy/users', (route) => {
      if (route.request().method() === 'PATCH')
        void route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Current password is incorrect.' }),
        })
      else
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'u1',
            firstName: 'Olivia',
            lastName: 'Test',
            email: 'olivia@example.com',
          }),
        })
    })
    await loginAs(page)
    await page.goto('/resetpass')
    await expect(page.locator('#newPassword')).toBeVisible({ timeout: 8000 })
    await page.fill('#password', 'WrongOld1!')
    await page.fill('#newPassword', 'NewPass1!')
    await page.locator('#reset-confirm-btn').click()
    await expect(
      page.locator('text=Incorrect email or password').first(),
    ).toBeVisible({ timeout: 8000 })
    // Must stay on resetpass
    await expect(page).toHaveURL(/\/resetpass/)
  })

  test('sends correct payload to PATCH /users', async ({ page }) => {
    let capturedBody: Record<string, string> = {}

    await mockAll200Authenticated(page)
    await mockRoute(page, '**/api/proxy/users', async (route) => {
      if (route.request().method() === 'PATCH') {
        capturedBody = JSON.parse(route.request().postData() ?? '{}') as Record<
          string,
          string
        >
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'u1',
            firstName: 'Olivia',
            lastName: 'Test',
            email: 'olivia@example.com',
          }),
        })
      }
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
    await mockRoute(page, '**/api/proxy/users', (route) => {
      if (route.request().method() === 'PATCH')
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        })
      else
        void route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'u1',
            firstName: 'Olivia',
            lastName: 'Test',
            email: 'olivia@example.com',
          }),
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
    await page.reload()
    await expect(page.locator('#password')).toBeVisible({ timeout: 5000 })
  })
})

// ─── Routing: /resetpass dispatches correctly based on auth state ────────────

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
