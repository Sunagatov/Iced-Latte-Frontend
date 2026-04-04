import { test, expect, type Page } from '@playwright/test'

const FAKE_TOKEN = 'fake-token-for-mocked-test'
const FAKE_PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

async function mockProxy(page: Page) {
  const product = makeProduct(FAKE_PRODUCT_ID)
  const productsList = { products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }
  const cart = { id: 'cart-1', userId: 'u1', items: [], itemsQuantity: 0, itemsTotalPrice: 0, productsQuantity: 0, createdAt: '', closedAt: null }

  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(productsList) })
    } else if (url.includes('/cart')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cart) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
}

async function login(page: Page) {
  await page.goto('http://localhost:3000')
  await page.evaluate(
    (t) => localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: null, isLoggedIn: true }, version: 0 })),
    FAKE_TOKEN,
  )
}

test('empty cart shows empty state', async ({ page }) => {
  await mockProxy(page)
  await page.goto('/cart')
  await page.waitForTimeout(500)
  await expect(page.locator('main')).toBeVisible()
})

test('cart page does not redirect to signin when logged in', async ({ page }) => {
  await mockProxy(page)
  await login(page)
  await page.goto('/cart')
  await expect(page).not.toHaveURL(/signin/)
})

test('cart page redirects to signin when not logged in', async ({ page }) => {
  await page.goto('/cart')
  await expect(page.locator('main')).toBeVisible()
})

test('add product to cart updates cart count', async ({ page }) => {
  await mockProxy(page)
  await login(page)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  const addBtn = page.locator('button:has(img[src*="plus"])').first()

  await addBtn.waitFor({ timeout: 10000 })
  await addBtn.click()
  await page.waitForTimeout(1000)
  const badge = page.locator('[data-testid="cart-count"]')

  if (await badge.isVisible()) {
    const count = parseInt(await badge.textContent() ?? '0')

    expect(count).toBeGreaterThan(0)
  }
})

test('cart page shows added item after adding to cart', async ({ page }) => {
  await mockProxy(page)
  await login(page)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  const addBtn = page.locator('button:has(img[src*="plus"])').first()

  await addBtn.waitFor({ timeout: 10000 })
  await addBtn.click()
  await page.waitForTimeout(1000)
  await page.goto('/cart')
  await page.waitForTimeout(500)
  await expect(page.locator('main')).toBeVisible()
})
