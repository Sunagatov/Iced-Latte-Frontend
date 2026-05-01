import { test, expect } from '@playwright/test'
import { ensureAuth } from './helpers/ensureAuth'
import { IS_REAL } from './helpers/mockRoute'
import { REAL_PRODUCT_ID } from './helpers/realData'
import { clearCart, seedExactCart } from './helpers/seedReal'
import { loginAndGoto, mockWithCart } from './helpers/catalogButtons'

test.describe('Logged-in: cart page plus / minus / trash buttons', () => {
  test.use({
    storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] },
  })
  test.setTimeout(30000)
  test.beforeEach(async ({ page }) => {
    await ensureAuth(page)
  })
  test.afterEach(async ({ page }) => {
    await clearCart(page)
  })

  test('plus button increments quantity', async ({ page }) => {
    if (IS_REAL) {
      await seedExactCart(page, [
        { productId: REAL_PRODUCT_ID, productQuantity: 1 },
      ])
      await page.goto('/cart')
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      const qty = page.locator('[data-testid="cart-item-qty"]').first()
      const before = Number(await qty.textContent())

      await page.locator('[data-testid="cart-plus-btn"]').first().click()
      await expect(qty).not.toHaveText(String(before), { timeout: 10000 })
      expect(Number(await qty.textContent())).toBeGreaterThan(before)
      return
    }

    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/cart', 1)
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    const qty = page.locator('[data-testid="cart-item-qty"]').first()
    const before = Number(await qty.textContent())

    await page.locator('[data-testid="cart-plus-btn"]').first().click()
    await expect(qty).not.toHaveText(String(before), { timeout: 5000 })
    expect(Number(await qty.textContent())).toBeGreaterThan(before)
  })

  test('minus button decrements quantity', async ({ page }) => {
    if (IS_REAL) {
      await seedExactCart(page, [
        { productId: REAL_PRODUCT_ID, productQuantity: 2 },
      ])
      await page.goto('/cart')
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      const qty = page.locator('[data-testid="cart-item-qty"]').first()

      await expect(qty).toHaveText('2', { timeout: 10000 })
      await page.locator('[data-testid="cart-minus-btn"]').first().click()
      await expect(qty).toHaveText('1', { timeout: 10000 })
      return
    }

    await mockWithCart(page, 2, [], true)
    await loginAndGoto(page, '/cart', 2)
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    const qty = page.locator('[data-testid="cart-item-qty"]').first()

    await expect(qty).toHaveText('2', { timeout: 5000 })
    await page.locator('[data-testid="cart-minus-btn"]').first().click()
    await expect(qty).toHaveText('1', { timeout: 8000 })
  })

  test('trash button removes item from cart', async ({ page }) => {
    if (IS_REAL) {
      await seedExactCart(page, [
        { productId: REAL_PRODUCT_ID, productQuantity: 1 },
      ])
      await page.goto('/cart')
      await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
      await page.locator('[data-testid="cart-trash-btn"]').first().click()
      await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({
        timeout: 10000,
      })
      return
    }

    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/cart', 1)
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    await page.locator('[data-testid="cart-trash-btn"]').first().click()
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Guest: cart page plus / minus / trash buttons', () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => {
    if (IS_REAL) {
      await page.waitForLoadState('domcontentloaded')
    }
  })

  test('plus and minus buttons work on cart page', async ({ page }) => {
    if (!IS_REAL) {
      await mockWithCart(page, 0)
    }

    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page.locator('[data-testid="counter-plus-btn"]').first().waitFor({
      timeout: 5000,
    })
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
    if (!IS_REAL) {
      await mockWithCart(page, 0)
    }

    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page.locator('[data-testid="counter-plus-btn"]').first().waitFor({
      timeout: 5000,
    })
    await page.goto('/cart')
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 })
    await page.locator('[data-testid="cart-trash-btn"]').first().click()
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0, {
      timeout: 5000,
    })
  })
})
