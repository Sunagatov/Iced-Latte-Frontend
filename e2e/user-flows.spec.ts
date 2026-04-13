import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import { clearCart, seedCart } from './helpers/seedReal'
import { REAL_PRODUCT_ID } from './helpers/realData'
import { ensureAuth } from './helpers/ensureAuth'
import { openCatalogAndWaitReady } from './helpers/waits'

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

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })

test.beforeEach(async ({ page }) => {
  await ensureAuth(page)
  if (!IS_REAL) {
    await mockProxy(page)
    await page.goto('http://localhost:3000')
  }
})

test.afterEach(async ({ page }) => {
  await clearCart(page)
})

test('add product to cart', async ({ page }) => {
  await openCatalogAndWaitReady(page)

  if (IS_REAL) {
    await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
  } else {
    const addToCart = page.locator('[data-testid="add-to-cart-circle-btn"]').first()
    await addToCart.waitFor({ timeout: 10000 })
    await addToCart.click()
    await page.goto('/cart')
    await expect(page.locator('main')).toBeVisible()
  }
})

test('cart page is accessible', async ({ page }) => {
  await page.goto('/cart')
  await expect(page).not.toHaveURL(/signin/)
})

test('favourites page is accessible', async ({ page }) => {
  await page.goto('/favourites')
  await expect(page).not.toHaveURL(/signin/)
})

test('profile page is accessible', async ({ page }) => {
  await page.goto('/profile')
  await expect(page).not.toHaveURL(/signin/)
})
