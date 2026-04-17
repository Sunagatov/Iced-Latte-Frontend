import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { test, expect } from '@playwright/test'
import { nanoid } from 'nanoid'
import { config } from 'dotenv'

config({ path: '.env.local' })

test.use({ storageState: { cookies: [], origins: [] } })

const EXISTING_EMAIL = process.env.E2E_EXISTING_EMAIL!
const EXISTING_PASSWORD = process.env.E2E_EXISTING_PASSWORD!

test('sign in with valid credentials redirects away from /signin', async ({
  page,
}) => {
  if (!IS_REAL) {
    await mockRoute(page, '**/api/proxy/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'ok' }),
      })
    })
    await mockRoute(page, '**/api/proxy/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }),
      })
    })
  }
  await page.goto('/signin?next=/')
  await page.fill('#email', IS_REAL ? EXISTING_EMAIL : 'test@example.com')
  await page.fill('#password', IS_REAL ? EXISTING_PASSWORD : 'ValidPass1@')
  await page.click('#login-btn')
  await expect(page).not.toHaveURL(/\/signin/, { timeout: 15000 })
})

test('sign in with invalid credentials shows error', async ({ page }) => {
  if (!IS_REAL) {
    await mockRoute(page, '**/api/proxy/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      })
    })
  }
  await page.goto('/signin')
  await page.fill('#email', 'wrong@example.com')
  await page.fill('#password', 'WrongPass1!')
  await page.click('#login-btn')
  await expect(page.locator('.text-negative')).toBeVisible({ timeout: 10000 })
})

test('sign up with new email redirects to /confirm_registration', async ({
  page,
}) => {
  const suffix = nanoid(6).replace(/[^a-zA-Z0-9]/g, 'x')
  const email = `testuser${suffix}@example.com`

  await mockRoute(page, '**/api/proxy/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify('Registration successful'),
    })
  })
  await page.goto('/signup')
  await page.fill('#firstName', 'Tester')
  await page.fill('#lastName', 'Usertest')
  await page.fill('#email', email)
  await page.fill('#password', 'ValidPass1@')
  await page.click('#register-btn')
  await expect(page).toHaveURL(/\/confirm_registration/, { timeout: 8000 })
})

test('sign up with existing email shows error message', async ({ page }) => {
  if (IS_REAL) {
    test.skip(true, 'real backend does not return 409 synchronously — confirmation is async')

    return
  }
  await mockRoute(page, '**/api/proxy/auth/register', async (route) => {
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Email already exists' }),
    })
  })
  await page.goto('/signup')
  await page.fill('#firstName', 'Test')
  await page.fill('#lastName', 'User')
  await page.fill('#email', EXISTING_EMAIL)
  await page.fill('#password', 'ValidPass1@')
  await page.click('#register-btn')
  await expect(page.locator('.text-negative')).toBeVisible({ timeout: 8000 })
})
