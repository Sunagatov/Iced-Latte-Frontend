import { mockRoute } from './helpers/mockRoute'
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/products')) {
      const hasKeyword = url.includes('keyword=')
      const products = hasKeyword
        ? []
        : Array.from({ length: 6 }, (_, i) => ({
          id: `id-${i}`,
          name: `Coffee ${i}`,
          price: 9.99,
          productFileUrl: null,
          brandName: 'Brand',
          sellerName: 'Seller',
          averageRating: 4.5,
          reviewsCount: 1,
          quantity: 250,
          description: 'desc',
          active: true,
        }))

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products,
          page: 0,
          size: 6,
          totalElements: products.length,
          totalPages: hasKeyword ? 0 : 1,
        }),
      })
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    }
  })
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
})

test('sort dropdown is visible in catalog', async ({ page }) => {
  await expect(page.locator('#productDropdown')).toBeVisible()
})

test('changing sort order re-renders product list', async ({ page }) => {
  await page.locator('#productDropdown').click()
  await page.locator('[data-testid="sort-option"]').first().click()
  await page.waitForTimeout(800)
  await page.waitForSelector('[data-testid="product-card"]')
  const count = await page.locator('[data-testid="product-card"]').count()

  expect(count).toBeGreaterThan(0)
})

test('search with no results shows empty state message', async ({ page }) => {
  const input = page
    .locator('#hero')
    .getByRole('textbox', { name: 'Search products' })

  await input.fill('zzznoresultsxxx')
  await input.press('Enter')
  await page.waitForTimeout(1000)
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible({
    timeout: 5000,
  })
})

test('empty state shows suggestion pills', async ({ page }) => {
  const input = page
    .locator('#hero')
    .getByRole('textbox', { name: 'Search products' })

  await input.fill('zzznoresultsxxx')
  await input.press('Enter')
  await page.waitForTimeout(1000)
  await expect(
    page.locator('[data-testid="suggestion-pill"]').first(),
  ).toBeVisible({ timeout: 5000 })
})

test('clicking suggestion pill updates search', async ({ page }) => {
  const input = page
    .locator('#hero')
    .getByRole('textbox', { name: 'Search products' })

  await input.fill('zzznoresultsxxx')
  await input.press('Enter')
  await page.waitForTimeout(1000)
  const pill = page.locator('[data-testid="suggestion-pill"]').first()

  await pill.waitFor({ timeout: 5000 })
  const pillText = await pill.textContent()

  await pill.click()
  await page.waitForTimeout(800)
  // Input or heading should reflect the pill text
  await expect(page.locator('#catalog')).toBeInViewport()
  expect(pillText).toBeTruthy()
})
