/**
 * Guest tests — unauthenticated user flows.
 * Runs against real backend (prod or localhost), no mocks.
 */
import { test, expect } from './fixtures/index'

test.describe('Sign in page', () => {
  test('renders sign in form', async ({ signInPage }) => {
    await signInPage.goto()
    await expect(signInPage.emailInput).toBeVisible()
    await expect(signInPage.passwordInput).toBeVisible()
    await expect(signInPage.loginButton).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ signInPage }) => {
    await signInPage.goto()
    await signInPage.login('wrong@example.com', 'WrongPass1!')
    await signInPage.expectError(/invalid|incorrect|credentials/i)
  })
})

test.describe('Guest navigation', () => {
  test('home page loads products without auth', async ({ homePage }) => {
    await homePage.goto()
    await homePage.expectProductsVisible()
  })

  test('can navigate to product detail', async ({ homePage, productDetailPage }) => {
    await homePage.goto()
    await homePage.clickFirstProduct()
    await productDetailPage.expectLoaded()
  })

  test('cart page does not crash for guest', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })
})
