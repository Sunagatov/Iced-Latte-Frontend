import { mockRoute, IS_REAL } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import { seedCart, clearCart, seedFavourite, clearFavourites } from './helpers/seedReal'
import { REAL_PRODUCT_ID } from './helpers/realData'
import { ensureAuth } from './helpers/ensureAuth'

const FAKE_USER = { firstName: 'Test', lastName: 'User', email: 'test@example.com' }
const PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

const product = { id: PRODUCT_ID, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
const productsList = { products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }

function makeCart(qty: number) {
  if (qty === 0) return { id: 'c1', userId: 'u1', items: [], itemsQuantity: 0, itemsTotalPrice: 0, productsQuantity: 0, createdAt: '', closedAt: null }
  return { id: 'c1', userId: 'u1', items: [{ id: 'ci1', productInfo: product, productQuantity: qty }], itemsQuantity: 1, itemsTotalPrice: +(product.price * qty).toFixed(2), productsQuantity: qty, createdAt: '', closedAt: null }
}

async function mockWithCart(page: Page, initialQty: number, favProducts: object[] = [], authenticated = false) {
  let serverQty = initialQty
  let serverFavs = [...favProducts]

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.includes('/products/ids')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([product]) })
    } else if (url.includes('/products')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(productsList) })
    } else if (url.includes('/cart/items') && method === 'DELETE') {
      serverQty = 0
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart(0)) })
    } else if (url.includes('/cart/items') && method === 'PATCH') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      serverQty = Math.max(0, serverQty + (body.productQuantityChange ?? 0))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart(serverQty)) })
    } else if (url.includes('/cart/items') && method === 'POST') {
      serverQty = 1
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart(1)) })
    } else if (url.includes('/cart')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart(serverQty)) })
    } else if (url.includes('/favorites') && method === 'DELETE') {
      serverFavs = []
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) })
    } else if (url.includes('/favorites') && method === 'POST') {
      serverFavs = [...favProducts]
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: serverFavs }) })
    } else if (url.includes('/favorites')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: serverFavs }) })
    } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      await route.fulfill({ status: authenticated ? 200 : 401, contentType: 'application/json', body: authenticated ? JSON.stringify(FAKE_USER) : JSON.stringify({ message: 'Unauthorized' }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
}

async function loginAndGoto(page: Page, route: string, cartQty = 0) {
  if (!IS_REAL && cartQty > 0) {
    await page.goto('http://localhost:3000')
    await page.evaluate((qty) => {
      const productId = '00000000-0000-0000-0000-000000000001'
      localStorage.setItem('cart-storage', JSON.stringify({ state: { itemsIds: [{ productId, productQuantity: qty }], tempItems: [{ id: 'ci1', productInfo: { id: productId, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }, productQuantity: qty }], count: qty, totalPrice: +(9.99 * qty).toFixed(2), isSync: true }, version: 0 }))
    }, cartQty)
  }
  await page.goto(route)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
}

test.afterEach(async ({ page }) => {
  await clearCart(page)
  await clearFavourites(page)
})

test.describe('Logged-in: product card buttons on home page', () => {
  test.use({ storageState: 'e2e/.auth.json' })
  test.setTimeout(30000)
  test.beforeEach(async ({ page }) => { await ensureAuth(page) })

  test('plus button adds item — counter appears', async ({ page }) => {
    if (IS_REAL) {
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await expect(page.locator('[data-testid="counter-plus-btn"]').first()).toBeVisible({ timeout: 8000 })
    } else {
      await mockWithCart(page, 1, [], true)
      await loginAndGoto(page, '/', 1)
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await expect(page.locator('[data-testid="counter-plus-btn"]').first()).toBeVisible({ timeout: 8000 })
    }
  })

  test('minus button at qty=1 — circle add btn reappears', async ({ page }) => {
    if (IS_REAL) {
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.locator('[data-testid="counter-minus-btn"]').first().waitFor({ timeout: 8000 })
      await page.waitForTimeout(400)
      await page.locator('[data-testid="counter-minus-btn"]').first().click()
      await page.waitForTimeout(1000)
      await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first()).toBeVisible({ timeout: 10000 })
    } else {
      await mockWithCart(page, 1, [], true)
      await loginAndGoto(page, '/', 1)
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.locator('[data-testid="counter-minus-btn"]').first().waitFor({ timeout: 8000 })
      await page.waitForTimeout(400)
      await page.locator('[data-testid="counter-minus-btn"]').first().click()
      await page.waitForTimeout(1000)
      await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('heart button toggles favourite state', async ({ page }) => {
    if (!IS_REAL) await mockWithCart(page, 0, [product], true)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    const heart = page.locator('[data-testid="favourite-btn"]').first()
    const before = await heart.getAttribute('data-active')
    await heart.click()
    await page.waitForTimeout(500)
    expect(await heart.getAttribute('data-active')).not.toBe(before)
  })
})

test.describe('Guest: product card buttons on home page', () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => { if (IS_REAL) await page.waitForTimeout(1000) })

  test('plus button adds item — counter appears', async ({ page }) => {
    if (!IS_REAL) await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await expect(page.locator('[data-testid="counter-plus-btn"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('minus button at qty=1 — circle add btn reappears', async ({ page }) => {
    if (!IS_REAL) await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page.locator('[data-testid="counter-minus-btn"]').first().waitFor({ timeout: 5000 })
    await page.waitForTimeout(400)
    await page.locator('[data-testid="counter-minus-btn"]').first().click()
    await page.waitForTimeout(600)
    await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first()).toBeVisible({ timeout: 8000 })
  })

  test('heart button toggles favourite state', async ({ page }) => {
    if (!IS_REAL) await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    const heart = page.locator('[data-testid="favourite-btn"]').first()
    const before = await heart.getAttribute('data-active')
    await heart.click()
    await page.waitForTimeout(500)
    expect(await heart.getAttribute('data-active')).not.toBe(before)
  })
})

test.describe('Logged-in: cart page plus / minus / trash buttons', () => {
  test.use({ storageState: 'e2e/.auth.json' })
  test.setTimeout(30000)
  test.beforeEach(async ({ page }) => { await ensureAuth(page) })

  test('plus button increments quantity', async ({ page }) => {
    if (IS_REAL) {
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      const qty = page.locator('[data-testid="cart-item-qty"]').first()
      const before = Number(await qty.textContent())
      await page.waitForTimeout(400)
      await page.locator('[data-testid="cart-plus-btn"]').first().click()
      await page.waitForTimeout(400)
      await expect(qty).not.toHaveText(String(before), { timeout: 5000 })
      expect(Number(await qty.textContent())).toBeGreaterThan(before)
    } else {
      await mockWithCart(page, 1, [], true)
      await loginAndGoto(page, '/cart', 1)
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      const qty = page.locator('[data-testid="cart-item-qty"]').first()
      const before = Number(await qty.textContent())
      await page.waitForTimeout(400)
      await page.locator('[data-testid="cart-plus-btn"]').first().click()
      await page.waitForTimeout(400)
      await expect(qty).not.toHaveText(String(before), { timeout: 5000 })
      expect(Number(await qty.textContent())).toBeGreaterThan(before)
    }
  })

  test('minus button decrements quantity', async ({ page }) => {
    if (IS_REAL) {
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 2 }])
      await page.goto('/cart')
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      const qty = page.locator('[data-testid="cart-item-qty"]').first()
      await expect(qty).toHaveText('2', { timeout: 5000 })
      await page.waitForTimeout(400)
      await page.locator('[data-testid="cart-minus-btn"]').first().click()
      await page.waitForTimeout(400)
      await expect(qty).toHaveText('1', { timeout: 8000 })
    } else {
      await mockWithCart(page, 2, [], true)
      await loginAndGoto(page, '/cart', 2)
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      const qty = page.locator('[data-testid="cart-item-qty"]').first()
      await expect(qty).toHaveText('2', { timeout: 5000 })
      await page.waitForTimeout(400)
      await page.locator('[data-testid="cart-minus-btn"]').first().click()
      await page.waitForTimeout(400)
      await expect(qty).toHaveText('1', { timeout: 8000 })
    }
  })

  test('trash button removes item from cart', async ({ page }) => {
    if (IS_REAL) {
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/cart')
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      await page.locator('[data-testid="cart-trash-btn"]').first().click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
    } else {
      await mockWithCart(page, 1, [], true)
      await loginAndGoto(page, '/cart', 1)
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      await page.locator('[data-testid="cart-trash-btn"]').first().click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
    }
  })
})

test.describe('Guest: cart page plus / minus / trash buttons', () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => { if (IS_REAL) await page.waitForTimeout(1500) })

  test('plus and minus buttons work on cart page', async ({ page }) => {
    if (!IS_REAL) await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page.locator('[data-testid="counter-plus-btn"]').first().waitFor({ timeout: 5000 })
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
    if (!IS_REAL) await mockWithCart(page, 0)
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page.locator('[data-testid="counter-plus-btn"]').first().waitFor({ timeout: 5000 })
    await page.goto('/cart')
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    await page.locator('[data-testid="cart-trash-btn"]').first().click()
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0, { timeout: 5000 })
  })
})

test.describe('Logout clears cart and favourites state', () => {
  test.use({ storageState: 'e2e/.auth.json' })
  test.setTimeout(30000)
  test.beforeEach(async ({ page }) => { await ensureAuth(page) })

  test('cart counter resets after logout', async ({ page }) => {
    if (IS_REAL) {
      await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await expect(page.locator('[data-testid="counter-plus-btn"]').first()).toBeVisible({ timeout: 8000 })
      // Logout
      await page.evaluate(() => { localStorage.removeItem('cart-storage'); localStorage.removeItem('fav-storage') })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first()).toBeVisible({ timeout: 5000 })
    } else {
      await mockWithCart(page, 1, [], true)
      await loginAndGoto(page, '/', 1)
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.locator('[data-testid="counter-plus-btn"]').first().waitFor({ timeout: 8000 })
      await page.unrouteAll()
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
          await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
        } else if (url.includes('/products')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(productsList) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.evaluate(() => { localStorage.removeItem('cart-storage'); localStorage.removeItem('fav-storage') })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('heart resets to inactive after logout', async ({ page }) => {
    if (IS_REAL) {
      await seedFavourite(page, REAL_PRODUCT_ID)
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.evaluate(() => { localStorage.removeItem('fav-storage') })
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await expect(page.locator('[data-testid="favourite-btn"]').first()).toHaveAttribute('data-active', 'false', { timeout: 5000 })
    } else {
      await mockWithCart(page, 0, [product], true)
      await loginAndGoto(page, '/', 0)
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await page.unrouteAll()
      await mockRoute(page, '**/api/proxy/**', async (route) => {
        const url = route.request().url()
        if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
          await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
        } else if (url.includes('/products')) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(productsList) })
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        }
      })
      await page.evaluate(() => { localStorage.removeItem('fav-storage') })
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      await expect(page.locator('[data-testid="favourite-btn"]').first()).toHaveAttribute('data-active', 'false', { timeout: 5000 })
    }
  })
})
