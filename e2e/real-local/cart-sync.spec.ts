import { IS_REAL } from '../helpers/mockRoute'
import { test, expect } from '@playwright/test'
import { seedExactCart, clearCart } from '../helpers/seedReal'
import { REAL_PRODUCT_ID, REAL_PRODUCT_ID_2 } from '../helpers/realData'
import { ensureAuth } from '../helpers/ensureAuth'
import { gotoCartAndWaitForItems } from '../helpers/waits'

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
test.beforeEach(() => { test.skip(!IS_REAL, 'real-local only') })
test.beforeEach(async ({ page }) => { await ensureAuth(page) })
test.setTimeout(40000)

test('cart shows item after seeding', async ({ page }) => {
  await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await gotoCartAndWaitForItems(page, 1)
  await clearCart(page)
})

test('cart shows empty state after clearing', async ({ page }) => {
  await clearCart(page)
  await gotoCartAndWaitForItems(page, 0)
})

test('cart with two products shows both items', async ({ page }) => {
  await seedExactCart(page, [
    { productId: REAL_PRODUCT_ID, productQuantity: 1 },
    { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
  ])
  await gotoCartAndWaitForItems(page, 2)
  await clearCart(page)
})

test('increasing quantity updates item count display', async ({ page }) => {
  await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await gotoCartAndWaitForItems(page, 1)
  await page.locator('[data-testid="cart-plus-btn"]').first().click()
  await expect(page.locator('[data-testid="cart-item-qty"]').first()).toHaveText('2', { timeout: 10000 })
  await clearCart(page)
})

test('minus button shows trash icon when quantity is 1', async ({ page }) => {
  await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await gotoCartAndWaitForItems(page, 1)
  await expect(page.locator('[data-testid="cart-minus-btn"]').first()).toHaveAttribute('aria-label', 'Remove item', { timeout: 10000 })
  await clearCart(page)
})

test('removing last unit of item shows empty cart', async ({ page }) => {
  await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await gotoCartAndWaitForItems(page, 1)
  await page.locator('[data-testid="cart-minus-btn"]').first().click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
})

test('trash button removes item and shows empty cart', async ({ page }) => {
  await seedExactCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await gotoCartAndWaitForItems(page, 1)
  await page.locator('[data-testid="cart-trash-btn"]').first().click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
})

test('clear all removes all items and shows empty state', async ({ page }) => {
  await seedExactCart(page, [
    { productId: REAL_PRODUCT_ID, productQuantity: 1 },
    { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
  ])
  await gotoCartAndWaitForItems(page, 2)
  await page.getByText('Clear all').click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
})
