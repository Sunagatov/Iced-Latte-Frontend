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

async function loginAndGoto(page: Page, route: string) {
  await page.goto('http://localhost:3000')
  await page.context().addCookies([{ name: 'token', value: FAKE_TOKEN, url: 'http://localhost:3000' }])
  await page.evaluate(
    (t) => localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: null, isLoggedIn: true }, version: 0 })),
    FAKE_TOKEN,
  )
  await page.goto(route)
}

test.beforeEach(async ({ page }) => {
  await mockProxy(page)
  await loginAndGoto(page, '/')
})

test('add product to cart', async ({ page }) => {
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  const addToCart = page.locator('button:has(img[src*="plus"])').first()
  await addToCart.waitFor({ timeout: 10000 })
  await addToCart.click()
  await page.goto('/cart')
  await expect(page.locator('main')).toBeVisible()
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
