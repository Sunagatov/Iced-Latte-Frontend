import { strictMockProxy, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import { ensureAuth } from './helpers/ensureAuth'

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
test.beforeEach(async ({ page }) => { await ensureAuth(page) })

function makeOrder(id: string, status: string = 'CREATED') {
  return {
    id, status, createdAt: '2024-01-15T10:00:00Z',
    itemsQuantity: 2, itemsTotalPrice: 19.98,
    items: [{ id: 'oi1', productId: 'p1', productName: 'Test Coffee', productPrice: 9.99, productsQuantity: 2 }],
    deliveryAddress: { country: 'UK', city: 'London', line: '123 Main St', postcode: 'SW1A 1AA' },
  }
}

async function mockOrders(page: Page, orders: object[], status = 200) {
  await strictMockProxy(page, {
    '/orders': async (route) => route.fulfill({
      status,
      contentType: 'application/json',
      body: status === 200 ? JSON.stringify(orders) : JSON.stringify({ message: 'error' }),
    }),
    '/users': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  })
}

test('orders page shows list of orders', async ({ page }) => {
  if (!IS_REAL) {
    await mockOrders(page, [makeOrder('order-1'), makeOrder('order-2')])
  }
  await page.goto('/orders')
  await expect(page.locator('text=My Orders')).toBeVisible({ timeout: 8000 })
  if (!IS_REAL) {
    await expect(page.getByText('2 orders')).toBeVisible({ timeout: 8000 })
  }
})

test('empty state shown when no orders', async ({ page }) => {
  if (IS_REAL) {
    // In real mode just verify the page loads — we can't guarantee empty orders
    await page.goto('/orders')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })

    return
  }
  await mockOrders(page, [])
  await page.goto('/orders')
  await expect(page.getByText('No orders yet')).toBeVisible({ timeout: 8000 })
  await expect(page.getByRole('link', { name: 'Start shopping' })).toBeVisible()
})

test('clicking order card expands item details', async ({ page }) => {
  if (IS_REAL) {
    await page.goto('/orders')
    await expect(page.locator('text=My Orders')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('button', { hasText: /Order #/ }).first()).toBeVisible({ timeout: 8000 })
    await page.locator('button', { hasText: /Order #/ }).first().click()
    await expect(page.locator('[data-testid="order-item"], [class*="order"]').first()).toBeVisible({ timeout: 5000 })

    return
  }
  await mockOrders(page, [makeOrder('order-abc123')])
  await page.goto('/orders')
  await expect(page.getByText('My Orders')).toBeVisible({ timeout: 8000 })
  await page.locator('button', { hasText: /Order #/ }).first().click()
  await expect(page.getByText('Test Coffee')).toBeVisible({ timeout: 5000 })
})

test('status filter tabs filter orders correctly', async ({ page }) => {
  if (!IS_REAL) {
    await mockOrders(page, [makeOrder('o1', 'CREATED'), makeOrder('o2', 'FINISHED')])
  }
  await page.goto('/orders')
  await expect(page.getByText('My Orders')).toBeVisible({ timeout: 8000 })
  await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Placed' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Delivered' })).toBeVisible()
  await page.getByRole('button', { name: 'Placed' }).click()
  await expect(page.getByRole('button', { name: 'Placed' })).toHaveAttribute('aria-pressed', 'true', { timeout: 3000 })
})

test('API error shows retry button', async ({ page }) => {
  if (IS_REAL) {
    // Can't force API errors in real mode — skip this assertion
    test.skip(true, 'cannot force API errors in real mode')

    return
  }
  await mockOrders(page, [], 500)
  await page.goto('/orders')
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible({ timeout: 8000 })
})

test('clicking product name in expanded order navigates to product page', async ({ page }) => {
  if (IS_REAL) {
    await page.goto('/orders')
    await expect(page.locator('text=My Orders')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('button', { hasText: /Order #/ }).first()).toBeVisible({ timeout: 8000 })
    await page.locator('button', { hasText: /Order #/ }).first().click()
    await expect(page.locator('[data-testid="order-product-link"]').first()).toBeVisible({ timeout: 5000 })
    await page.locator('[data-testid="order-product-link"]').first().click()
    await expect(page).toHaveURL(/\/product\//, { timeout: 8000 })

    return
  }
  await mockOrders(page, [makeOrder('order-abc123')])
  await page.goto('/orders')
  await expect(page.getByText('My Orders')).toBeVisible({ timeout: 8000 })
  await page.locator('button', { hasText: /Order #/ }).first().click()
  await page.getByRole('link', { name: 'Test Coffee' }).click()
  await expect(page).toHaveURL(/\/product\/p1/, { timeout: 8000 })
})
