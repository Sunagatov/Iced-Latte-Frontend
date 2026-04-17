import { strictMockProxy } from '../helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import type { Route } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

// ─── Factories ────────────────────────────────────────────────────────────────

const PRODUCT_A = '00000000-0000-0000-0000-000000000001'
const PRODUCT_B = '00000000-0000-0000-0000-000000000002'
const CART_SLOT_A = 'slot-aaaa-0000-0000-0000-000000000001'
const CART_SLOT_B = 'slot-bbbb-0000-0000-0000-000000000002'

function makeProduct(id: string, name = 'Test Coffee', price = 9.99) {
  return { id, name, price, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

function makeCartItem(productId: string, slotId: string, qty = 1) {
  return { id: slotId, productInfo: makeProduct(productId), productQuantity: qty }
}

function makeCart(items: object[]) {
  const productsQuantity = (items as { productQuantity: number }[]).reduce((s, i) => s + i.productQuantity, 0)

  return {
    id: 'cart-uuid-1', userId: 'user-uuid-1', items,
    itemsQuantity: items.length, itemsTotalPrice: productsQuantity * 9.99,
    productsQuantity, createdAt: '2024-01-01T00:00:00Z', closedAt: null,
  }
}

const USER_BODY = JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null })
const UNAUTH_BODY = JSON.stringify({ message: 'Unauthorized' })

function userHandler(authenticated: boolean): (route: Route) => Promise<void> {
  return async (route) => {
    await route.fulfill({
      status: authenticated ? 200 : 401,
      contentType: 'application/json',
      body: authenticated ? USER_BODY : UNAUTH_BODY,
    })
  }
}

async function setCartStorage(page: Page, itemsIds: object[], isSync = false, tempItems: object[] = []) {
  const count = (itemsIds as { productQuantity: number }[]).reduce((s, i) => s + i.productQuantity, 0)

  await page.evaluate(
    ([ids, sync, temps, c]) => {
      localStorage.setItem('cart-storage', JSON.stringify({
        state: { itemsIds: ids, tempItems: temps, count: c, totalPrice: 0, isSync: sync },
        version: 0,
      }))
    },
    [itemsIds, isSync, tempItems, count] as [object[], boolean, object[], number],
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('stale isSync=true with no token is reset on load', async ({ page }) => {
  await strictMockProxy(page, {
    '/users': userHandler(false),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) }),
  })
  await page.goto('/')
  await setCartStorage(page, [{ productId: PRODUCT_A, productQuantity: 1 }], true, [makeCartItem(PRODUCT_A, CART_SLOT_A)])
  await page.reload()
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
})

test('guest cart shows empty state when no items', async ({ page }) => {
  await strictMockProxy(page, {
    '/users': userHandler(false),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) }),
  })
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
})

test('guest cart with persisted items shows CartFull', async ({ page }) => {
  await strictMockProxy(page, {
    '/users': userHandler(false),
    '/products/ids': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([makeProduct(PRODUCT_A)]) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) }),
  })
  await page.goto('/')
  await setCartStorage(page, [{ productId: PRODUCT_A, productQuantity: 1 }], false, [makeCartItem(PRODUCT_A, PRODUCT_A, 1)])
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
})

test('guest cart merge: POST /cart/items called on login', async ({ page }) => {
  let mergeCallMade = false

  await strictMockProxy(page, {
    '/cart/items': async (route) => {
      if (route.request().method() === 'POST') {
        mergeCallMade = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      }
    },
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) }),
    '/users': userHandler(true),
  })

  await page.addInitScript(([productId]: string[]) => {
    localStorage.setItem('cart-storage', JSON.stringify({
      state: { itemsIds: [{ productId, productQuantity: 2 }], tempItems: [], count: 2, totalPrice: 0, isSync: false },
      version: 0,
    }))
  }, [PRODUCT_A])

  const mergeResponse = page.waitForResponse(
    (res) => res.url().includes('/api/proxy/cart/items') && res.request().method() === 'POST',
  )

  await page.goto('/')
  await mergeResponse
  expect(mergeCallMade).toBe(true)
})

test('increasing quantity updates item count display', async ({ page }) => {
  let serverQty = 1

  await strictMockProxy(page, {
    '/cart/items': async (route) => {
      if (route.request().method() === 'PATCH') {
        serverQty = 2
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      }
    },
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, serverQty)])) }),
    '/products/ids': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([makeProduct(PRODUCT_A)]) }),
    '/users': userHandler(true),
  })
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
  await page.locator('[data-testid="cart-plus-btn"]').first().click()
  await page.waitForResponse(
    (res) => res.url().includes('/api/proxy/cart/items') && res.request().method() === 'PATCH',
  )
  await expect(page.locator('[data-testid="cart-item-qty"]').first()).toHaveText('2', { timeout: 10000 })
})

test('minus button shows trash icon when quantity is 1', async ({ page }) => {
  await strictMockProxy(page, {
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1)])) }),
    '/users': userHandler(true),
  })
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
  await expect(page.locator('[data-testid="cart-minus-btn"]').first()).toHaveAttribute('aria-label', 'Remove item', { timeout: 5000 })
})

test('removing last unit of item shows empty cart', async ({ page }) => {
  let itemRemoved = false

  await strictMockProxy(page, {
    '/cart/items': async (route) => {
      if (route.request().method() === 'DELETE') {
        itemRemoved = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      }
    },
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(itemRemoved ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1)])) }),
    '/users': userHandler(true),
  })
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
  await page.locator('[data-testid="cart-minus-btn"]').first().click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
})

test('trash button removes item and shows empty cart', async ({ page }) => {
  let itemRemoved = false

  await strictMockProxy(page, {
    '/cart/items': async (route) => {
      if (route.request().method() === 'DELETE') {
        itemRemoved = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      }
    },
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(itemRemoved ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)])) }),
    '/users': userHandler(true),
  })
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
  await page.locator('[data-testid="cart-trash-btn"]').first().click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
})

test('clear all removes all items and shows empty state', async ({ page }) => {
  const state = { cleared: false }

  await strictMockProxy(page, {
    '/cart/items': async (route) => {
      const method = route.request().method()

      if (method === 'DELETE') {
        state.cleared = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      } else if (method === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1), makeCartItem(PRODUCT_B, CART_SLOT_B, 2)])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      }
    },
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.cleared ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1), makeCartItem(PRODUCT_B, CART_SLOT_B, 2)])) }),
    '/users': userHandler(true),
  })
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 8000 })
  await page.getByText('Clear all').click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
})

test('guest cart with multiple items all appear after login sync', async ({ page }) => {
  const mergedCart = makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2), makeCartItem(PRODUCT_B, CART_SLOT_B, 3)])

  await page.goto('/')
  await setCartStorage(page, [{ productId: PRODUCT_A, productQuantity: 2 }, { productId: PRODUCT_B, productQuantity: 3 }], false)

  await strictMockProxy(page, {
    '/cart/items': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mergedCart) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mergedCart) }),
    '/users': userHandler(true),
  })

  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2, { timeout: 8000 })
})

test('existing item quantity is merged not duplicated on login sync', async ({ page }) => {
  const mergedCart = makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 3)])

  await page.goto('/')
  await setCartStorage(page, [{ productId: PRODUCT_A, productQuantity: 2 }], false)

  await strictMockProxy(page, {
    '/cart/items': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mergedCart) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mergedCart) }),
    '/users': userHandler(true),
  })

  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item-qty"]').first()).toHaveText('3', { timeout: 8000 })
})
