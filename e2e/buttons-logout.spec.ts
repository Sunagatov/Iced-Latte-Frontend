import { test, expect } from '@playwright/test'
import { ensureAuth } from './helpers/ensureAuth'
import { IS_REAL } from './helpers/mockRoute'
import { REAL_PRODUCT_ID } from './helpers/realData'
import {
  clearCart,
  clearFavourites,
  seedExactCart,
  seedExactFavourites,
} from './helpers/seedReal'
import {
  loginAndGoto,
  mockLoggedOutProductRoutes,
  mockWithCart,
  product,
} from './helpers/catalogButtons'
import { openCatalogAndWaitReady } from './helpers/waits'

test.describe('Logout clears cart and favourites state', () => {
  test.use({
    storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] },
  })
  test.setTimeout(30000)
  test.beforeEach(async ({ page }) => {
    await ensureAuth(page)
  })
  test.afterEach(async ({ page }) => {
    await clearCart(page)
    await clearFavourites(page)
  })

  test('cart counter resets after logout', async ({ page }) => {
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
      await page.evaluate(() => {
        localStorage.removeItem('cart-storage')
        localStorage.removeItem('fav-storage')
      })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('[data-testid="product-card"]', {
        timeout: 10000,
      })
      await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first())
        .toBeVisible({ timeout: 5000 })
      return
    }

    await mockWithCart(page, 1, [], true)
    await loginAndGoto(page, '/', 1)
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await page.locator('[data-testid="counter-plus-btn"]').first().waitFor({
      timeout: 8000,
    })
    await mockLoggedOutProductRoutes(page)
    await page.evaluate(() => {
      localStorage.removeItem('cart-storage')
      localStorage.removeItem('fav-storage')
    })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await expect(page.locator('[data-testid="add-to-cart-circle-btn"]').first())
      .toBeVisible({ timeout: 5000 })
  })

  test('heart resets to inactive after logout', async ({ page }) => {
    if (IS_REAL) {
      await seedExactFavourites(page, [REAL_PRODUCT_ID])
      await page.goto('/')
      await page.waitForSelector('[data-testid="product-card"]', {
        timeout: 10000,
      })
      await page.evaluate(() => {
        localStorage.removeItem('fav-storage')
      })
      await page.goto('/')
      await openCatalogAndWaitReady(page)
      await expect(page.locator('[data-testid="favourite-btn"]').first())
        .toHaveAttribute('data-active', 'false', { timeout: 5000 })
      return
    }

    await mockWithCart(page, 0, [product], true)
    await loginAndGoto(page, '/', 0)
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await mockLoggedOutProductRoutes(page)
    await page.evaluate(() => {
      localStorage.removeItem('fav-storage')
    })
    await page.goto('/')
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    })
    await expect(page.locator('[data-testid="favourite-btn"]').first())
      .toHaveAttribute('data-active', 'false', { timeout: 5000 })
  })
})
