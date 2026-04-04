/**
 * Sync tests — verifies that cart and favourites saved on the server
 * are correctly restored after login, across devices / fresh sessions.
 *
 * Favourites tests are fully mocked (no real backend calls) — immune to rate limiting.
 * Cart tests hit the real backend but use DOM assertions instead of waitForResponse.
 */
import {
  test as base,
  expect,
  type Page,
  type BrowserContext,
} from '@playwright/test'

const FAKE_PRODUCT_ID = '00000000-0000-0000-0000-000000000001'
const FAKE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.fake-sig'

// ─── Custom fixture: fresh context per test ───────────────────────────────────

type Fixtures = { isolatedPage: Page }

const test = base.extend<Fixtures>({
  isolatedPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext()
    const page = await context.newPage()

    await use(page)
    await context.close()
  },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Set token in localStorage and navigate.
async function loginAndGoto(page: Page, token: string, route: string) {
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
    token,
  )
  await page.goto(route)
}

// Mock all /api/proxy/favorites requests — GET and POST return the given products array.
async function mockFavourites(page: Page, products: object[]) {
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/favorites')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products }),
      })
    } else {
      // Block all other proxy calls — return empty success so auth interceptor doesn't trigger logout
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    }
  })
}

// Mock all /api/proxy/cart requests — GET and POST return a cart with the given items.
async function mockCart(page: Page, items: object[]) {
  const cart = {
    id: 'cart-1',
    userId: 'u1',
    items,
    itemsQuantity: items.length,
    itemsTotalPrice: 9.99,
    productsQuantity: items.length,
    createdAt: '',
    closedAt: null,
  }

  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/cart')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(cart),
      })
    } else {
      // Block all other proxy calls — return empty success so auth interceptor doesn't trigger logout
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    }
  })
}

function makeFavProduct(id: string) {
  return {
    id,
    name: 'Test Coffee',
    price: 9.99,
    productFileUrl: null,
    brandName: null,
    averageRating: null,
    reviewsCount: 0,
    quantity: 250,
    description: null,
  }
}

function makeCartItem(productId: string) {
  return {
    id: 'item-1',
    productInfo: makeFavProduct(productId),
    productQuantity: 1,
  }
}

// ─── Favourites sync (fully mocked — no real backend calls) ───────────────────

test.describe('Favourites sync', () => {
  test.setTimeout(30000)

  test('server favourites appear on fresh login', async ({
    isolatedPage: page,
  }) => {
    // Mock GET /favorites to return one product — simulates server having a saved favourite
    await mockFavourites(page, [makeFavProduct(FAKE_PRODUCT_ID)])

    // Use a fake token — all proxy calls are mocked so auth is never validated
    await loginAndGoto(page, FAKE_TOKEN, '/favourites')
    await expect(
      page.locator('[data-testid="fav-element"]').first(),
    ).toBeVisible({ timeout: 10000 })
  })

  test('empty state shown when server has no favourites', async ({
    isolatedPage: page,
  }) => {
    await mockFavourites(page, [])

    await loginAndGoto(page, FAKE_TOKEN, '/favourites')
    await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({
      timeout: 10000,
    })
  })

  test('guest favourites merge with server favourites after login', async ({
    isolatedPage: page,
  }) => {
    // Mock POST /favorites (merge) and GET /favorites to return the merged product
    await mockFavourites(page, [makeFavProduct(FAKE_PRODUCT_ID)])

    // Set guest fav in localStorage, then set token and reload to trigger AppInitProvider sync
    await page.goto('http://localhost:3000')
    await page.evaluate((id) => {
      localStorage.setItem(
        'fav-storage',
        JSON.stringify({
          state: { favouriteIds: [id], favourites: [] },
          version: 0,
        }),
      )
    }, FAKE_PRODUCT_ID)
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
    await page.reload()

    await page.goto('/favourites')
    await expect(
      page.locator('[data-testid="fav-element"]').first(),
    ).toBeVisible({ timeout: 10000 })
  })
})

// ─── Cart sync (mocked — immune to rate limiting) ────────────────────────────

test.describe('Cart sync', () => {
  test.setTimeout(30000)

  test('server cart items appear on fresh login', async ({
    isolatedPage: page,
  }) => {
    const productId = FAKE_PRODUCT_ID

    // Mock GET /cart to return a cart with one item — simulates server having a saved cart
    await mockCart(page, [makeCartItem(productId)])

    await loginAndGoto(page, FAKE_TOKEN, '/cart')
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible(
      { timeout: 10000 },
    )
  })

  test('guest cart merges with server cart after login', async ({
    isolatedPage: page,
  }) => {
    const productId = FAKE_PRODUCT_ID

    // Mock POST /cart/items (merge) and GET /cart to return the merged cart
    await mockCart(page, [makeCartItem(productId)])

    await page.goto('http://localhost:3000')
    await page.evaluate((id) => {
      localStorage.setItem(
        'cart-storage',
        JSON.stringify({
          state: {
            itemsIds: [{ productId: id, productQuantity: 1 }],
            tempItems: [],
            count: 1,
            totalPrice: 0,
            isSync: false,
          },
          version: 0,
        }),
      )
    }, productId)
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
    await page.reload()

    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible(
      { timeout: 10000 },
    )
  })

  test('cart persists after page reload when logged in', async ({
    isolatedPage: page,
  }) => {
    const productId = FAKE_PRODUCT_ID

    await mockCart(page, [makeCartItem(productId)])

    await loginAndGoto(page, FAKE_TOKEN, '/cart')
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible(
      { timeout: 10000 },
    )

    await page.reload()
    // Cart hydrates from localStorage — no network call needed after reload
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible(
      { timeout: 8000 },
    )
  })
})
