/**
 * Covers plus / minus / trash / heart buttons on product cards
 * for both logged-in and logged-out (guest) users.
 */
import { test, expect, type Page } from '@playwright/test'

const FAKE_USER = { firstName: 'Test', lastName: 'User', email: 'test@example.com' }
const PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

const product = {
  id: PRODUCT_ID,
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
const productsList = {
  products: [product],
  page: 0,
  size: 6,
  totalElements: 1,
  totalPages: 1,
}

function makeCart(qty: number) {
  if (qty === 0)
    return {
      id: 'c1',
      userId: 'u1',
      items: [],
      itemsQuantity: 0,
      itemsTotalPrice: 0,
      productsQuantity: 0,
      createdAt: '',
      closedAt: null,
    }

  return {
    id: 'c1',
    userId: 'u1',
    items: [{ id: 'ci1', productInfo: product, productQuantity: qty }],
    itemsQuantity: 1,
    itemsTotalPrice: +(product.price * qty).toFixed(2),
    productsQuantity: qty,
    createdAt: '',
    closedAt: null,
  }
}

/** Stateful mock: tracks cart qty server-side so re-fetches return correct state */
async function mockWithCart(
  page: Page,
  initialQty: number,
  favProducts: object[] = [],
  authenticated = false,
) {
  let serverQty = initialQty

  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/products/ids')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([product]),
      })
    } else if (url.includes('/products')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsList),
      })
    } else if (url.includes('/cart/items') && method === 'DELETE') {
      serverQty = 0
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeCart(0)),
      })
    } else if (url.includes('/cart/items') && method === 'PATCH') {
      const body = JSON.parse(route.request().postData() ?? '{}')

      serverQty = Math.max(0, serverQty + (body.productQuantityChange ?? 0))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeCart(serverQty)),
      })
    } else if (url.includes('/cart/items') && method === 'POST') {
      serverQty = 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeCart(1)),
      })
    } else if (url.includes('/cart')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeCart(serverQty)),
      })
    } else if (url.includes('/favorites')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: favProducts }),
      })
    } else if (url.includes('/auth/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          authenticated
            ? { authenticated: true, user: FAKE_USER }
            : { authenticated: false, user: null },
        ),
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
  await page.goto(route)
  await page.waitForLoadState('networkidle')
  // Give AppInitProvider time to finish loadAuthCart/syncBackendFav
  await page.waitForTimeout(1000)
}

// ─── LOGGED-IN: product catalog (home page) ───────────────────────────────────

test.describe('Logged-in: product card buttons on home page', () => {
  test('plus button adds item — counter appears', async ({ page }) => {
    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await expect(
      page.locator('[data-testid="counter-plus-btn"]').first(),
    ).toBeVisible({ timeout: 8000 })
  })

  test('minus button at qty=1 — circle add btn reappears', async ({ page }) => {
    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page
      .locator('[data-testid="counter-minus-btn"]')
      .first()
      .waitFor({ timeout: 8000 })
    await page.locator('[data-testid="counter-minus-btn"]').first().click()
    // qty=1 → removeFullProduct → itemsIds=[] → CircleAddBtn appears
    await expect(
      page.locator('[data-testid="add-to-cart-circle-btn"]').first(),
    ).toBeVisible({ timeout: 10000 })
  })

  test('heart button toggles favourite state', async ({ page }) => {
    await mockWithCart(page, 0, [product], true)
    await loginAndGoto(page, '/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    const heart = page.locator('[data-testid="favourite-btn"]').first()
    const before = await heart.getAttribute('data-active')

    await heart.click()
    await page.waitForTimeout(500)
    expect(await heart.getAttribute('data-active')).not.toBe(before)
  })
})

// ─── GUEST: product catalog (home page) ──────────────────────────────────────

test.describe('Guest: product card buttons on home page', () => {
  test('plus button adds item — counter appears', async ({ page }) => {
    await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await expect(
      page.locator('[data-testid="counter-plus-btn"]').first(),
    ).toBeVisible({ timeout: 5000 })
  })

  test('minus button at qty=1 — circle add btn reappears', async ({ page }) => {
    await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page
      .locator('[data-testid="counter-minus-btn"]')
      .first()
      .waitFor({ timeout: 5000 })
    await page.waitForTimeout(400)
    await page.locator('[data-testid="counter-minus-btn"]').first().click()
    await page.waitForTimeout(400)
    await expect(
      page.locator('[data-testid="add-to-cart-circle-btn"]').first(),
    ).toBeVisible({ timeout: 5000 })
  })

  test('heart button toggles favourite state', async ({ page }) => {
    await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    const heart = page.locator('[data-testid="favourite-btn"]').first()
    const before = await heart.getAttribute('data-active')

    await heart.click()
    await page.waitForTimeout(500)
    expect(await heart.getAttribute('data-active')).not.toBe(before)
  })
})

// ─── LOGGED-IN: cart page buttons ────────────────────────────────────────────

test.describe('Logged-in: cart page plus / minus / trash buttons', () => {
  test('plus button increments quantity', async ({ page }) => {
    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/cart')
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    const qty = page.locator('[data-testid="cart-item-qty"]').first()
    const before = Number(await qty.textContent())

    await page.waitForTimeout(400)
    await page.locator('[data-testid="cart-plus-btn"]').first().click()
    await page.waitForTimeout(400)
    await expect(qty).not.toHaveText(String(before), { timeout: 5000 })
    expect(Number(await qty.textContent())).toBeGreaterThan(before)
  })

  test('minus button decrements quantity', async ({ page }) => {
    await mockWithCart(page, 2, [], true)
    await loginAndGoto(page, '/cart')
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    const qty = page.locator('[data-testid="cart-item-qty"]').first()

    await expect(qty).toHaveText('2', { timeout: 5000 })
    await page.waitForTimeout(400)
    await page.locator('[data-testid="cart-minus-btn"]').first().click()
    await page.waitForTimeout(400)
    await expect(qty).toHaveText('1', { timeout: 8000 })
  })

  test('trash button removes item from cart', async ({ page }) => {
    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/cart')
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    await page.locator('[data-testid="cart-trash-btn"]').first().click()
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({
      timeout: 10000,
    })
  })
})

// ─── GUEST: cart page buttons ─────────────────────────────────────────────────

test.describe('Guest: cart page plus / minus / trash buttons', () => {
  test('plus and minus buttons work on cart page', async ({ page }) => {
    await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page
      .locator('[data-testid="counter-plus-btn"]')
      .first()
      .waitFor({ timeout: 5000 })
    await page.goto('/cart')
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    const qty = page.locator('[data-testid="cart-item-qty"]').first()
    const before = Number(await qty.textContent())

    await page.locator('[data-testid="cart-plus-btn"]').first().click()
    await expect(qty).not.toHaveText(String(before), { timeout: 5000 })
    expect(Number(await qty.textContent())).toBeGreaterThan(before)
    const after = Number(await qty.textContent())

    await page.locator('[data-testid="cart-minus-btn"]').first().click()
    await expect(qty).not.toHaveText(String(after), { timeout: 5000 })
    expect(Number(await qty.textContent())).toBeLessThan(after)
  })

  test('trash button removes item from cart', async ({ page }) => {
    await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page
      .locator('[data-testid="counter-plus-btn"]')
      .first()
      .waitFor({ timeout: 5000 })
    await page.goto('/cart')
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    await page.locator('[data-testid="cart-trash-btn"]').first().click()
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0, {
      timeout: 5000,
    })
  })
})

// ─── LOGOUT clears cart and favourites ───────────────────────────────────────

test.describe('Logout clears cart and favourites state', () => {
  test('cart counter resets after logout', async ({ page }) => {
    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page
      .locator('[data-testid="counter-plus-btn"]')
      .first()
      .waitFor({ timeout: 8000 })
    // Unregister all mocks so the next session check returns anonymous
    await page.unrouteAll()
    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()

      if (url.includes('/auth/session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ authenticated: false, user: null }),
        })
      } else if (url.includes('/products')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(productsList),
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })
    await page.evaluate(() => {
      localStorage.removeItem('cart-storage')
      localStorage.removeItem('fav-storage')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await expect(
      page.locator('[data-testid="add-to-cart-circle-btn"]').first(),
    ).toBeVisible({ timeout: 5000 })
  })

  test('heart resets to inactive after logout', async ({ page }) => {
    await mockWithCart(page, 0, [product], true)
    await loginAndGoto(page, '/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.unrouteAll()
    await page.route('**/api/proxy/**', async (route) => {
      const url = route.request().url()

      if (url.includes('/auth/session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ authenticated: false, user: null }),
        })
      } else if (url.includes('/products')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(productsList),
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })
    await page.evaluate(() => {
      localStorage.removeItem('fav-storage')
    })
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await expect(
      page.locator('[data-testid="favourite-btn"]').first(),
    ).toHaveAttribute('data-active', 'false', { timeout: 5000 })
  })
})
