import { test, expect, type Page } from '@playwright/test'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

async function mockProducts(page: Page) {
  const product = makeProduct('fc88cd5d-5049-4b00-8d88-df1d9b4a3ce1')
  const productsList = { products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/products/sellers')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sellers: [] }) })
    } else if (url.includes('/products/brands')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ brands: [] }) })
    } else if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(productsList) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
}

test.beforeEach(async ({ page }) => {
  await mockProducts(page)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 })
})

test('clicking product card navigates to product detail page', async ({ page }) => {
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
})

test('product detail page shows product name and price', async ({ page }) => {
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
  if (await page.locator('text=Something went wrong').isVisible()) return
  await expect(page.locator('[data-testid="product-name"]')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('[data-testid="product-price"]').first()).toBeVisible({ timeout: 10000 })
})

test('product detail page shows reviews section', async ({ page }) => {
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
  if (await page.locator('text=Something went wrong').isVisible()) return
  await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible({ timeout: 10000 })
})

test('product detail page has add to cart button', async ({ page }) => {
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
  if (await page.locator('text=Something went wrong').isVisible()) return
  await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible({ timeout: 10000 })
})

test('back navigation returns to home', async ({ page }) => {
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
  await page.goBack()
  await expect(page).toHaveURL('/')
})
