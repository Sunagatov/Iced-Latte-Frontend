import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { seedCart, clearCart, seedFavourite, clearFavourites } from './helpers/seedReal'
import { REAL_PRODUCT_ID, REAL_PRODUCT_ID_2 } from './helpers/realData'
import { ensureAuth } from './helpers/ensureAuth'
/**
 * Cart & Favourites Sync — comprehensive spec coverage
 *
 * Mocked tests: fully isolated, immune to rate limiting.
 * Real-mode tests: behavioral equivalents using real API.
 */
import {
  test as base,
  expect,
  type Page,
  type BrowserContext,
} from '@playwright/test'

if (IS_REAL) base.use({ storageState: { cookies: [], origins: [] } })

// ─── Fixtures ─────────────────────────────────────────────────────────────────

interface Fixtures {
  page: Page
}

const test = base.extend<Fixtures>({
  page: async ({ browser }, use) => {
    const context: BrowserContext = IS_REAL
      ? await browser.newContext({ storageState: 'e2e/.auth.json' })
      : await browser.newContext()
    const page = await context.newPage()

    await use(page)
    await context.close()
  },
})

test.setTimeout(30000)

// ─── Constants ────────────────────────────────────────────────────────────────
const PRODUCT_A = '00000000-0000-0000-0000-000000000001'
const PRODUCT_B = '00000000-0000-0000-0000-000000000002'
const CART_SLOT_A = 'slot-aaaa-0000-0000-0000-000000000001'
const CART_SLOT_B = 'slot-bbbb-0000-0000-0000-000000000002'

// ─── Factories ────────────────────────────────────────────────────────────────

function makeProduct(id: string, name = 'Test Coffee', price = 9.99) {
  return {
    id,
    name,
    price,
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

function makeCartItem(productId: string, slotId: string, qty = 1) {
  return {
    id: slotId,
    productInfo: makeProduct(productId),
    productQuantity: qty,
  }
}

function makeCart(items: object[]) {
  const productsQuantity = (items as { productQuantity: number }[]).reduce(
    (s, i) => s + i.productQuantity,
    0,
  )

  return {
    id: 'cart-uuid-1',
    userId: 'user-uuid-1',
    items,
    itemsQuantity: items.length,
    itemsTotalPrice: productsQuantity * 9.99,
    productsQuantity,
    createdAt: '2024-01-01T00:00:00Z',
    closedAt: null,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function setCartStorage(
  page: Page,
  itemsIds: object[],
  isSync = false,
  tempItems: object[] = [],
) {
  const count = (itemsIds as { productQuantity: number }[]).reduce(
    (s, i) => s + i.productQuantity,
    0,
  )

  await page.evaluate(
    ([ids, sync, temps, c]) => {
      localStorage.setItem(
        'cart-storage',
        JSON.stringify({
          state: {
            itemsIds: ids,
            tempItems: temps,
            count: c,
            totalPrice: 0,
            isSync: sync,
          },
          version: 0,
        }),
      )
    },
    [itemsIds, isSync, tempItems, count] as [
      object[],
      boolean,
      object[],
      number,
    ],
  )
}

async function setFavStorage(page: Page, favouriteIds: string[]) {
  await page.evaluate((ids) => {
    localStorage.setItem(
      'fav-storage',
      JSON.stringify({
        state: { favouriteIds: ids, favourites: [] },
        version: 0,
      }),
    )
  }, favouriteIds)
}

/** Route all proxy calls. Handlers keyed by URL substring, fallback returns {}.
 * Pass authenticated=true to make the session endpoint return logged-in state.
 */
async function mockProxy(
  page: Page,
  handlers: Record<string, object>,
  authenticated = false,
) {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      if (authenticated) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({"id":"u1","firstName":"Test","lastName":"User","email":"test@example.com","phoneNumber":null,"birthDate":null,"address":null}) })
      } else {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
      }

      return
    }

    for (const [key, body] of Object.entries(handlers)) {
      if (url.includes(key)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        })

        return
      }
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
}

// ─── §5 Header badges ─────────────────────────────────────────────────────────

test.describe('Header badges', () => {
  test('cart badge shows total product units from persisted count', async ({
    page,
  }) => {
    if (IS_REAL) {
      await clearCart(page)
      await seedCart(page, [
        { productId: REAL_PRODUCT_ID, productQuantity: 3 },
        { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
      ])
      await page.goto('/')
    } else {
      await page.goto('/')
      await setCartStorage(page, [
        { productId: PRODUCT_A, productQuantity: 3 },
        { productId: PRODUCT_B, productQuantity: 2 },
      ])
      await mockProxy(page, { '/cart': makeCart([]) })
      await page.reload()
    }
    const badge = page
      .locator('a[href="/cart"] div div')
      .filter({ hasText: /^\d+$/ })
    await expect(badge).toHaveText('5', { timeout: 8000 })
    if (IS_REAL) await clearCart(page)
  })

  test('favourites badge shows favouriteIds.length', async ({ page }) => {
    if (IS_REAL) {
      await clearFavourites(page)
      await seedFavourite(page, REAL_PRODUCT_ID)
      await seedFavourite(page, REAL_PRODUCT_ID_2)
      await page.goto('/')
    } else {
      await page.goto('/')
      await setFavStorage(page, [PRODUCT_A, PRODUCT_B])
      await mockProxy(page, { '/favorites': { products: [] } })
      await page.reload()
    }
    const badge = page
      .locator('a[href="/favourites"] div div')
      .filter({ hasText: /^\d+$/ })
    await expect(badge).toHaveText('2', { timeout: 8000 })
    if (IS_REAL) await clearFavourites(page)
  })

  test('cart badge not visible when cart is empty', async ({ page }) => {
    if (IS_REAL) {
      await clearCart(page)
      await page.goto('/')
    } else {
      await mockProxy(page, {})
      await page.goto('/')
    }
    const badge = page
      .locator('a[href="/cart"] div div')
      .filter({ hasText: /^\d+$/ })
    await expect(badge).not.toBeVisible({ timeout: 5000 })
  })

  test('favourites badge not visible when no favourites', async ({ page }) => {
    if (IS_REAL) {
      await clearFavourites(page)
      await page.goto('/')
    } else {
      await mockProxy(page, {})
      await page.goto('/')
    }
    const badge = page
      .locator('a[href="/favourites"] div div')
      .filter({ hasText: /^\d+$/ })
    await expect(badge).not.toBeVisible({ timeout: 5000 })
  })
})

// ─── §3 Cart sync — stale state cleanup ──────────────────────────────────────

test.describe('Cart sync — stale state cleanup', () => {
  test.beforeEach(() => { test.skip(IS_REAL, 'mocked-only') })
  test('stale isSync=true with no token is reset on load', async ({ page }) => {
    // Spec §3: token=null, isSync=true → reset() clears cart
    await page.goto('/')
    await setCartStorage(
      page,
      [{ productId: PRODUCT_A, productQuantity: 1 }],
      true,
      [makeCartItem(PRODUCT_A, CART_SLOT_A)],
    )
    // No token set
    await mockProxy(page, {})
    await page.reload()

    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({
      timeout: 8000,
    })
  })
})

// ─── §3 Cart sync — quantity operations (logged in) ──────────────────────────

test.describe('Cart — quantity operations (logged in)', () => {
  test('increasing quantity updates item count display', async ({ page }) => {
    if (IS_REAL) {
      await clearCart(page)
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 })
      await page.locator('[data-testid="cart-plus-btn"]').first().click()
      await expect(page.locator('[data-testid="cart-item-qty"]').first()).toHaveText('2', { timeout: 10000 })
      await clearCart(page)
    } else {
      let serverQty = 1
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        const method = route.request().method()
        if (url.includes('/cart/items') && method === 'PATCH') {
          serverQty = 2
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)])) })
        } else if (url.includes('/cart')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, serverQty)])) })
        } else if (url.includes('/products/ids')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([makeProduct(PRODUCT_A)]) })
        } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({id:'u1',firstName:'Test',lastName:'User',email:'test@example.com',phoneNumber:null,birthDate:null,address:null}) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
      await page.locator('[data-testid="cart-plus-btn"]').first().click()
      await page.waitForResponse(
        (res) => res.url().includes('/api/proxy/cart/items') && res.request().method() === 'PATCH',
      )
      await expect(page.locator('[data-testid="cart-item-qty"]').first()).toHaveText('2', { timeout: 10000 })
    }
  })

  test('minus button shows trash icon when quantity is 1', async ({ page }) => {
    if (IS_REAL) {
      await clearCart(page)
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('[data-testid="cart-minus-btn"]').first()).toHaveAttribute('aria-label', 'Remove item', { timeout: 10000 })
      await clearCart(page)
    } else {
      await mockProxy(page, { '/cart': makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1)]) }, true)
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
      await expect(page.locator('[data-testid="cart-minus-btn"]').first()).toHaveAttribute('aria-label', 'Remove item', { timeout: 5000 })
    }
  })

  test('removing last unit of item shows empty cart', async ({ page }) => {
    if (IS_REAL) {
      await clearCart(page)
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 })
      await page.locator('[data-testid="cart-minus-btn"]').first().click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
    } else {
      let itemRemoved = false
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        const method = route.request().method()
        if (url.includes('/cart/items') && method === 'DELETE') {
          itemRemoved = true
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
        } else if (url.includes('/cart')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(itemRemoved ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1)])) })
        } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({id:'u1',firstName:'Test',lastName:'User',email:'test@example.com',phoneNumber:null,birthDate:null,address:null}) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
      await page.locator('[data-testid="cart-minus-btn"]').first().click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
    }
  })

  test('trash button removes item and shows empty cart', async ({ page }) => {
    if (IS_REAL) {
      await clearCart(page)
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 })
      await page.locator('[data-testid="cart-trash-btn"]').first().click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
    } else {
      let itemRemoved = false
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        const method = route.request().method()
        if (url.includes('/cart/items') && method === 'DELETE') {
          itemRemoved = true
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
        } else if (url.includes('/cart')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(itemRemoved ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)])) })
        } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({id:'u1',firstName:'Test',lastName:'User',email:'test@example.com',phoneNumber:null,birthDate:null,address:null}) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
      await page.locator('[data-testid="cart-trash-btn"]').first().click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
    }
  })

  test('clear all removes all items and shows empty state', async ({ page }) => {
    if (IS_REAL) {
      await clearCart(page)
      await seedCart(page, [
        { productId: REAL_PRODUCT_ID, productQuantity: 1 },
        { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
      ])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
      await page.getByText('Clear all').click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
    } else {
      const state = { cleared: false }
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        const method = route.request().method()
        if (url.includes('/cart/items') && method === 'DELETE') {
          state.cleared = true
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
        } else if (url.includes('/cart/items') && method === 'POST') {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1), makeCartItem(PRODUCT_B, CART_SLOT_B, 2)])) })
        } else if (url.includes('/cart')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.cleared ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1), makeCartItem(PRODUCT_B, CART_SLOT_B, 2)])) })
        } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({id:'u1',firstName:'Test',lastName:'User',email:'test@example.com',phoneNumber:null,birthDate:null,address:null}) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 8000 })
      await page.getByText('Clear all').click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
    }
  })
})

// ─── §3 Cart sync — guest operations ─────────────────────────────────────────

test.describe('Cart — guest operations', () => {
  test.beforeEach(() => { test.skip(IS_REAL, 'mocked-only') })
  test('guest cart shows empty state when no items', async ({ page }) => {
    // Spec §6: CartEmpty shown when tempItems=0 and count=0
    await mockProxy(page, {})
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({
      timeout: 8000,
    })
  })

  test('guest cart with persisted items shows CartFull', async ({ page }) => {
    // Spec §6: CartFull shown when count>0
    await page.goto('/')
    await setCartStorage(
      page,
      [{ productId: PRODUCT_A, productQuantity: 1 }],
      false,
      [makeCartItem(PRODUCT_A, PRODUCT_A, 1)],
    )
    await mockProxy(page, { '/products/ids': [makeProduct(PRODUCT_A)] })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({
      timeout: 8000,
    })
  })

  test('guest cart merge: POST /cart/items called on login', async ({
    page,
  }) => {
    // Spec §3: isSync=false, itemsCount>0, authenticated → POST /cart/items
    let mergeCallMade = false

    await mockRoute(page, '**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      if (url.includes('/cart/items') && method === 'POST') {
        mergeCallMade = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)]),
          ),
        })
      } else if (url.includes('/cart')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(makeCart([])),
        })
      } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        })
      }
    })

    await page.addInitScript(([productId]: string[]) => {
      localStorage.setItem(
        'cart-storage',
        JSON.stringify({
          state: {
            itemsIds: [{ productId, productQuantity: 2 }],
            tempItems: [],
            count: 2,
            totalPrice: 0,
            isSync: false,
          },
          version: 0,
        }),
      )
    }, [PRODUCT_A])

    const mergeResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/api/proxy/cart/items') &&
        res.request().method() === 'POST',
    )

    await page.goto('/')

    await mergeResponse
    expect(mergeCallMade).toBe(true)
  })
})

// ─── §4 Favourites sync ───────────────────────────────────────────────────────

test.describe('Favourites sync', () => {
  test('bootstrap favourite sync fires once for persisted guest favourites', async ({
    page,
  }) => {
    test.skip(IS_REAL, 'mocked-only: call-count assertion not possible against real API')
    let syncCallCount = 0

    await mockRoute(page, '**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      if (url.includes('/favorites') && method === 'POST') {
        syncCallCount++
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [makeProduct(PRODUCT_A)] }) })
      } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await page.addInitScript(([productId]: string[]) => {
      localStorage.setItem(
        'fav-storage',
        JSON.stringify({
          state: { favouriteIds: [productId], isSync: false },
          version: 0,
        }),
      )
    }, [PRODUCT_A])

    const syncResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/api/proxy/favorites') &&
        res.request().method() === 'POST',
    )

    await page.goto('/')

    await syncResponse
    expect(syncCallCount).toBe(1)
  })

  test('add favourite (logged in) updates header badge immediately', async ({
    page,
  }) => {
    if (IS_REAL) {
      await clearFavourites(page)
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      const badge = page.locator('a[href="/favourites"] div div').filter({ hasText: /^\d+$/ })
      await expect(badge).not.toBeVisible({ timeout: 3000 })
      await page.locator('[data-testid="favourite-btn"]').first().click()
      await expect(badge).toBeVisible({ timeout: 5000 })
      await clearFavourites(page)
    } else {
      const product = makeProduct(PRODUCT_A)
      // Clear any persisted fav-storage from previous tests
      await page.goto('/')
      await page.evaluate(() => localStorage.removeItem('fav-storage'))
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        const method = route.request().method()
        if (url.includes('/favorites') && method === 'POST') {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product] }) })
        } else if (url.includes('/favorites') && method === 'GET') {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) })
        } else if (url.includes('/products') && !url.includes('/ids')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
        } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({id:'u1',firstName:'Test',lastName:'User',email:'test@example.com',phoneNumber:null,birthDate:null,address:null}) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      const badge = page.locator('a[href="/favourites"] div div').filter({ hasText: /^\d+$/ })
      await expect(badge).not.toBeVisible({ timeout: 3000 })
      await page.locator('[data-testid="favourite-btn"]').first().click()
      await expect(badge).toBeVisible({ timeout: 5000 })
      await expect(badge).toHaveText('1', { timeout: 5000 })
    }
  })

  test('remove favourite (logged in) calls DELETE endpoint', async ({
    page,
  }) => {
    test.skip(IS_REAL, 'mocked-only: network call assertion not possible against real API')
    const product = makeProduct(PRODUCT_A)
    let deleteWasCalled = false
    await mockRoute(page, '**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/favorites') && method === 'DELETE') {
        deleteWasCalled = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      } else if (url.includes('/favorites') && method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product] }) })
      } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({id:'u1',firstName:'Test',lastName:'User',email:'test@example.com',phoneNumber:null,birthDate:null,address:null}) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })
    await page.goto('/')
    await setFavStorage(page, [PRODUCT_A])
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.goto('/favourites')
    await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
    await page.locator('[data-testid="fav-element"]').first().locator('button[aria-label="Remove from favourites"]').click()
    await page.waitForResponse(
      (res) => res.url().includes('/api/proxy/favorites') && res.request().method() === 'DELETE',
    )
    expect(deleteWasCalled).toBe(true)
  })

  test('guest add favourite shows item in favourites list', async ({
    page,
  }) => {
    if (IS_REAL) {
      // Use a fresh unauthenticated context
      const ctx = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } })
      const guestPage = await ctx.newPage()
      await guestPage.goto('/')
      await guestPage.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await guestPage.locator('[data-testid="favourite-btn"]').first().click()
      await guestPage.waitForTimeout(500)
      await guestPage.goto('/favourites')
      await expect(guestPage.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
      await ctx.close()
    } else {
      const product = makeProduct(PRODUCT_A)
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        if (url.includes('/products/ids')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([product]) })
        } else if (url.includes('/products') && !url.includes('/ids')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
        } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
          await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.locator('[data-testid="favourite-btn"]').first().click()
      await page.waitForResponse(
        (res) => res.url().includes('/api/proxy/products/ids') && res.request().method() === 'GET',
      )
      await page.goto('/favourites')
      await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
    }
  })

  test('favourites page shows empty state for guest with no favourites', async ({
    page,
  }) => {
    if (IS_REAL) {
      const ctx = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } })
      const guestPage = await ctx.newPage()
      await guestPage.goto('/favourites')
      await expect(guestPage.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 8000 })
      await ctx.close()
    } else {
      await mockProxy(page, {})
      await page.goto('/favourites')
      await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 8000 })
    }
  })

  test('favourites page shows full list for guest with persisted favouriteIds', async ({
    page,
  }) => {
    if (IS_REAL) {
      const ctx = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } })
      const guestPage = await ctx.newPage()
      await guestPage.goto('/')
      await guestPage.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await guestPage.locator('[data-testid="favourite-btn"]').first().click()
      await guestPage.waitForTimeout(500)
      await guestPage.goto('/favourites')
      await expect(guestPage.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
      await ctx.close()
    } else {
      const product = makeProduct(PRODUCT_A)
      await page.goto('/')
      await setFavStorage(page, [PRODUCT_A])
      await mockProxy(page, { '/products/ids': [product] })
      await page.reload()
      await page.waitForLoadState('networkidle')
      await page.goto('/favourites')
      await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
    }
  })
})

// ─── §3+§4 Logout clears both stores ─────────────────────────────────────────

test.describe('Logout clears cart and favourites', () => {
  test('fresh session with no stored state shows empty cart', async ({
    page,
  }) => {
    if (IS_REAL) {
      await clearCart(page)
      await page.goto('/cart')
    } else {
      await mockProxy(page, {})
      await page.goto('/cart')
    }
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({
      timeout: 8000,
    })
  })

  test('fresh session with no stored state shows empty favourites', async ({
    page,
  }) => {
    if (IS_REAL) {
      await clearFavourites(page)
      await page.goto('/favourites')
    } else {
      await mockProxy(page, {})
      // Clear persisted fav-storage to avoid state from previous tests
      await page.goto('/')
      await page.evaluate(() => localStorage.removeItem('fav-storage'))
      await page.goto('/favourites')
    }
    await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({
      timeout: 8000,
    })
  })
})

// ─── §3 Cart — multi-item merge ───────────────────────────────────────────────

test.describe('Cart — multi-item merge', () => {
  test.beforeEach(() => { test.skip(IS_REAL, 'mocked-only') })
  test('guest cart with multiple items all appear after login sync', async ({
    page,
  }) => {
    // Spec §3: all guest itemsIds sent in POST /cart/items, all appear in response
    const mergedCart = makeCart([
      makeCartItem(PRODUCT_A, CART_SLOT_A, 2),
      makeCartItem(PRODUCT_B, CART_SLOT_B, 3),
    ])

    await page.goto('/')
    await setCartStorage(
      page,
      [
        { productId: PRODUCT_A, productQuantity: 2 },
        { productId: PRODUCT_B, productQuantity: 3 },
      ],
      false,
    )

    await mockRoute(page, '**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      if (
        (url.includes('/cart/items') && method === 'POST') ||
        url.includes('/cart')
      ) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mergedCart),
        })
      } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({"id":"u1","firstName":"Test","lastName":"User","email":"test@example.com","phoneNumber":null,"birthDate":null,"address":null}),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        })
      }
    })

    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2, {
      timeout: 8000,
    })
  })

  test('existing item quantity is merged not duplicated on login sync', async ({
    page,
  }) => {
    // Spec §3 + backend §8: POST /cart/items is additive — existing qty increased
    // Guest had qty=2, server had qty=1 → merged qty=3
    const mergedCart = makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 3)])

    await page.goto('/')
    await setCartStorage(
      page,
      [{ productId: PRODUCT_A, productQuantity: 2 }],
      false,
    )

    await mockRoute(page, '**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      if (
        (url.includes('/cart/items') && method === 'POST') ||
        url.includes('/cart')
      ) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mergedCart),
        })
      } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({"id":"u1","firstName":"Test","lastName":"User","email":"test@example.com","phoneNumber":null,"birthDate":null,"address":null}),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        })
      }
    })

    await page.goto('/cart')
    await expect(
      page.locator('[data-testid="cart-item-qty"]').first(),
    ).toHaveText('3', { timeout: 8000 })
  })
})

// ─── Real-mode behavioral equivalents ────────────────────────────────────────

test.describe('Real-mode: cart operations', () => {
  test.beforeEach(() => { test.skip(!IS_REAL, 'real-mode only') })
  test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => { await ensureAuth(page) })
  test.setTimeout(30000)

  test('cart shows item after seeding', async ({ page }) => {
    await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
    await clearCart(page)
  })

  test('cart shows empty state after clearing', async ({ page }) => {
    await clearCart(page)
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

  test('cart with two products shows both items', async ({ page }) => {
    await seedCart(page, [
      { productId: REAL_PRODUCT_ID, productQuantity: 1 },
      { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
    ])
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2, { timeout: 10000 })
    await clearCart(page)
  })
})

test.describe('Real-mode: favourites operations', () => {
  test.beforeEach(() => { test.skip(!IS_REAL, 'real-mode only') })
  test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => { await ensureAuth(page) })
  test.setTimeout(30000)

  test('favourites shows item after seeding', async ({ page }) => {
    await seedFavourite(page, REAL_PRODUCT_ID)
    await page.goto('/favourites')
    await expect(page.locator('[data-testid="fav-element"]').first()).toBeVisible({ timeout: 10000 })
    await clearFavourites(page)
  })

  test('favourites shows empty state after clearing', async ({ page }) => {
    await clearFavourites(page)
    await page.waitForTimeout(3000)
    await page.goto('/favourites')
    await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 12000 })
  })

  test('add favourite updates header badge', async ({ page }) => {
    await clearFavourites(page)
    await seedFavourite(page, REAL_PRODUCT_ID)
    await page.goto('/')
    const badge = page.locator('a[href="/favourites"] div div').filter({ hasText: /^\d+$/ })
    await expect(badge).toBeVisible({ timeout: 10000 })
    await clearFavourites(page)
  })
})
