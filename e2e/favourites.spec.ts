import { test, expect, type Page } from '@playwright/test'

const FAKE_TOKEN = 'fake-token-for-mocked-test'
const FAKE_PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

async function mockProxy(page: Page) {
  const product = makeProduct(FAKE_PRODUCT_ID)
  const productsList = { products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(productsList) })
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

test('favourites page is accessible when logged in', async ({ page }) => {
  await mockProxy(page)
  await login(page)
  await page.goto('/favourites')
  await expect(page).not.toHaveURL(/signin/, { timeout: 10000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
})

test('heart icon on product card is visible', async ({ page }) => {
  await mockProxy(page)
  await login(page)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await expect(page.locator('[data-testid="favourite-btn"]').first()).toBeVisible()
})

test('clicking heart toggles favourite state', async ({ page }) => {
  const product = makeProduct(FAKE_PRODUCT_ID)
  const productsList = { products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(productsList) })
    } else if (url.includes('/favorites')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product] }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
  await login(page)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  const heartBtn = page.locator('[data-testid="favourite-btn"]').first()
  await heartBtn.waitFor({ timeout: 10000 })
  const before = await heartBtn.getAttribute('data-active')
  await heartBtn.click()
  await expect(heartBtn).toHaveAttribute('data-active', before === 'true' ? 'false' : 'true', { timeout: 5000 })
  const after = await heartBtn.getAttribute('data-active')
  expect(after).not.toBe(before)
})
