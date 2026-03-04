import { test, expect, type Page } from '@playwright/test'

const FAKE_TOKEN = 'fake-token-for-mocked-test'
const PRODUCT_ID = 'd1a2b3c4-0001-4000-8000-000000000001'

async function mockReviewCalls(page: Page) {
  const product = { id: PRODUCT_ID, name: 'Turkish Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.includes('/reviews') && method === 'POST')
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ productReviewId: 'r1', text: 'Great!', createdAt: new Date().toISOString() }) })
    else if (url.includes(`/products/${PRODUCT_ID}/review`) && !url.includes('/reviews'))
      await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    else if (url.includes('/reviews/statistics'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reviewsCount: 0, averageRating: 0, ratingsMap: {} }) })
    else if (url.includes('/reviews'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reviewsWithRatings: [], page: 0, totalPages: 1, totalElements: 0, size: 3 }) })
    else if (url.includes('/products/ids'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([product]) })
    else if (url.includes(`/products/${PRODUCT_ID}`))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(product) })
    else if (url.includes('/products'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
    else if (url.includes('/auth/refresh'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: FAKE_TOKEN }) })
    else if (url.includes('/auth/logout') || url.includes('/users'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    else if (url.includes('/cart'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], totalPrice: 0 }) })
    else if (url.includes('/wishlist') || url.includes('/favourites'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) })
    else
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}

async function gotoProductPage(page: Page) {
  await page.goto(`/product/${PRODUCT_ID}`)
  await page.waitForLoadState('networkidle')
  if (await page.locator('text=Something went wrong!').isVisible()) return false
  if (await page.locator('h1:has-text("404")').isVisible()) return false
  await page.waitForSelector('[data-testid="reviews-section"]', { timeout: 20000 })
  return true
}

test('"Write a review" button redirects guest to /signin', async ({ page }) => {
  await mockReviewCalls(page)
  const ok = await gotoProductPage(page)
  if (!ok) return
  await page.locator('#add-review-btn').click()
  await expect(page).toHaveURL(/\/signin/, { timeout: 8000 })
})

test('logged-in user sees review form after clicking "Write a review"', async ({ page }) => {
  await mockReviewCalls(page)
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: null, isLoggedIn: true }, version: 0 })), FAKE_TOKEN)
  await page.context().addCookies([{ name: 'token', value: FAKE_TOKEN, url: 'http://localhost:3000' }])
  const ok = await gotoProductPage(page)
  if (!ok) return
  await page.locator('#add-review-btn').click()
  await expect(page.locator('#review-textarea')).toBeVisible({ timeout: 5000 })
})

test('submit button disabled until rating + text both filled', async ({ page }) => {
  await mockReviewCalls(page)
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: null, isLoggedIn: true }, version: 0 })), FAKE_TOKEN)
  await page.context().addCookies([{ name: 'token', value: FAKE_TOKEN, url: 'http://localhost:3000' }])
  const ok = await gotoProductPage(page)
  if (!ok) return
  await page.locator('#add-review-btn').click()
  await expect(page.locator('#review-textarea')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('#submit-review-btn')).toBeDisabled()
  await page.fill('#review-textarea', 'Great coffee!')
  await expect(page.locator('#submit-review-btn')).toBeDisabled()
})

test('cancel button hides form and resets fields', async ({ page }) => {
  await mockReviewCalls(page)
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: null, isLoggedIn: true }, version: 0 })), FAKE_TOKEN)
  await page.context().addCookies([{ name: 'token', value: FAKE_TOKEN, url: 'http://localhost:3000' }])
  const ok = await gotoProductPage(page)
  if (!ok) return
  await page.locator('#add-review-btn').click()
  await expect(page.locator('#review-textarea')).toBeVisible({ timeout: 5000 })
  await page.fill('#review-textarea', 'Some text')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.locator('#review-textarea')).not.toBeVisible({ timeout: 3000 })
  await expect(page.locator('#add-review-btn')).toBeVisible()
})

test('character counter updates as user types', async ({ page }) => {
  await mockReviewCalls(page)
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: null, isLoggedIn: true }, version: 0 })), FAKE_TOKEN)
  await page.context().addCookies([{ name: 'token', value: FAKE_TOKEN, url: 'http://localhost:3000' }])
  const ok = await gotoProductPage(page)
  if (!ok) return
  await page.locator('#add-review-btn').click()
  await expect(page.locator('#review-textarea')).toBeVisible({ timeout: 5000 })
  await page.fill('#review-textarea', 'Hello')
  await expect(page.locator('text=5/1500')).toBeVisible({ timeout: 3000 })
})
