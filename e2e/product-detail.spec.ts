import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
})

test('clicking product card navigates to product detail page', async ({ page }) => {
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 5000 })
})

test('product detail page shows product name and price', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 5000 })
  await expect(page.locator('[data-testid="product-name"]')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('[data-testid="product-price"]').first()).toBeVisible({ timeout: 5000 })
})

test('product detail page shows reviews section', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 5000 })
  await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible({ timeout: 5000 })
})

test('product detail page has add to cart button', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 5000 })
  await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible({ timeout: 5000 })
})

test('back navigation returns to home', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await page.locator('[data-testid="product-card"] a').first().click()
  await expect(page).toHaveURL(/\/product\//, { timeout: 5000 })
  await page.goBack()
  await expect(page).toHaveURL('/')
})
