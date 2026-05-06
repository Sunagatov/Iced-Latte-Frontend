import { test, expect } from './fixtures/index'
import { config } from 'dotenv'

config({ path: '.env.local' })

const EMAIL = process.env.E2E_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_PASSWORD ?? 'p@ss1logic11'

test.describe('Sign in', () => {
  test('form renders correctly', async ({ signInPage }) => {
    await signInPage.goto()
    await expect(signInPage.emailInput).toBeVisible()
    await expect(signInPage.passwordInput).toBeVisible()
    await expect(signInPage.loginButton).toBeVisible()
  })

  test('header is visible on signin page', async ({ page }) => {
    await page.goto('/signin')
    await expect(page.locator('header')).toBeVisible()
  })

  test('valid credentials redirect away from signin', async ({ signInPage }) => {
    await signInPage.goto('/')
    await signInPage.login(EMAIL, PASSWORD)
    await signInPage.expectRedirectedAway()
  })

  test('invalid credentials show error', async ({ signInPage }) => {
    await signInPage.goto()
    await signInPage.login('wrong@example.com', 'WrongPass1!')
    await signInPage.expectError(/invalid|incorrect|credentials/i)
  })

  test('empty fields block submit', async ({ signInPage }) => {
    await signInPage.goto()
    await signInPage.loginButton.click()
    await expect(signInPage['page']).toHaveURL(/\/signin/)
  })
})

test.describe('Sign up', () => {
  test('form renders correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('#firstName')).toBeVisible()
    await expect(page.locator('#lastName')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#register-btn')).toBeVisible()
  })

  test('weak password shows validation error', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('#firstName').fill('Test')
    await page.locator('#lastName').fill('User')
    await page.locator('#email').fill('test@example.com')
    await page.locator('#password').fill('123')
    await page.locator('#register-btn').click()
    await expect(page.locator('.text-negative').first()).toBeVisible({ timeout: 5_000 })
  })

  test('existing email shows error', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('#firstName').fill('Test')
    await page.locator('#lastName').fill('User')
    await page.locator('#email').fill(EMAIL)
    await page.locator('#password').fill('ValidPass1@')
    await page.locator('#register-btn').click()
    await expect(page.locator('.text-negative')).toContainText(/already registered/i, { timeout: 8_000 })
  })
})

test.describe('Navigation links', () => {
  test('signup link on signin page', async ({ page }) => {
    await page.goto('/signin')
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL(/signup/, { timeout: 5_000 })
  })

  test('signin link on signup page', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/signin/, { timeout: 5_000 })
  })
})

test.describe('Password reset', () => {
  test('forgot password page renders email input', async ({ page }) => {
    await page.goto('/forgotpass')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5_000 })
  })

  test('forgot password form submits and shows confirmation', async ({ page }) => {
    await page.goto('/forgotpass')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('body')).toContainText(/sent|check|email/i, { timeout: 8_000 })
  })

  test('reset password page renders form', async ({ page }) => {
    await page.goto('/resetpass?token=fake-reset-token')
    await expect(page.locator('input').first()).toBeVisible({ timeout: 5_000 })
  })
})

test.describe('Registration confirmation', () => {
  test('confirm registration page renders', async ({ page }) => {
    await page.goto('/confirm_registration')
    await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
  })
})
