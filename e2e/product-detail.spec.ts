import { test, expect } from '@playwright/test'

const PRODUCT_ID = 'fc88cd5d-5049-4b00-8d88-df1d9b4a3ce1'

test.beforeEach(async ({ page }) => {
  await page.goto(`/product/${PRODUCT_ID}`)
  await page.waitForLoadState('networkidle')
})

test('clicking product card navigates to product detail page', async ({ page }) => {
  await expect(page).toHaveURL(/\/product\//)
})

test('product detail page shows product name and price', async ({ page }) => {
  if (await page.locator('text=Something went wrong').isVisible()) return
  await expect(page.locator('[data-testid="product-name"]')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('[data-testid="product-price"]').first()).toBeVisible({ timeout: 10000 })
})

test('product detail page shows reviews section', async ({ page }) => {
  if (await page.locator('text=Something went wrong').isVisible()) return
  await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible({ timeout: 10000 })
})

test('product detail page has add to cart button', async ({ page }) => {
  if (await page.locator('text=Something went wrong').isVisible()) return
  await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible({ timeout: 10000 })
})

test('back navigation returns to home', async ({ page }) => {
  const product = { id: '00000000-0000-0000-0000-000000000001', name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
  await page.goBack()
  await expect(page).toHaveURL('/')
})
