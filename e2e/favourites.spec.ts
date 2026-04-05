import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'

test.beforeEach(() => { test.skip(IS_REAL, 'mocked-only') })

const FAKE_PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

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

const FAKE_USER = { firstName: 'Test', lastName: 'User', email: 'test@example.com' }

async function mockProxy(page: Page, authenticated = false) {
  const product = makeProduct(FAKE_PRODUCT_ID)
  const productsList = {
    products: [product],
    page: 0,
    size: 6,
    totalElements: 1,
    totalPages: 1,
  }

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      if (authenticated) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({"id":"u1","firstName":"Test","lastName":"User","email":"test@example.com","phoneNumber":null,"birthDate":null,"address":null}) })
      } else {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
      }
    } else if (url.includes('/products') && !url.includes('/ids')) {
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

test('favourites page is accessible when logged in', async ({ page }) => {
  await mockProxy(page, true)
  await page.goto('/favourites')
  await expect(page).not.toHaveURL(/signin/, { timeout: 10000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
})

test('heart icon on product card is visible', async ({ page }) => {
  await mockProxy(page, true)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await expect(
    page.locator('[data-testid="favourite-btn"]').first(),
  ).toBeVisible()
})

test('clicking heart toggles favourite state', async ({ page }) => {
  const product = makeProduct(FAKE_PRODUCT_ID)
  const productsList = {
    products: [product],
    page: 0,
    size: 6,
    totalElements: 1,
    totalPages: 1,
  }
  let favRemoved = false

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({"id":"u1","firstName":"Test","lastName":"User","email":"test@example.com","phoneNumber":null,"birthDate":null,"address":null}),
      })
    } else if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsList),
      })
    } else if (url.includes('/favorites') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [product] }),
      })
    } else if (url.includes('/favorites') && method === 'DELETE') {
      favRemoved = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] }),
      })
    } else if (url.includes('/favorites')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] }),
      })
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    }
  })
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  const heartBtn = page.locator('[data-testid="favourite-btn"]').first()

  await heartBtn.waitFor({ timeout: 10000 })
  // Wait for AppInitProvider to finish syncing favourites
  await page.waitForTimeout(500)
  const before = await heartBtn.getAttribute('data-active')

  await heartBtn.click()
  await page.waitForTimeout(500)
  await expect(heartBtn).toHaveAttribute(
    'data-active',
    before === 'true' ? 'false' : 'true',
    { timeout: 5000 },
  )
  const after = await heartBtn.getAttribute('data-active')

  expect(after).not.toBe(before)
})
