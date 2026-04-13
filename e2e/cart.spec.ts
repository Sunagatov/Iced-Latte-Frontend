import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import { seedCart, clearCart } from './helpers/seedReal'
import { REAL_PRODUCT_ID } from './helpers/realData'
import { ensureAuth } from './helpers/ensureAuth'

const FAKE_PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

async function mockProxy(page: Page) {
  const product = makeProduct(FAKE_PRODUCT_ID)
  const cart = { id: 'cart-1', userId: 'u1', items: [], itemsQuantity: 0, itemsTotalPrice: 0, productsQuantity: 0, createdAt: '', closedAt: null }

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
    } else if (url.includes('/cart')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cart) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
}

test.describe('authenticated', () => {
  test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => { await ensureAuth(page) })

  test.afterEach(async ({ page }) => {
    await clearCart(page)
  })

  test('empty cart shows empty state', async ({ page }) => {
    if (!IS_REAL) await mockProxy(page)
    if (IS_REAL) await clearCart(page)
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

  test('cart page does not redirect to signin when logged in', async ({ page }) => {
    if (!IS_REAL) await mockProxy(page)
    await page.goto('/cart')
    await expect(page).not.toHaveURL(/signin/)
  })

  test('add product to cart updates cart count', async ({ page }) => {
    if (!IS_REAL) {
      let cartQty = 0
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        const method = route.request().method()
        if (url.includes('/products') && !url.includes('/ids')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [makeProduct(FAKE_PRODUCT_ID)], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
        } else if (url.includes('/cart/items') && method === 'POST') {
          cartQty = 1
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'c1', userId: 'u1', items: [{ id: 'ci1', productInfo: makeProduct(FAKE_PRODUCT_ID), productQuantity: 1 }], itemsQuantity: 1, itemsTotalPrice: 9.99, productsQuantity: 1, createdAt: '', closedAt: null }) })
        } else if (url.includes('/cart')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'c1', userId: 'u1', items: [], itemsQuantity: 0, itemsTotalPrice: 0, productsQuantity: cartQty, createdAt: '', closedAt: null }) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
      await page.waitForResponse(
        (res) => res.url().includes('/api/proxy/cart/items') && res.request().method() === 'POST',
      )
      const badge = page.locator('a[href="/cart"] div div').filter({ hasText: /^\d+$/ })
      await expect(badge).toBeVisible({ timeout: 5000 })
      expect(parseInt((await badge.textContent()) ?? '0')).toBeGreaterThan(0)
    } else {
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/')
      const badge = page.locator('a[href="/cart"] div div').filter({ hasText: /^\d+$/ })
      await expect(badge).toBeVisible({ timeout: 8000 })
      expect(parseInt((await badge.textContent()) ?? '0')).toBeGreaterThan(0)
    }
  })

  test('cart page shows added item after adding to cart', async ({ page }) => {
    if (!IS_REAL) {
      await mockProxy(page)
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 8000 })
    } else {
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('cart page is accessible when not logged in', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('main')).toBeVisible()
  })
})
