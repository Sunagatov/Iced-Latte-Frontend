import { strictMockProxy } from '../helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import type { Route } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const PRODUCT_A = '00000000-0000-0000-0000-000000000001'
const PRODUCT_B = '00000000-0000-0000-0000-000000000002'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

function makeCart(items: object[]) {
  const productsQuantity = (items as { productQuantity: number }[]).reduce((s, i) => s + i.productQuantity, 0)

  return { id: 'cart-uuid-1', userId: 'user-uuid-1', items, itemsQuantity: items.length, itemsTotalPrice: productsQuantity * 9.99, productsQuantity, createdAt: '2024-01-01T00:00:00Z', closedAt: null }
}

function makeCartItem(productId: string, qty = 1) {
  return { id: `slot-${productId}`, productInfo: makeProduct(productId), productQuantity: qty }
}

function unauthHandler(): (route: Route) => Promise<void> {
  return async (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
}

async function setCartStorage(page: Page, items: { productId: string; productQuantity: number }[]) {
  const count = items.reduce((s, i) => s + i.productQuantity, 0)

  await page.evaluate(
    ([ids, c]) => {
      localStorage.setItem('cart-storage', JSON.stringify({
        state: { itemsIds: ids, tempItems: [], count: c, totalPrice: 0, isSync: false },
        version: 0,
      }))
    },
    [items, count] as [object[], number],
  )
}

async function setFavStorage(page: Page, ids: string[]) {
  await page.evaluate((favouriteIds) => {
    localStorage.setItem('fav-storage', JSON.stringify({
      state: { favouriteIds, favourites: [] },
      version: 0,
    }))
  }, ids)
}

test('cart badge shows total product units from persisted count', async ({ page }) => {
  await strictMockProxy(page, {
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) }),
    '/users': unauthHandler(),
  })
  await page.goto('/')
  await setCartStorage(page, [
    { productId: PRODUCT_A, productQuantity: 3 },
    { productId: PRODUCT_B, productQuantity: 2 },
  ])
  await page.reload()
  await expect(page.locator('[data-testid="header-cart-badge"]')).toHaveText('5', { timeout: 8000 })
})

test('favourites badge shows favouriteIds.length', async ({ page }) => {
  await strictMockProxy(page, {
    '/favorites': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) }),
    '/users': unauthHandler(),
  })
  await page.goto('/')
  await setFavStorage(page, [PRODUCT_A, PRODUCT_B])
  await page.reload()
  await expect(page.locator('[data-testid="header-favourites-badge"]')).toHaveText('2', { timeout: 8000 })
})

test('cart badge not visible when cart is empty', async ({ page }) => {
  await strictMockProxy(page, {
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) }),
    '/users': unauthHandler(),
  })
  await page.goto('/')
  await expect(page.locator('[data-testid="header-cart-badge"]')).not.toBeVisible({ timeout: 5000 })
})

test('favourites badge not visible when no favourites', async ({ page }) => {
  await strictMockProxy(page, {
    '/favorites': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) }),
    '/users': unauthHandler(),
  })
  await page.goto('/')
  await expect(page.locator('[data-testid="header-favourites-badge"]')).not.toBeVisible({ timeout: 5000 })
})

test('cart badge shows item count after seeding via storage', async ({ page }) => {
  await strictMockProxy(page, {
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, 2)])) }),
    '/users': unauthHandler(),
  })
  await page.goto('/')
  await expect(page.locator('[data-testid="header-cart-badge"]')).toHaveText('2', { timeout: 8000 })
})
