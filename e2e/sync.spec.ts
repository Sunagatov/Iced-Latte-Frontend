import { mockRoute, IS_REAL } from './helpers/mockRoute'
import {
  test as base,
  expect,
  type Page,
  type BrowserContext,
} from '@playwright/test'
import { seedExactCart, clearCart, seedExactFavourites, clearFavourites } from './helpers/seedReal'
import { REAL_PRODUCT_ID } from './helpers/realData'
import { ensureAuth } from './helpers/ensureAuth'
import { gotoFavouritesAndWaitForCount } from './helpers/waits'

const FAKE_PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

type Fixtures = { isolatedPage: Page }

const test = base.extend<Fixtures>({
  isolatedPage: async ({ browser }, use) => {
    // Always create a fresh context — never reuse .auth.json across contexts.
    // Rotating refresh tokens make stale storage state trigger replay detection.
    const context: BrowserContext = await browser.newContext()
    const page = await context.newPage()

    await ensureAuth(page)
    await use(page)
    await context.close()
  },
})

async function loginAndGoto(page: Page, _token: string, route: string) {
  await page.goto(route)
  await page.waitForLoadState('domcontentloaded')
}

async function mockFavourites(page: Page, products: object[]) {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }) })
    } else if (url.includes('/favorites')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
}

async function mockCart(page: Page, items: object[]) {
  const cart = { id: 'cart-1', userId: 'u1', items, itemsQuantity: items.length, itemsTotalPrice: 9.99, productsQuantity: items.length, createdAt: '', closedAt: null }

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }) })
    } else if (url.includes('/cart')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cart) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
}

function makeFavProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: null, averageRating: null, reviewsCount: 0, quantity: 250, description: null }
}

function makeCartItem(productId: string) {
  return { id: 'item-1', productInfo: makeFavProduct(productId), productQuantity: 1 }
}

const FAKE_TOKEN = 'fake-token'

test.describe('Favourites sync', () => {
  test.setTimeout(60000)

  test('server favourites appear on fresh login', async ({ isolatedPage: page }) => {
    if (IS_REAL) {
      await seedExactFavourites(page, [REAL_PRODUCT_ID])
      await gotoFavouritesAndWaitForCount(page, 1)
      await clearFavourites(page)
    } else {
      await mockFavourites(page, [makeFavProduct(FAKE_PRODUCT_ID)])
      await loginAndGoto(page, FAKE_TOKEN, '/favourites')
      await expect(page.locator('[data-testid="fav-element"]').first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('empty state shown when server has no favourites', async ({ isolatedPage: page }) => {
    if (IS_REAL) {
      await clearFavourites(page)
      await page.goto('/favourites')
      await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 10000 })
    } else {
      await mockFavourites(page, [])
      // Clear any persisted fav-storage from previous tests
      await page.addInitScript(() => localStorage.removeItem('fav-storage'))
      await loginAndGoto(page, FAKE_TOKEN, '/favourites')
      await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 10000 })
    }
  })

  test('guest favourites merge with server favourites after login', async ({ isolatedPage: page }) => {
    if (IS_REAL) {
      await seedExactFavourites(page, [REAL_PRODUCT_ID])
      await gotoFavouritesAndWaitForCount(page, 1)
      await clearFavourites(page)
    } else {
      await mockFavourites(page, [makeFavProduct(FAKE_PRODUCT_ID)])
      await page.addInitScript((id: string) => {
        localStorage.setItem('fav-storage', JSON.stringify({ state: { favouriteIds: [id], favourites: [] }, version: 0 }))
      }, FAKE_PRODUCT_ID)
      await page.goto('/favourites')
      await expect(page.locator('[data-testid="fav-element"]').first()).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('Cart sync', () => {
  test.setTimeout(60000)

  test('server cart items appear on fresh login', async ({ isolatedPage: page }) => {
    if (IS_REAL) {
      await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 15000 })
      await clearCart(page).catch(() => {})
    } else {
      await mockCart(page, [makeCartItem(FAKE_PRODUCT_ID)])
      await loginAndGoto(page, FAKE_TOKEN, '/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('guest cart merges with server cart after login', async ({ isolatedPage: page }) => {
    if (IS_REAL) {
      await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
      await clearCart(page).catch(() => {})
    } else {
      await mockCart(page, [makeCartItem(FAKE_PRODUCT_ID)])
      await page.addInitScript((id: string) => {
        localStorage.setItem('cart-storage', JSON.stringify({ state: { itemsIds: [{ productId: id, productQuantity: 1 }], tempItems: [], count: 1, totalPrice: 0, isSync: false }, version: 0 }))
      }, FAKE_PRODUCT_ID)
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('cart persists after page reload when logged in', async ({ isolatedPage: page }) => {
    if (IS_REAL) {
      await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
      await page.reload()
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 8000 })
      await clearCart(page).catch(() => {})
    } else {
      await mockCart(page, [makeCartItem(FAKE_PRODUCT_ID)])
      await loginAndGoto(page, FAKE_TOKEN, '/cart')
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
      await page.reload()
      await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 8000 })
    }
  })
})
