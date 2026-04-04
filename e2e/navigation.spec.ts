import { test, expect, type Page } from '@playwright/test'

function makeProduct(id: string) {
  return {
    id,
    name: 'Test Coffee',
    price: 9.99,
    productFileUrl: null,
    brandName: 'Brand',
    sellerName: 'Seller',
    averageRating: 4.5,
    reviewsCount: 1,
    quantity: 250,
    description: 'desc',
    active: true,
  }
}

async function mockProducts(page: Page) {
  const productsList = {
    products: [makeProduct('00000000-0000-0000-0000-000000000001')],
    page: 0,
    size: 6,
    totalElements: 1,
    totalPages: 1,
  }

  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsList),
      })
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    }
  })
}

test('header is visible on home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header')).toBeVisible()
})

test('header is visible on signin page', async ({ page }) => {
  await page.goto('/signin')
  await expect(page.locator('header')).toBeVisible()
})

test('signin page renders form', async ({ page }) => {
  await page.goto('/signin')
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
  await expect(page.locator('#login-btn')).toBeVisible()
})

test('signup page renders form', async ({ page }) => {
  await page.goto('/signup')
  await expect(page.locator('#firstName')).toBeVisible()
  await expect(page.locator('#lastName')).toBeVisible()
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
  await expect(page.locator('#register-btn')).toBeVisible()
})

test('forgot password page renders email input', async ({ page }) => {
  await page.goto('/forgotpass')
  await expect(page.locator('input[type="email"]')).toBeVisible({
    timeout: 5000,
  })
})

test('profile page redirects to signin when not logged in', async ({
  page,
}) => {
  await page.goto('/profile')
  await expect(page).toHaveURL(/signin/, { timeout: 5000 })
})

test('orders page is accessible when not logged in', async ({ page }) => {
  await page.goto('/orders')
  await expect(page.locator('main')).toBeVisible({ timeout: 5000 })
})

test('signin link on signup page navigates to signin', async ({ page }) => {
  await page.goto('/signup')
  await page.getByRole('link', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/signin/, { timeout: 5000 })
})

test('signup link on signin page navigates to signup', async ({ page }) => {
  await page.goto('/signin')
  await page.getByRole('link', { name: /sign up/i }).click()
  await expect(page).toHaveURL(/signup/, { timeout: 5000 })
})

test('catalog section is visible on home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#catalog')).toBeVisible({ timeout: 10000 })
})

test('product cards are visible on home page', async ({ page }) => {
  await mockProducts(page)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  const count = await page.locator('[data-testid="product-card"]').count()

  expect(count).toBeGreaterThan(0)
})
