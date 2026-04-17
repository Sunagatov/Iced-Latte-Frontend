import { IS_REAL } from '../helpers/mockRoute'
import { test } from '@playwright/test'
import { seedExactFavourites, clearFavourites } from '../helpers/seedReal'
import { REAL_PRODUCT_ID, REAL_PRODUCT_ID_2 } from '../helpers/realData'
import { ensureAuth } from '../helpers/ensureAuth'
import { gotoFavouritesAndWaitForCount, gotoHomeAndWaitForFavouritesBadge, gotoHomeAndWaitForCartBadge } from '../helpers/waits'

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
test.beforeEach(() => { test.skip(!IS_REAL, 'real-local only') })
test.beforeEach(async ({ page }) => { await ensureAuth(page) })
test.setTimeout(60000)

test('favourites shows item after seeding', async ({ page }) => {
  await seedExactFavourites(page, [REAL_PRODUCT_ID])
  await gotoFavouritesAndWaitForCount(page, 1)
  await clearFavourites(page)
})

test('favourites shows empty state after clearing', async ({ page }) => {
  await clearFavourites(page)
  await gotoFavouritesAndWaitForCount(page, 0)
})

test('add favourite updates header badge', async ({ page }) => {
  await seedExactFavourites(page, [REAL_PRODUCT_ID])
  await gotoHomeAndWaitForFavouritesBadge(page, 1)
  await clearFavourites(page)
})

test('cart badge shows total product units from real seeded cart', async ({ page }) => {
  const { seedExactCart, clearCart } = await import('../helpers/seedReal')

  await seedExactCart(page, [
    { productId: REAL_PRODUCT_ID, productQuantity: 3 },
    { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
  ])
  await gotoHomeAndWaitForCartBadge(page, 5)
  await clearCart(page)
})

test('favourites badge shows count from real seeded favourites', async ({ page }) => {
  await seedExactFavourites(page, [REAL_PRODUCT_ID, REAL_PRODUCT_ID_2])
  await gotoHomeAndWaitForFavouritesBadge(page, 2)
  await clearFavourites(page)
})

test('guest add favourite shows item in favourites list', async ({ page }) => {
  const ctx = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } })
  const guestPage = await ctx.newPage()

  await guestPage.goto('/')
  await guestPage.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await guestPage.locator('[data-testid="favourite-btn"]').first().click()
  await gotoFavouritesAndWaitForCount(guestPage, 1)
  await ctx.close()
})

test('favourites page shows full list for guest with persisted favouriteIds', async ({ page }) => {
  const ctx = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } })
  const guestPage = await ctx.newPage()

  await guestPage.goto('/')
  await guestPage.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await guestPage.locator('[data-testid="favourite-btn"]').first().click()
  await gotoFavouritesAndWaitForCount(guestPage, 1)
  await ctx.close()
})
