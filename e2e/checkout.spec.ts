import { test, expect, type Page } from '@playwright/test'

const product = {
  id: 'p1',
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
const cartWithItem = {
  id: 'c1',
  userId: 'u1',
  items: [{ id: 'ci1', productInfo: product, productQuantity: 1 }],
  itemsQuantity: 1,
  itemsTotalPrice: 9.99,
  productsQuantity: 1,
  createdAt: '',
  closedAt: null,
}

async function setup(
  page: Page,
  { orderStatus = 200 }: { orderStatus?: number } = {},
) {
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/auth/session'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true, user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' } }),
      })
    else if (url.includes('/orders') && method === 'POST')
      await route.fulfill({
        status: orderStatus,
        contentType: 'application/json',
        body: JSON.stringify(
          orderStatus === 200 ? { id: 'order-1' } : { message: 'error' },
        ),
      })
    else if (url.includes('/orders'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    else if (url.includes('/cart'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(cartWithItem),
      })
    else if (url.includes('/addresses'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    else
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
  })
  await page.goto('http://localhost:3000')
  await page.evaluate((c) => {
    localStorage.setItem(
      'cart-storage',
      JSON.stringify({
        state: {
          itemsIds: c.items.map(
            (i: { productInfo: { id: string }; productQuantity: number }) => ({
              productId: i.productInfo.id,
              productQuantity: i.productQuantity,
            }),
          ),
          tempItems: c.items,
          count: c.itemsQuantity,
          totalPrice: c.itemsTotalPrice,
          isSync: true,
        },
        version: 0,
      }),
    )
  }, cartWithItem)
  await page.goto('/checkout')
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

test('guest visiting /checkout sees the page', async ({ page }) => {
  await page.route('**/api/proxy/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
  await page.goto('/checkout')
  await expect(page.locator('h1', { hasText: 'Checkout' })).toBeVisible({
    timeout: 8000,
  })
})

test('checkout form renders with required fields', async ({ page }) => {
  await setup(page)
  await expect(page.locator('#recipientName')).toBeVisible()
  await expect(page.locator('#recipientSurname')).toBeVisible()
  await expect(page.locator('#addressLine')).toBeVisible()
})

test('order summary shows cart item and total', async ({ page }) => {
  await setup(page)
  await expect(page.getByText('Test Coffee')).toBeVisible()
  await expect(page.locator('text=$9.99').first()).toBeVisible()
})

test('Place order button is present', async ({ page }) => {
  await setup(page)
  await expect(page.getByRole('button', { name: 'Place order' })).toBeVisible()
})

test('successful order submission redirects to /orders', async ({ page }) => {
  await setup(page)
  await fillForm(page)
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page).toHaveURL(/\/orders/, { timeout: 10000 })
})

test('API error on submit shows error message', async ({ page }) => {
  await setup(page, { orderStatus: 500 })
  await fillForm(page)
  await page.getByRole('button', { name: 'Place order' }).click()
  await expect(page.locator('.text-negative')).toBeVisible({ timeout: 8000 })
  await expect(page).not.toHaveURL(/\/orders/)
})

test('cart is cleared after successful order — cart-count badge gone', async ({
  page,
}) => {
  // Mock empty cart after order so AppInitProvider re-fetch returns 0 items
  let orderPlaced = false

  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/auth/session'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true, user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' } }),
      })
    else if (url.includes('/orders') && method === 'POST') {
      orderPlaced = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'order-1' }),
      })
    } else if (url.includes('/orders'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    else if (url.includes('/cart'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          orderPlaced
            ? {
              id: 'c1',
              userId: 'u1',
              items: [],
              itemsQuantity: 0,
              itemsTotalPrice: 0,
              productsQuantity: 0,
              createdAt: '',
              closedAt: null,
            }
            : cartWithItem,
        ),
      })
    else if (url.includes('/addresses'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    else
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
  })
  await page.goto('http://localhost:3000')
  await page.evaluate((c) => {
    localStorage.setItem(
      'cart-storage',
      JSON.stringify({
        state: {
          itemsIds: c.items.map(
            (i: { productInfo: { id: string }; productQuantity: number }) => ({
              productId: i.productInfo.id,
              productQuantity: i.productQuantity,
            }),
          ),
          tempItems: c.items,
          count: c.itemsQuantity,
          totalPrice: c.itemsTotalPrice,
          isSync: true,
        },
        version: 0,
      }),
    )
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
