import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { test, expect } from '@playwright/test'
import { REAL_PRODUCT_ID_WITH_REVIEWS } from './helpers/realData'

const PRODUCT_ID = IS_REAL ? REAL_PRODUCT_ID_WITH_REVIEWS : 'd1a2b3c4-0001-4000-8000-000000000001'

const mockedProduct = {
  id: PRODUCT_ID,
  name: 'Test Coffee',
  price: 9.99,
  productFileUrl: null,
  brandName: 'Brand',
  sellerName: 'Seller',
  averageRating: 4.5,
  reviewsCount: 3,
  quantity: 250,
  description: 'A great coffee.',
  active: true,
}

async function mockProductDetailApi(page: Parameters<typeof mockRoute>[0]) {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/reviews/statistics')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reviewsCount: 3, avgRating: 4.5, ratingMap: { star5: 2, star4: 1, star3: 0, star2: 0, star1: 0 } }) })
    } else if (url.includes('/reviews') && method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reviewsWithRatings: [], page: 0, totalPages: 1, totalElements: 0, size: 3 }) })
    } else if (url.includes(`/products/${PRODUCT_ID}/review`)) {
      await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    } else if (url.includes(`/products/${PRODUCT_ID}`)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockedProduct) })
    } else if (url.includes('/products')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [mockedProduct], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
    } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
}

test.beforeEach(async ({ page }) => {
  if (!IS_REAL) await mockProductDetailApi(page)
  await page.goto(`/product/${PRODUCT_ID}`)
  await page.waitForLoadState('networkidle')
})

test('clicking product card navigates to product detail page', async ({ page }) => {
  await expect(page).toHaveURL(/\/product\//)
})

test('product detail page shows product name and price', async ({ page }) => {
  await expect(page.locator('[data-testid="product-name"]')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-testid="product-price"]').first()).toBeVisible()
})

test('product detail page shows reviews section', async ({ page }) => {
  await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible({ timeout: 20000 })
})

test('product detail page has add to cart button', async ({ page }) => {
  await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible({ timeout: 10000 })
})

test('back navigation returns to home', async ({ page }) => {
  if (!IS_REAL) {
    await mockRoute(page, '**/api/proxy/**', async (route) => {
      const url = route.request().url()

      if (url.includes('/products') && !url.includes('/ids')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [mockedProduct], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })
  }
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 10000 })
  await page.goBack()
  await expect(page).toHaveURL('/')
})
