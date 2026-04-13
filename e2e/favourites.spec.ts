import { strictMockProxy, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Route } from '@playwright/test'
import { clearFavourites } from './helpers/seedReal'
import { ensureAuth } from './helpers/ensureAuth'

const FAKE_PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

function userHandler(authenticated: boolean): (route: Route) => Promise<void> {
  return async (route) => {
    await route.fulfill({
      status: authenticated ? 200 : 401,
      contentType: 'application/json',
      body: authenticated
        ? JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null })
        : JSON.stringify({ message: 'Unauthorized' }),
    })
  }
}

test.describe('authenticated', () => {
  test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => { await ensureAuth(page) })

  test.afterEach(async ({ page }) => {
    await clearFavourites(page)
  })

  test('favourites page is accessible when logged in', async ({ page }) => {
    if (!IS_REAL) {
      await strictMockProxy(page, {
        '/users': userHandler(true),
        '/favorites': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) }),
        '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
      })
    }
    await page.goto('/favourites')
    await expect(page).not.toHaveURL(/signin/, { timeout: 10000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
  })

  test('heart icon on product card is visible', async ({ page }) => {
    const product = makeProduct(FAKE_PRODUCT_ID)

    if (!IS_REAL) {
      await strictMockProxy(page, {
        '/users': userHandler(true),
        '/products': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) }),
        '/favorites': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) }),
        '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
      })
    }
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="favourite-btn"]').first()).toBeVisible()
  })

  test('clicking heart toggles favourite state', async ({ page }) => {
    const product = makeProduct(FAKE_PRODUCT_ID)

    if (!IS_REAL) {
      await strictMockProxy(page, {
        '/users': userHandler(true),
        '/products': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) }),
        '/favorites': async (route) => {
          const method = route.request().method()

          if (method === 'POST') {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product] }) })
          } else if (method === 'DELETE') {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) })
          } else {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) })
          }
        },
        '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
      })
    }
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    const heartBtn = page.locator('[data-testid="favourite-btn"]').first()
    await heartBtn.waitFor({ timeout: 10000 })
    const before = await heartBtn.getAttribute('data-active')
    await heartBtn.click()
    await expect(heartBtn).toHaveAttribute('data-active', before === 'true' ? 'false' : 'true', { timeout: 5000 })
  })
})
