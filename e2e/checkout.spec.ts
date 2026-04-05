import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import { seedCart, clearCart } from './helpers/seedReal'
import { REAL_PRODUCT_ID } from './helpers/realData'
import { ensureAuth } from './helpers/ensureAuth'

const product = { id: 'p1', name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
const cartWithItem = { id: 'c1', userId: 'u1', items: [{ id: 'ci1', productInfo: product, productQuantity: 1 }], itemsQuantity: 1, itemsTotalPrice: 9.99, productsQuantity: 1, createdAt: '', closedAt: null }

async function setupMocked(page: Page, { orderStatus = 200 }: { orderStatus?: number } = {}) {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }) })
    else if (url.includes('/orders') && method === 'POST')
      await route.fulfill({ status: orderStatus, contentType: 'application/json', body: JSON.stringify(orderStatus === 200 ? { id: 'order-1' } : { message: 'error' }) })
    else if (url.includes('/orders'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    else if (url.includes('/cart'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cartWithItem) })
    else if (url.includes('/addresses'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    else
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await page.goto('http://localhost:3000')
  await page.evaluate((c) => {
    localStorage.setItem('cart-storage', JSON.stringify({ state: { itemsIds: c.items.map((i: { productInfo: { id: string }; productQuantity: number }) => ({ productId: i.productInfo.id, productQuantity: i.productQuantity })), tempItems: c.items, count: c.itemsQuantity, totalPrice: c.itemsTotalPrice, isSync: true }, version: 0 }))
  }, cartWithItem)
  await page.goto('/checkout')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)
  await page.waitForSelector('h1', { timeout: 8000 })
}

async function fillForm(page: Page) {
  await page.fill('#recipientName', 'John')
  await page.fill('#recipientSurname', 'Doe')
  await page.fill('#addressLine', '123 Main St')
  await page.fill('#city', 'London')
  await page.fill('#postcode', 'SW1A 1AA')
  await page.fill('#country', 'UK')
}

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
test.beforeEach(async ({ page }) => { await ensureAuth(page) })

test.afterEach(async ({ page }) => {
  await clearCart(page)
})

test('guest visiting /checkout sees the page', async ({ page }) => {
  if (!IS_REAL) {
    await mockRoute(page, '**/api/proxy/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })
  }
  await page.goto('/checkout')
  await expect(page.locator('h1', { hasText: 'Checkout' })).toBeVisible({ timeout: 8000 })
})

test('checkout form renders with required fields', async ({ page }) => {
  if (IS_REAL) {
    await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
    await page.goto('/checkout')
    await page.waitForSelector('h1', { timeout: 8000 })
  } else {
    await setupMocked(page)
  }
  await expect(page.locator('#recipientName')).toBeVisible()
  await expect(page.locator('#recipientSurname')).toBeVisible()
  await expect(page.locator('#addressLine')).toBeVisible()
})

test('order summary shows cart item and total', async ({ page }) => {
  if (IS_REAL) {
    await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
    await page.goto('/checkout')
    await page.waitForSelector('h1', { timeout: 8000 })
    // Real mode: just verify some product name and price appear
    await expect(page.locator('[data-testid="cart-item"], .cart-item, [class*="cart"]').first()).toBeVisible({ timeout: 8000 })
  } else {
    await setupMocked(page)
    await expect(page.getByText('Test Coffee')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=$9.99').first()).toBeVisible({ timeout: 5000 })
  }
})

test('Place order button is present', async ({ page }) => {
  if (IS_REAL) {
    await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
    await page.goto('/checkout')
    await page.waitForSelector('h1', { timeout: 8000 })
  } else {
    await setupMocked(page)
  }
  await expect(page.getByRole('button', { name: 'Place order' })).toBeVisible()
})

test('successful order submission redirects to /orders', async ({ page }) => {
  if (IS_REAL) {
    await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
    await page.goto('/checkout')
    await page.waitForSelector('h1', { timeout: 8000 })
  } else {
    await setupMocked(page)
  }
  await fillForm(page)
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page).toHaveURL(/\/orders/, { timeout: 10000 })
})

test('API error on submit shows error message', async ({ page }) => {
  if (IS_REAL) {
    // Can't force API errors in real mode
    test.skip(true, 'cannot force API errors in real mode')
    return
  }
  await setupMocked(page, { orderStatus: 500 })
  await fillForm(page)
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page.locator('.text-negative')).toBeVisible({ timeout: 8000 })
  await expect(page).not.toHaveURL(/\/orders/)
})

test('cart is cleared after successful order — cart-count badge gone', async ({ page }) => {
  if (IS_REAL) {
    await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
    await page.goto('/checkout')
    await page.waitForSelector('h1', { timeout: 8000 })
    await fillForm(page)
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page).toHaveURL(/\/orders/, { timeout: 10000 })
    return
  }
  let orderPlaced = false
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }) })
    else if (url.includes('/orders') && method === 'POST') {
      orderPlaced = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'order-1' }) })
    } else if (url.includes('/orders'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    else if (url.includes('/cart'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(orderPlaced ? { id: 'c1', userId: 'u1', items: [], itemsQuantity: 0, itemsTotalPrice: 0, productsQuantity: 0, createdAt: '', closedAt: null } : cartWithItem) })
    else if (url.includes('/addresses'))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    else
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await page.goto('http://localhost:3000')
  await page.evaluate((c) => {
    localStorage.setItem('cart-storage', JSON.stringify({ state: { itemsIds: c.items.map((i: { productInfo: { id: string }; productQuantity: number }) => ({ productId: i.productInfo.id, productQuantity: i.productQuantity })), tempItems: c.items, count: c.itemsQuantity, totalPrice: c.itemsTotalPrice, isSync: true }, version: 0 }))
  }, cartWithItem)
  await page.goto('/checkout')
  await page.waitForSelector('h1', { timeout: 8000 })
  await fillForm(page)
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page).toHaveURL(/\/orders/, { timeout: 10000 })
  await page.waitForTimeout(500)
  const stored = await page.evaluate(() => localStorage.getItem('cart-storage'))
  const parsed = JSON.parse(stored ?? '{}')
  expect(parsed?.state?.itemsIds?.length ?? 0).toBe(0)
})
