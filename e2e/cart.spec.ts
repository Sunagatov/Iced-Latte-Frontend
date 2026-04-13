import { strictMockProxy, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Route } from '@playwright/test'
import { seedExactCart, clearCart } from './helpers/seedReal'
import { REAL_PRODUCT_ID } from './helpers/realData'
import { ensureAuth } from './helpers/ensureAuth'

const FAKE_PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

function emptyCart() {
  return { id: 'cart-1', userId: 'u1', items: [], itemsQuantity: 0, itemsTotalPrice: 0, productsQuantity: 0, createdAt: '', closedAt: null }
}

function userHandler(): (route: Route) => Promise<void> {
  return async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }),
    })
  }
}

test.describe('authenticated', () => {
  test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => { await ensureAuth(page) })

  test.afterEach(async ({ page }) => {
    await clearCart(page)
  })

  test('empty cart shows empty state', async ({ page }) => {
    if (!IS_REAL) {
      await strictMockProxy(page, {
        '/users': userHandler(),
        '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyCart()) }),
      })
    }
    if (IS_REAL) await clearCart(page)
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

  test('cart page does not redirect to signin when logged in', async ({ page }) => {
    if (!IS_REAL) {
      await strictMockProxy(page, {
        '/users': userHandler(),
        '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyCart()) }),
      })
    }
    await page.goto('/cart')
    await expect(page).not.toHaveURL(/signin/)
  })

  test('add product to cart updates cart count', async ({ page }) => {
    if (!IS_REAL) {
      const product = makeProduct(FAKE_PRODUCT_ID)
      let cartQty = 0

      await strictMockProxy(page, {
        '/products': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) }),
        '/cart/items': async (route) => {
          if (route.request().method() === 'POST') {
            cartQty = 1
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'c1', userId: 'u1', items: [{ id: 'ci1', productInfo: product, productQuantity: 1 }], itemsQuantity: 1, itemsTotalPrice: 9.99, productsQuantity: 1, createdAt: '', closedAt: null }) })
          } else {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyCart()) })
          }
        },
        '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...emptyCart(), productsQuantity: cartQty }) }),
        '/users': userHandler(),
      })
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
      await page.waitForResponse(
        (res) => res.url().includes('/api/proxy/cart/items') && res.request().method() === 'POST',
      )
      const badge = page.locator('[data-testid="header-cart-badge"]')
      await expect(badge).toBeVisible({ timeout: 5000 })
      expect(parseInt((await badge.textContent()) ?? '0')).toBeGreaterThan(0)
    } else {
      // Real mode: navigate to product detail page for a deterministic add-to-cart target
      await clearCart(page)
      await page.goto(`/product/${REAL_PRODUCT_ID}`)
      await page.waitForSelector('[data-testid="product-detail"]', { timeout: 15000 })
      await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes('/api/proxy/cart/items') && res.request().method() === 'POST',
          { timeout: 15000 },
        ),
        page.locator('[data-testid="add-to-cart-btn"]').click(),
      ])
      const badge = page.locator('[data-testid="header-cart-badge"]')

      await expect(badge).toBeVisible({ timeout: 10000 })
      expect(parseInt((await badge.textContent()) ?? '0')).toBeGreaterThan(0)
    }
  })

  test('cart page shows added item after adding to cart', async ({ page }) => {
    if (!IS_REAL) {
      const product = makeProduct(FAKE_PRODUCT_ID)

      await strictMockProxy(page, {
        '/products': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) }),
        '/cart/items': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'c1', userId: 'u1', items: [{ id: 'ci1', productInfo: product, productQuantity: 1 }], itemsQuantity: 1, itemsTotalPrice: 9.99, productsQuantity: 1, createdAt: '', closedAt: null }) }),
        '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyCart()) }),
        '/users': userHandler(),
      })
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 8000 })
    } else {
      await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
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
