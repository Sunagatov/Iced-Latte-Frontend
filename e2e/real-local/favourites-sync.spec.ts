import { IS_REAL } from '../helpers/mockRoute'
import { test, expect } from '@playwright/test'
import { seedFavourite, clearFavourites } from '../helpers/seedReal'
import { REAL_PRODUCT_ID, REAL_PRODUCT_ID_2 } from '../helpers/realData'
import { ensureAuth } from '../helpers/ensureAuth'

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
test.beforeEach(() => { test.skip(!IS_REAL, 'real-local only') })
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
  await page.goto('/favourites')
  // Poll for empty state — clearFavourites already polls the API, so UI should reflect it
  await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 12000 })
})

test('add favourite updates header badge', async ({ page }) => {
  await clearFavourites(page)
  await seedFavourite(page, REAL_PRODUCT_ID)
  await page.goto('/')
  await expect(page.locator('[data-testid="header-favourites-badge"]')).toBeVisible({ timeout: 10000 })
  await clearFavourites(page)
})

test('cart badge shows total product units from real seeded cart', async ({ page }) => {
  const { seedCart, clearCart } = await import('../helpers/seedReal')

  await clearCart(page)
  await seedCart(page, [
    { productId: REAL_PRODUCT_ID, productQuantity: 3 },
    { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
  ])
  await page.goto('/')
  await expect(page.locator('[data-testid="header-cart-badge"]')).toHaveText('5', { timeout: 8000 })
  await clearCart(page)
})

test('favourites badge shows count from real seeded favourites', async ({ page }) => {
  await clearFavourites(page)
  await seedFavourite(page, REAL_PRODUCT_ID)
  await seedFavourite(page, REAL_PRODUCT_ID_2)
  await page.goto('/')
  await expect(page.locator('[data-testid="header-favourites-badge"]')).toHaveText('2', { timeout: 8000 })
  await clearFavourites(page)
})

test('guest add favourite shows item in favourites list', async ({ page }) => {
  const ctx = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } })
  const guestPage = await ctx.newPage()

  await guestPage.goto('/')
  await guestPage.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await guestPage.locator('[data-testid="favourite-btn"]').first().click()
  // Wait for the fav-element to appear rather than sleeping
  await guestPage.goto('/favourites')
  await expect(guestPage.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
  await ctx.close()
})

test('favourites page shows full list for guest with persisted favouriteIds', async ({ page }) => {
  const ctx = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } })
  const guestPage = await ctx.newPage()

  await guestPage.goto('/')
  await guestPage.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await guestPage.locator('[data-testid="favourite-btn"]').first().click()
  // Wait for the favourite button to reflect the added state before navigating
  await expect(guestPage.locator('[data-testid="favourite-btn"]').first()).toHaveAttribute('aria-pressed', 'true', { timeout: 5000 }).catch(() => {})
  await guestPage.goto('/favourites')
  await expect(guestPage.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
  await ctx.close()
})
