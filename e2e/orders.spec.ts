import { mockRoute } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'

const FAKE_TOKEN = 'fake-token-for-mocked-test'

function makeOrder(id: string, status: string = 'CREATED') {
  return {
    id,
    status,
    createdAt: '2024-01-15T10:00:00Z',
    itemsQuantity: 2,
    itemsTotalPrice: 19.98,
    items: [
      {
        id: 'oi1',
        productId: 'p1',
        productName: 'Test Coffee',
        productPrice: 9.99,
        productsQuantity: 2,
      },
    ],
    deliveryAddress: {
      country: 'UK',
      city: 'London',
      line: '123 Main St',
      postcode: 'SW1A 1AA',
    },
  }
}

async function mockOrders(page: Page, orders: object[], status = 200) {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/orders')) {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body:
          status === 200
            ? JSON.stringify(orders)
            : JSON.stringify({ message: 'error' }),
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

async function loginAndGoto(page: Page, route: string) {
  await page.goto('http://localhost:3000')
  await page.evaluate(
    (t) =>
      localStorage.setItem(
        'token',
        JSON.stringify({
          state: { token: t, refreshToken: null, isLoggedIn: true },
          version: 0,
        }),
      ),
    FAKE_TOKEN,
  )
  await page.goto(route)
}

test('orders page shows list of orders', async ({ page }) => {
  await mockOrders(page, [makeOrder('order-1'), makeOrder('order-2')])
  await loginAndGoto(page, '/orders')
  await expect(page.locator('text=My Orders')).toBeVisible({ timeout: 8000 })
  await expect(page.getByText('2 orders')).toBeVisible({ timeout: 8000 })
})

test('empty state shown when no orders', async ({ page }) => {
  await mockOrders(page, [])
  await loginAndGoto(page, '/orders')
  await expect(page.getByText('No orders yet')).toBeVisible({ timeout: 8000 })
  await expect(page.getByRole('link', { name: 'Start shopping' })).toBeVisible()
})

test('clicking order card expands item details', async ({ page }) => {
  await mockOrders(page, [makeOrder('order-abc123')])
  await loginAndGoto(page, '/orders')
  await expect(page.getByText('My Orders')).toBeVisible({ timeout: 8000 })
  // Order card button contains "Order #" prefix
  await page
    .locator('button', { hasText: /Order #/ })
    .first()
    .click()
  await expect(page.getByText('Test Coffee')).toBeVisible({ timeout: 5000 })
})

test('status filter tabs filter orders correctly', async ({ page }) => {
  await mockOrders(page, [
    makeOrder('o1', 'CREATED'),
    makeOrder('o2', 'FINISHED'),
  ])
  await loginAndGoto(page, '/orders')
  await expect(page.getByText('My Orders')).toBeVisible({ timeout: 8000 })
  const filterBar = page.locator('div.mb-5')

  await expect(filterBar.getByRole('button', { name: 'All' })).toBeVisible()
  await expect(filterBar.getByRole('button', { name: 'Placed' })).toBeVisible()
  await expect(
    filterBar.getByRole('button', { name: 'Delivered' }),
  ).toBeVisible()
  await filterBar.getByRole('button', { name: 'Placed' }).click()
  await page.waitForTimeout(300)
  await expect(filterBar.getByRole('button', { name: 'Placed' })).toHaveClass(
    /bg-brand/,
    { timeout: 3000 },
  )
})

test('API error shows retry button', async ({ page }) => {
  await mockOrders(page, [], 500)
  await loginAndGoto(page, '/orders')
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible({
    timeout: 8000,
  })
})

test('clicking product name in expanded order navigates to product page', async ({
  page,
}) => {
  await mockOrders(page, [makeOrder('order-abc123')])
  await loginAndGoto(page, '/orders')
  await expect(page.getByText('My Orders')).toBeVisible({ timeout: 8000 })
  await page
    .locator('button', { hasText: /Order #/ })
    .first()
    .click()
  await page.getByRole('link', { name: 'Test Coffee' }).click()
  await expect(page).toHaveURL(/\/product\/p1/, { timeout: 8000 })
})
