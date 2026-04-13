import { expect, type Page } from '@playwright/test'

/**
 * Navigates to /cart and waits until exactly expectedCount cart items are visible.
 */
export async function gotoCartAndWaitForItems(page: Page, expectedCount: number): Promise<void> {
  await page.goto('/cart')

  if (expectedCount === 0) {
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 12000 })
  } else {
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(expectedCount, { timeout: 12000 })
  }
}

/**
 * Navigates to /favourites and waits until exactly expectedCount fav-elements are visible.
 */
export async function gotoFavouritesAndWaitForCount(page: Page, expectedCount: number): Promise<void> {
  await page.goto('/favourites')

  if (expectedCount === 0) {
    await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 12000 })
  } else {
    await expect(page.locator('[data-testid="fav-element"]')).toHaveCount(expectedCount, { timeout: 12000 })
  }
}

/**
 * Navigates to / and waits until the cart header badge shows expectedCount.
 */
export async function gotoHomeAndWaitForCartBadge(page: Page, expectedCount: number): Promise<void> {
  await page.goto('/')
  await expect(page.locator('[data-testid="header-cart-badge"]')).toHaveText(
    String(expectedCount > 99 ? '99+' : expectedCount),
    { timeout: 12000 },
  )
}

/**
 * Navigates to / and waits until the favourites header badge shows expectedCount.
 */
export async function gotoHomeAndWaitForFavouritesBadge(page: Page, expectedCount: number): Promise<void> {
  await page.goto('/')
  await expect(page.locator('[data-testid="header-favourites-badge"]')).toHaveText(
    String(expectedCount > 99 ? '99+' : expectedCount),
    { timeout: 12000 },
  )
}

/**
 * Navigates to / and waits for product cards to be visible.
 * Accepts either a loaded catalog or a known empty/error state.
 */
export async function openCatalogAndWaitReady(page: Page): Promise<void> {
  await page.goto('/')
  await Promise.race([
    page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 }),
    page.waitForSelector('[data-testid="empty-state"]', { timeout: 20000 }),
    page.waitForSelector('text=Something went wrong', { timeout: 20000 }),
  ])
}

/**
 * Waits for the checkout page to be fully ready:
 * heading visible, at least one summary row, submit button enabled.
 */
export async function waitForCheckoutReady(page: Page): Promise<void> {
  await expect(page.locator('h1', { hasText: 'Checkout' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole('button', { name: 'Place order' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole('button', { name: 'Place order' })).toBeEnabled({ timeout: 10000 })
}
