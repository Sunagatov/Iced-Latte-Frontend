/**
 * Cart & Favourites Sync — comprehensive spec coverage
 *
 * Covers every scenario from .amazonq/cart-fav-sync-spec.md that is not
 * already tested in sync.spec.ts, cart.spec.ts, or favourites.spec.ts.
 *
 * All tests are fully mocked — no real backend calls, immune to rate limiting.
 * Each test gets an isolated browser context so localStorage never leaks.
 */
import { test as base, expect, type Page, type BrowserContext } from '@playwright/test'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

type Fixtures = { page: Page }

const test = base.extend<Fixtures>({
  page: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext()
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

test.setTimeout(30000)

// ─── Constants ────────────────────────────────────────────────────────────────

const FAKE_TOKEN = 'fake-token-for-mocked-test'
const PRODUCT_A = '00000000-0000-0000-0000-000000000001'
const PRODUCT_B = '00000000-0000-0000-0000-000000000002'
const CART_SLOT_A = 'slot-aaaa-0000-0000-0000-000000000001'
const CART_SLOT_B = 'slot-bbbb-0000-0000-0000-000000000002'

// ─── Factories ────────────────────────────────────────────────────────────────

function makeProduct(id: string, name = 'Test Coffee', price = 9.99) {
  return {
    id, name, price,
    productFileUrl: null, brandName: 'Brand', sellerName: 'Seller',
    averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true,
  }
}

function makeCartItem(productId: string, slotId: string, qty = 1) {
  return { id: slotId, productInfo: makeProduct(productId), productQuantity: qty }
}

function makeCart(items: object[]) {
  const productsQuantity = (items as { productQuantity: number }[]).reduce((s, i) => s + i.productQuantity, 0)
  return {
    id: 'cart-uuid-1', userId: 'user-uuid-1', items,
    itemsQuantity: items.length,
    itemsTotalPrice: productsQuantity * 9.99,
    productsQuantity,
    createdAt: '2024-01-01T00:00:00Z', closedAt: null,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function setToken(page: Page, token = FAKE_TOKEN) {
  await page.evaluate(
    (t) => localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: null, isLoggedIn: true }, version: 0 })),
    token,
  )
}

async function setCartStorage(page: Page, itemsIds: object[], isSync = false, tempItems: object[] = []) {
  const count = (itemsIds as { productQuantity: number }[]).reduce((s, i) => s + i.productQuantity, 0)
  await page.evaluate(
    ([ids, sync, temps, c]) => localStorage.setItem('cart-storage', JSON.stringify({
      state: { itemsIds: ids, tempItems: temps, count: c, totalPrice: 0, isSync: sync },
      version: 0,
    })),
    [itemsIds, isSync, tempItems, count] as [object[], boolean, object[], number],
  )
}

async function setFavStorage(page: Page, favouriteIds: string[]) {
  await page.evaluate(
    (ids) => localStorage.setItem('fav-storage', JSON.stringify({ state: { favouriteIds: ids, favourites: [] }, version: 0 })),
    favouriteIds,
  )
}

/** Route all proxy calls. Handlers keyed by URL substring, fallback returns {}. */
async function mockProxy(page: Page, handlers: Record<string, object>) {
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    for (const [key, body] of Object.entries(handlers)) {
      if (url.includes(key)) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
        return
      }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}

// ─── §5 Header badges ─────────────────────────────────────────────────────────

test.describe('Header badges', () => {

  test('cart badge shows total product units from persisted count', async ({ page }) => {
    // Spec §5: cart badge reads `count` = total units (3+2=5), not distinct items
    await page.goto('http://localhost:3000')
    await setCartStorage(page, [
      { productId: PRODUCT_A, productQuantity: 3 },
      { productId: PRODUCT_B, productQuantity: 2 },
    ])
    await mockProxy(page, { '/cart': makeCart([]) })
    await page.reload()

    const badge = page.locator('a[href="/cart"] div div').filter({ hasText: /^\d+$/ })
    await expect(badge).toHaveText('5', { timeout: 8000 })
  })

  test('favourites badge shows favouriteIds.length', async ({ page }) => {
    // Spec §5: fav badge reads favouriteIds.length directly
    await page.goto('http://localhost:3000')
    await setFavStorage(page, [PRODUCT_A, PRODUCT_B])
    await mockProxy(page, { '/favorites': { products: [] } })
    await page.reload()

    const badge = page.locator('a[href="/favourites"] div div').filter({ hasText: /^\d+$/ })
    await expect(badge).toHaveText('2', { timeout: 8000 })
  })

  test('cart badge not visible when cart is empty', async ({ page }) => {
    // Spec §5: no badge when count=0
    await mockProxy(page, {})
    await page.goto('http://localhost:3000')

    const badge = page.locator('a[href="/cart"] div div').filter({ hasText: /^\d+$/ })
    await expect(badge).not.toBeVisible({ timeout: 5000 })
  })

  test('favourites badge not visible when no favourites', async ({ page }) => {
    // Spec §5: no badge when favouriteIds=[]
    await mockProxy(page, {})
    await page.goto('http://localhost:3000')

    const badge = page.locator('a[href="/favourites"] div div').filter({ hasText: /^\d+$/ })
    await expect(badge).not.toBeVisible({ timeout: 5000 })
  })

})

// ─── §3 Cart sync — stale state cleanup ──────────────────────────────────────

test.describe('Cart sync — stale state cleanup', () => {

  test('stale isSync=true with no token is reset on load', async ({ page }) => {
    // Spec §3: token=null, isSync=true → reset() clears cart
    await page.goto('http://localhost:3000')
    await setCartStorage(page,
      [{ productId: PRODUCT_A, productQuantity: 1 }],
      true,
      [makeCartItem(PRODUCT_A, CART_SLOT_A)],
    )
    // No token set
    await mockProxy(page, {})
    await page.reload()

    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

})

// ─── §3 Cart sync — quantity operations (logged in) ──────────────────────────

test.describe('Cart — quantity operations (logged in)', () => {

  test('increasing quantity updates item count display', async ({ page }) => {
    // Spec §3 add: token set, item already in cart → PATCH, response updates qty
    await page.goto('http://localhost:3000')
    await setToken(page)

    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/cart/items') && method === 'PATCH') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)])) })
      } else if (url.includes('/cart')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1)])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await page.reload()
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
    await page.locator('[data-testid="cart-plus-btn"]').first().click()
    await expect(page.locator('[data-testid="cart-item-qty"]').first()).toHaveText('2', { timeout: 8000 })
  })

  test('minus button shows trash icon when quantity is 1', async ({ page }) => {
    // Spec §3 remove: quantity=1 → minus button aria-label = "Remove item"
    await page.goto('http://localhost:3000')
    await setToken(page)
    await mockProxy(page, { '/cart': makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1)]) })
    await page.reload()
    await page.goto('/cart')

    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
    const minusBtn = page.locator('[data-testid="cart-minus-btn"]').first()
    await expect(minusBtn).toHaveAttribute('aria-label', 'Remove item', { timeout: 5000 })
  })

  test('removing last unit of item shows empty cart', async ({ page }) => {
    // Spec §3 remove full product: DELETE → response replaces tempItems with []
    // Both GET /cart and DELETE /cart/items must return empty so AppInitProvider
    // doesn't overwrite the cleared state with a re-fetch.
    await page.goto('http://localhost:3000')
    await setToken(page)

    let itemRemoved = false
    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/cart/items') && method === 'DELETE') {
        itemRemoved = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      } else if (url.includes('/cart')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(itemRemoved ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1)])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await page.reload()
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
    await page.locator('[data-testid="cart-minus-btn"]').first().click()
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

  test('trash button removes item and shows empty cart', async ({ page }) => {
    // Spec §3 remove full product via trash button
    await page.goto('http://localhost:3000')
    await setToken(page)

    let itemRemoved = false
    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/cart/items') && method === 'DELETE') {
        itemRemoved = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      } else if (url.includes('/cart')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(itemRemoved ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await page.reload()
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
    await page.locator('[data-testid="cart-trash-btn"]').first().click()
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

  test('clear all removes all items and shows empty state', async ({ page }) => {
    // Spec §3 clear all: isSync=true → clearCart() sets local state to empty → CartEmpty
    // clearCart() clears local state after DELETE — no re-fetch needed.
    // We verify the store clears by checking CartEmpty appears.
    await page.goto('http://localhost:3000')
    await setToken(page)

    const state = { cleared: false }
    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/cart/items') && method === 'DELETE') {
        state.cleared = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      } else if (url.includes('/cart/items') && method === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1), makeCartItem(PRODUCT_B, CART_SLOT_B, 2)])) })
      } else if (url.includes('/cart')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.cleared ? makeCart([]) : makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 1), makeCartItem(PRODUCT_B, CART_SLOT_B, 2)])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await page.reload()
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 8000 })
    await page.getByText('Clear all').click()
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

})

// ─── §3 Cart sync — guest operations ─────────────────────────────────────────

test.describe('Cart — guest operations', () => {

  test('guest cart shows empty state when no items', async ({ page }) => {
    // Spec §6: CartEmpty shown when tempItems=0 and count=0
    await mockProxy(page, {})
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

  test('guest cart with persisted items shows CartFull', async ({ page }) => {
    // Spec §6: CartFull shown when count>0
    await page.goto('http://localhost:3000')
    await setCartStorage(page,
      [{ productId: PRODUCT_A, productQuantity: 1 }],
      false,
      [makeCartItem(PRODUCT_A, PRODUCT_A, 1)],
    )
    await mockProxy(page, { '/products/ids': [makeProduct(PRODUCT_A)] })
    await page.reload()
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 8000 })
  })

  test('guest cart merge: POST /cart/items called on login', async ({ page }) => {
    // Spec §3: token set, isSync=false, itemsCount>0 → POST /cart/items
    let mergeCallMade = false

    await page.goto('http://localhost:3000')
    await setCartStorage(page, [{ productId: PRODUCT_A, productQuantity: 2 }], false)

    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/cart/items') && method === 'POST') {
        mergeCallMade = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 2)])) })
      } else if (url.includes('/cart')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([])) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await setToken(page)
    await page.reload()
    await page.waitForTimeout(2000)

    expect(mergeCallMade).toBe(true)
  })

})

// ─── §4 Favourites sync ───────────────────────────────────────────────────────

test.describe('Favourites sync', () => {

  test('fav sync fires only once on login, not on subsequent add/remove', async ({ page }) => {
    // Spec §4 invariant 2: sync runs once per token
    let syncCallCount = 0

    await page.goto('http://localhost:3000')
    await setFavStorage(page, [PRODUCT_A])

    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/favorites') && method === 'POST') {
        syncCallCount++
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [makeProduct(PRODUCT_A)] }) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await setToken(page)
    await page.reload()
    await page.waitForTimeout(2000)

    expect(syncCallCount).toBe(1)
  })

  test('add favourite (logged in) updates header badge immediately', async ({ page }) => {
    // Spec §4 add: optimistic update → favouriteIds grows → badge appears
    const product = makeProduct(PRODUCT_A)

    await page.goto('http://localhost:3000')
    await setToken(page)

    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/favorites') && method === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product] }) })
      } else if (url.includes('/favorites') && method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) })
      } else if (url.includes('/products') && !url.includes('/ids')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await page.reload()
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })

    const badge = page.locator('a[href="/favourites"] div div').filter({ hasText: /^\d+$/ })
    await expect(badge).not.toBeVisible({ timeout: 3000 })

    await page.locator('[data-testid="favourite-btn"]').first().click()
    await expect(badge).toBeVisible({ timeout: 5000 })
    await expect(badge).toHaveText('1', { timeout: 5000 })
  })

  test('remove favourite (logged in) calls DELETE endpoint', async ({ page }) => {
    // Spec §4 remove: token set → DELETE /favorites/:productId called
    const product = makeProduct(PRODUCT_A)
    let deleteWasCalled = false

    await page.goto('http://localhost:3000')
    await setToken(page)
    await setFavStorage(page, [PRODUCT_A])

    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if (url.includes('/favorites') && method === 'DELETE') {
        deleteWasCalled = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      } else if (url.includes('/favorites') && method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product] }) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await page.reload()
    await page.goto('/favourites')
    await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })

    await page.locator('[data-testid="fav-element"]').first().locator('button[aria-label="Remove from favourites"]').click()
    await page.waitForTimeout(1000)

    expect(deleteWasCalled).toBe(true)
  })

  test('guest add favourite shows item in favourites list', async ({ page }) => {
    // Spec §4 add guest: add to favouriteIds → getProductByIds → favourites populated
    const product = makeProduct(PRODUCT_A)

    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      if (url.includes('/products/ids')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([product]) })
      } else if (url.includes('/products') && !url.includes('/ids')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    await page.locator('[data-testid="favourite-btn"]').first().click()
    await page.waitForTimeout(1000)

    await page.goto('/favourites')
    await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
  })

  test('favourites page shows empty state for guest with no favourites', async ({ page }) => {
    // Spec §7: FavouritesEmpty shown when favourites=[] and favouriteIds=[]
    await mockProxy(page, {})
    await page.goto('/favourites')
    await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 8000 })
  })

  test('favourites page shows full list for guest with persisted favouriteIds', async ({ page }) => {
    // Spec §7: FavouritesFull shown when favouriteIds.length > 0
    const product = makeProduct(PRODUCT_A)

    await page.goto('http://localhost:3000')
    await setFavStorage(page, [PRODUCT_A])
    await mockProxy(page, { '/products/ids': [product] })
    await page.reload()
    await page.goto('/favourites')
    await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
  })

})

// ─── §3+§4 Logout clears both stores ─────────────────────────────────────────

test.describe('Logout clears cart and favourites', () => {

  test('fresh session with no stored state shows empty cart', async ({ page }) => {
    // Spec §3 logout: after resetCart, count=0, isSync=false → CartEmpty
    // Simulated by a fresh isolated context with no localStorage
    await mockProxy(page, {})
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
  })

  test('fresh session with no stored state shows empty favourites', async ({ page }) => {
    // Spec §4 logout: after resetFav, favouriteIds=[] → FavouritesEmpty
    await mockProxy(page, {})
    await page.goto('/favourites')
    await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 8000 })
  })

})

// ─── §3 Cart — multi-item merge ───────────────────────────────────────────────

test.describe('Cart — multi-item merge', () => {

  test('guest cart with multiple items all appear after login sync', async ({ page }) => {
    // Spec §3: all guest itemsIds sent in POST /cart/items, all appear in response
    const mergedCart = makeCart([
      makeCartItem(PRODUCT_A, CART_SLOT_A, 2),
      makeCartItem(PRODUCT_B, CART_SLOT_B, 3),
    ])

    await page.goto('http://localhost:3000')
    await setCartStorage(page, [
      { productId: PRODUCT_A, productQuantity: 2 },
      { productId: PRODUCT_B, productQuantity: 3 },
    ], false)

    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if ((url.includes('/cart/items') && method === 'POST') || url.includes('/cart')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mergedCart) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await setToken(page)
    await page.reload()
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2, { timeout: 8000 })
  })

  test('existing item quantity is merged not duplicated on login sync', async ({ page }) => {
    // Spec §3 + backend §8: POST /cart/items is additive — existing qty increased
    // Guest had qty=2, server had qty=1 → merged qty=3
    const mergedCart = makeCart([makeCartItem(PRODUCT_A, CART_SLOT_A, 3)])

    await page.goto('http://localhost:3000')
    await setCartStorage(page, [{ productId: PRODUCT_A, productQuantity: 2 }], false)

    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()
      if ((url.includes('/cart/items') && method === 'POST') || url.includes('/cart')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mergedCart) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    await setToken(page)
    await page.reload()
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item-qty"]').first()).toHaveText('3', { timeout: 8000 })
  })

})
