import { test, expect, type Page } from '@playwright/test'

const FAKE_TOKEN = 'fake-token-for-mocked-test'
const PRODUCT_ID = 'fc88cd5d-5049-4b00-8d88-df1d9b4a3ce1'

async function mockReviewCalls(page: Page) {
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.includes('/reviews') && method === 'POST')
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ productReviewId: 'r1', text: 'Great!', createdAt: new Date().toISOString() }) })
    else if (url.includes('/reviews'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [], totalElements: 0, totalPages: 0 }) })
    else if (url.includes('/rating'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    else if (url.includes('/auth/refresh'))
      await route.fulfill({ status: 401, contentType: 'application/json', body: '{}' })
    else if (url.includes('/auth/logout') || url.includes('/cart') || url.includes('/favourites') || url.includes('/wishlist') || url.includes('/users'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    else
      await route.fallback()
  })
}

async function gotoProductPage(page: Page) {
  await page.goto(`/product/${PRODUCT_ID}`)
  if (await page.locator('text=Something went wrong').isVisible()) return false
  await page.waitForSelector('[data-testid="reviews-section"]', { timeout: 20000 })
  return true
}

test('"Write a review" button redirects guest to /signin', async ({ page }) => {
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
