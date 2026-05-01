import { test, expect } from '@playwright/test'
import { ensureAuth } from './helpers/ensureAuth'
import { IS_REAL } from './helpers/mockRoute'
import { REAL_PRODUCT_ID } from './helpers/realData'
import { clearCart, seedExactCart } from './helpers/seedReal'
import { loginAndGoto, mockWithCart, product } from './helpers/catalogButtons'

test.describe('Logged-in: product card buttons on home page', () => {
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

  test('plus button adds item — counter appears', async ({ page }) => {
    if (IS_REAL) {
      await seedExactCart(page, [
        { productId: REAL_PRODUCT_ID, productQuantity: 1 },
      ])
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', {
        timeout: 10000,
      })
      await expect(page.locator('[data-testid="counter-plus-btn"]').first())
        .toBeVisible({ timeout: 8000 })
      return
    }

    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/', 1)
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await expect(page.locator('[data-testid="counter-plus-btn"]').first())
      .toBeVisible({ timeout: 8000 })
  })

  test('minus button at qty=1 — circle add btn reappears', async ({
    page,
  }) => {
    if (IS_REAL) {
      await seedExactCart(page, [
        { productId: REAL_PRODUCT_ID, productQuantity: 1 },
      ])
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', {
        timeout: 10000,
      })
      await page.locator('[data-testid="counter-minus-btn"]').first().waitFor({
        timeout: 8000,
      })
      await page.locator('[data-testid="counter-minus-btn"]').first().click()
      await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first())
        .toBeVisible({ timeout: 10000 })
      return
    }

    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/', 1)
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="counter-minus-btn"]').first().waitFor({
      timeout: 8000,
    })
    await page.locator('[data-testid="counter-minus-btn"]').first().click()
    await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first())
      .toBeVisible({ timeout: 10000 })
  })

  test('heart button toggles favourite state', async ({ page }) => {
    if (!IS_REAL) {
      await mockWithCart(page, 0, [product], true)
    }

    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    const heart = page.locator('[data-testid="favourite-btn"]').first()
    const before = await heart.getAttribute('data-active')

    await heart.click()
    expect(await heart.getAttribute('data-active')).not.toBe(before)
  })
})

test.describe('Guest: product card buttons on home page', () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test.beforeEach(async ({ page }) => {
    if (IS_REAL) {
      await page.waitForLoadState('domcontentloaded')
    }
  })

  test('plus button adds item — counter appears', async ({ page }) => {
    if (!IS_REAL) {
      await mockWithCart(page, 0)
    }

    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await expect(page.locator('[data-testid="counter-plus-btn"]').first())
      .toBeVisible({ timeout: 5000 })
  })

  test('minus button at qty=1 — circle add btn reappears', async ({
    page,
  }) => {
    if (!IS_REAL) {
      await mockWithCart(page, 0)
    }

    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="add-to-cart-circle-btn"]').first().click()
    await page.locator('[data-testid="counter-minus-btn"]').first().waitFor({
      timeout: 5000,
    })
    await page.locator('[data-testid="counter-minus-btn"]').first().click()
    await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first())
      .toBeVisible({ timeout: 8000 })
  })

  test('heart button toggles favourite state', async ({ page }) => {
    if (!IS_REAL) {
      await mockWithCart(page, 0)
    }

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    const heart = page.locator('[data-testid="favourite-btn"]').first()
    const before = await heart.getAttribute('data-active')

    await heart.click()
    expect(await heart.getAttribute('data-active')).not.toBe(before)
  })
})
