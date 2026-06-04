import type { Page } from '@playwright/test'
import { test, expect } from './fixtures/index'

const password = 'LocalPass123'

function collectBrowserFailures(page: Page) {
  const failures: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      if (message.text().includes('the server responded with a status of 401')) {
        return
      }
      failures.push(`console error: ${message.text()}`)
    }
  })

  page.on('pageerror', (error) => {
    failures.push(`page error: ${error.message}`)
  })

  page.on('requestfailed', (request) => {
    const url = request.url()

    if (url.includes('/api/proxy/auth/refresh')) {
      return
    }

    if (request.failure()?.errorText === 'net::ERR_ABORTED') {
      return
    }

    if (url.includes('/api/proxy/') || url.includes('/api/v1/')) {
      failures.push(`request failed: ${request.method()} ${url} ${request.failure()?.errorText ?? ''}`)
    }
  })

  page.on('response', (response) => {
    const url = response.url()

    if ((url.includes('/api/proxy/') || url.includes('/api/v1/')) && response.status() >= 500) {
      failures.push(`server error: ${response.status()} ${url}`)
    }
  })

  return failures
}

test.describe('Local contributor smoke', () => {
  test('default local app supports browse, email auth, protected routes, forgot password, and disabled checkout providers', async ({ page, homePage, productDetailPage }) => {
    const failures = collectBrowserFailures(page)
    const unique = Date.now()
    const email = `local-smoke-${unique}@example.com`

    await homePage.goto()
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('#catalog')).toBeVisible({ timeout: 10_000 })
    await homePage.expectProductsVisible()

    await homePage.clickFirstProduct()
    await productDetailPage.expectLoaded()
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible()

    await page.goto('/forgotpass')
    await expect(page.getByRole('heading', { name: 'Password reset unavailable' })).toBeVisible()
    await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toHaveCount(0)

    await page.goto('/cart')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page).not.toHaveURL(/signin/)

    await page.goto('/favourites')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(page).not.toHaveURL(/signin/)

    await page.goto('/profile')
    await expect(page).toHaveURL(/\/signin\?next=%2Fprofile/, { timeout: 10_000 })

    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/signin\?next=%2Fcheckout/, { timeout: 10_000 })

    await page.goto('/signup')
    await page.locator('#firstName').fill('Local')
    await page.locator('#lastName').fill('Smoke')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toHaveCount(0)
    await page.locator('#register-btn').click()

    await expect(page).not.toHaveURL(/\/signup/, { timeout: 20_000 })
    await expect(page.locator('#user-btn')).toBeVisible({ timeout: 15_000 })

    await page.goto('/profile')
    await expect(page.locator('p', { hasText: email })).toBeVisible({ timeout: 15_000 })

    await page.locator('#logout-btn').click()
    await expect(page).toHaveURL(/\/signin/, { timeout: 15_000 })

    await page.getByLabel('Enter your email address').fill(email)
    await page.locator('#password').fill(password)
    await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toHaveCount(0)
    await page.locator('#login-btn').click()
    await expect(page).not.toHaveURL(/\/signin/, { timeout: 20_000 })
    await expect(page.locator('#user-btn')).toBeVisible({ timeout: 15_000 })

    await page.goto('/profile')
    await expect(page.locator('p', { hasText: email })).toBeVisible({ timeout: 15_000 })

    await page.goto('/checkout')
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toHaveCount(0)
    await expect(page.getByText('Hosted checkout is disabled for this environment.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Place order' })).toBeDisabled()

    expect(failures).toEqual([])
  })
})
