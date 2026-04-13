import { IS_REAL } from '../helpers/mockRoute'
import { test, expect } from '@playwright/test'
import { seedCart, clearCart } from '../helpers/seedReal'
import { REAL_PRODUCT_ID, REAL_PRODUCT_ID_2 } from '../helpers/realData'
import { ensureAuth } from '../helpers/ensureAuth'

test.use({ storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] } })
test.beforeEach(() => { test.skip(!IS_REAL, 'real-local only') })
test.beforeEach(async ({ page }) => { await ensureAuth(page) })
test.setTimeout(30000)

test('cart shows item after seeding', async ({ page }) => {
  await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
  await clearCart(page)
})

test('cart shows empty state after clearing', async ({ page }) => {
  await clearCart(page)
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
})

test('cart with two products shows both items', async ({ page }) => {
  await seedCart(page, [
    { productId: REAL_PRODUCT_ID, productQuantity: 1 },
    { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
  ])
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2, { timeout: 10000 })
  await clearCart(page)
})

test('increasing quantity updates item count display', async ({ page }) => {
  await clearCart(page)
  await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 })
  await page.locator('[data-testid="cart-plus-btn"]').first().click()
  await expect(page.locator('[data-testid="cart-item-qty"]').first()).toHaveText('2', { timeout: 10000 })
  await clearCart(page)
})

test('minus button shows trash icon when quantity is 1', async ({ page }) => {
  await clearCart(page)
  await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-testid="cart-minus-btn"]').first()).toHaveAttribute('aria-label', 'Remove item', { timeout: 10000 })
  await clearCart(page)
})

test('removing last unit of item shows empty cart', async ({ page }) => {
  await clearCart(page)
  await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 })
  await page.locator('[data-testid="cart-minus-btn"]').first().click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
})

test('trash button removes item and shows empty cart', async ({ page }) => {
  await clearCart(page)
  await seedCart(page, [{ productId: REAL_PRODUCT_ID, productQuantity: 1 }])
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 })
  await page.locator('[data-testid="cart-trash-btn"]').first().click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
})

test('clear all removes all items and shows empty state', async ({ page }) => {
  await clearCart(page)
  await seedCart(page, [
    { productId: REAL_PRODUCT_ID, productQuantity: 1 },
    { productId: REAL_PRODUCT_ID_2, productQuantity: 2 },
  ])
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10000 })
  await page.getByText('Clear all').click()
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 10000 })
})
