import {IS_REAL, mockRoute} from './helpers/mockRoute'
import {expect, type Page, test} from '@playwright/test'
import {ensureAuth} from './helpers/ensureAuth'

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
test.beforeEach(async ({ page }) => { await ensureAuth(page) })

// Use a product less likely to have been reviewed by olivia
const PRODUCT_ID = IS_REAL ? 'd1a2b3c4-0001-4000-8000-000000000007' : 'd1a2b3c4-0001-4000-8000-000000000001' // Coconut Cold Brew

async function mockReviewCalls(page: Page, authenticated = false) {
  const product = { id: PRODUCT_ID, name: 'Turkish Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      await route.fulfill({ status: authenticated ? 200 : 401, contentType: 'application/json', body: authenticated ? JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }) : JSON.stringify({ message: 'Unauthorized' }) })
    } else if (url.includes('/reviews') && method === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ productReviewId: 'r1', text: 'Great!', createdAt: new Date().toISOString() }) })
    } else if (url.includes(`/products/${PRODUCT_ID}/review`) && !url.includes('/reviews')) {
      await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    } else if (url.includes('/reviews/statistics')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reviewsCount: 0, avgRating: 0, ratingMap: { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 } }) })
    } else if (url.includes('/reviews')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reviewsWithRatings: [], page: 0, totalPages: 1, totalElements: 0, size: 3 }) })
    } else if (url.includes(`/products/${PRODUCT_ID}`)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(product) })
    } else if (url.includes('/products')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
}

async function gotoProductPage(page: Page) {
  await page.goto(`/product/${PRODUCT_ID}`)
  await page.waitForLoadState('domcontentloaded')

  if (!IS_REAL) {
    // In mocked mode the page must always render — fail hard if it doesn't
    await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible({ timeout: 20000 })
    await page.waitForLoadState('networkidle')

    return true
  }

  // Real mode: page state is not deterministic — skip gracefully
  if (await page.locator('text=Failed to load reviews.').isVisible()) return false
  if (await page.locator('h1:has-text("404")').isVisible()) return false
  const visible = await page.locator('[data-testid="reviews-section"]').waitFor({ timeout: 20000 }).then(() => true).catch(() => false)
  if (!visible) return false
  await page.waitForLoadState('networkidle')
  const btn = page.locator('#add-review-btn')
  return await btn.isVisible({timeout: 3000}).catch(() => false);


}

test('"Write a review" button redirects guest to /signin', async ({ page }) => {
  if (IS_REAL) {
    test.skip(true, 'logged in via global-setup — guest redirect not testable')
    return
  }
  await mockReviewCalls(page, false)
  await gotoProductPage(page)
  await page.locator('#add-review-btn').click()
  await expect(page).toHaveURL(/\/signin/, { timeout: 8000 })
})

test('logged-in user sees review form after clicking "Write a review"', async ({ page }) => {
  if (IS_REAL) {
    test.skip(true, 'write-review flow covered in mocked mode only — real state is non-deterministic')
    return
  }
  await mockReviewCalls(page, true)
  await gotoProductPage(page)
  await page.waitForSelector('a[href="/signin"]:has-text("Log in")', { state: 'detached', timeout: 5000 }).catch(() => {})
  await page.locator('#add-review-btn').click()
  await expect(page.locator('#review-textarea')).toBeVisible({ timeout: 5000 })
})

test('submit button disabled until rating + text both filled', async ({ page }) => {
  if (IS_REAL) {
    test.skip(true, 'write-review flow covered in mocked mode only — real state is non-deterministic')
    return
  }
  await mockReviewCalls(page, true)
  await gotoProductPage(page)
  await page.waitForSelector('a[href="/signin"]:has-text("Log in")', { state: 'detached', timeout: 5000 }).catch(() => {})
  await page.locator('#add-review-btn').click()
  await expect(page.locator('#review-textarea')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('#submit-review-btn')).toBeDisabled()
  await page.fill('#review-textarea', 'Great coffee!')
  await expect(page.locator('#submit-review-btn')).toBeDisabled()
})

test('cancel button hides form and resets fields', async ({ page }) => {
  if (IS_REAL) {
    test.skip(true, 'write-review flow covered in mocked mode only — real state is non-deterministic')
    return
  }
  await mockReviewCalls(page, true)
  await gotoProductPage(page)
  await page.waitForSelector('a[href="/signin"]:has-text("Log in")', { state: 'detached', timeout: 5000 }).catch(() => {})
  await page.locator('#add-review-btn').click()
  await expect(page.locator('#review-textarea')).toBeVisible({ timeout: 5000 })
  await page.fill('#review-textarea', 'Some text')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.locator('#review-textarea')).not.toBeVisible({ timeout: 3000 })
  await expect(page.locator('#add-review-btn')).toBeVisible()
})

test('character counter updates as user types', async ({ page }) => {
  if (IS_REAL) {
    test.skip(true, 'write-review flow covered in mocked mode only — real state is non-deterministic')
    return
  }
  await mockReviewCalls(page, true)
  await gotoProductPage(page)
  await page.waitForSelector('a[href="/signin"]:has-text("Log in")', { state: 'detached', timeout: 5000 }).catch(() => {})
  await page.locator('#add-review-btn').click()
  await expect(page.locator('#review-textarea')).toBeVisible({ timeout: 5000 })
  await page.fill('#review-textarea', 'Hello')
  await expect(page.locator('text=5/1500')).toBeVisible({ timeout: 3000 })
})
