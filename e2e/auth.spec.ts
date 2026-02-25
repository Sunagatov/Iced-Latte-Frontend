import { test, expect } from '@playwright/test'
import { nanoid } from 'nanoid'

const EXISTING_EMAIL = 'olivia@example.com'
const EXISTING_PASSWORD = 'p@ss1logic11'

test('sign in with valid credentials redirects away from /signin', async ({ page }) => {
  await page.goto('/signin')
  await page.fill('#email', EXISTING_EMAIL)
  await page.fill('#password', EXISTING_PASSWORD)
  await page.click('#login-btn')
  await expect(page).not.toHaveURL(/\/signin/, { timeout: 20000 })
})

test('sign in with invalid credentials shows error', async ({ page }) => {
  await page.goto('/signin')
  await page.fill('#email', 'wrong@example.com')
  await page.fill('#password', 'WrongPass1!')
  await page.click('#login-btn')
  await expect(page.locator('.text-negative')).toBeVisible({ timeout: 10000 })
})

test('sign up with new email redirects to /confirm_registration', async ({ page }) => {
  const suffix = nanoid(6).replace(/[^a-zA-Z0-9]/g, 'x')
  const email = `testuser${suffix}@example.com`
  await page.goto('/signup')
  await page.fill('#firstName', 'Tester')
  await page.fill('#lastName', 'Usertest')
  await page.fill('#email', email)
  await page.fill('#password', 'ValidPass1@')
  await page.click('#register-btn')
  await expect(page).toHaveURL(/\/confirm_registration/, { timeout: 8000 })
})

test('sign up with existing email redirects to confirm registration', async ({ page }) => {
  await page.goto('/signup')
  await page.fill('#firstName', 'Test')
  await page.fill('#lastName', 'User')
  await page.fill('#email', EXISTING_EMAIL)
  await page.fill('#password', 'ValidPass1@')
  await page.click('#register-btn')
  await expect(page).toHaveURL(/\/confirm_registration/, { timeout: 10000 })
})
