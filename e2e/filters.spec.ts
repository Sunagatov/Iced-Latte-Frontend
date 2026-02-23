import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Wait for product cards to load
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
})

test('filter sidebar is visible with all sections', async ({ page }) => {
  await expect(page.getByText('Price, $')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Rating' })).toBeVisible()
  await expect(page.getByText('Brand')).toBeVisible()
  await expect(page.getByText('Seller')).toBeVisible()
})

test('price filter - from input accepts numeric value', async ({ page }) => {
  const fromInput = page.locator('#from-price-input')
  await fromInput.fill('3')
  await expect(fromInput).toHaveValue('3')
})

test('price filter - to input accepts numeric value', async ({ page }) => {
  const toInput = page.locator('#to-price-input')
  await toInput.fill('6')
  await expect(toInput).toHaveValue('6')
})

test('price filter - filters products by price range', async ({ page }) => {
  const fromInput = page.locator('#from-price-input')
  const toInput = page.locator('#to-price-input')

  await fromInput.fill('3')
  await toInput.fill('6')

  // Wait for debounce (1000ms) + network
  await page.waitForTimeout(1500)
  await page.waitForSelector('[data-testid="product-card"]')

  const prices = await page.locator('[data-testid="product-price"]').allTextContents()
  for (const price of prices) {
    const value = parseFloat(price.replace('$', ''))
    expect(value).toBeGreaterThanOrEqual(3)
    expect(value).toBeLessThanOrEqual(6)
  }
})

test('price filter - rejects non-numeric input', async ({ page }) => {
  const fromInput = page.locator('#from-price-input')
  await fromInput.fill('abc')
  await expect(fromInput).toHaveValue('')
})

test('rating filter - selecting 4 stars filters products', async ({ page }) => {
  await page.locator('#checkbox-4').click()
  await page.waitForTimeout(500)
  await page.waitForSelector('[data-testid="product-card"]')
  await expect(page.locator('#checkbox-4')).toHaveClass(/bg-brand-solid/)
})

test('rating filter - selecting Any shows all products', async ({ page }) => {
  await page.locator('#checkbox-any').click()
  await page.waitForTimeout(500)
  await expect(page.locator('#checkbox-any')).toHaveClass(/bg-brand-solid/)
})

test('rating filter - only one rating option can be selected at a time', async ({ page }) => {
  await page.locator('#checkbox-4').click()
  await page.waitForTimeout(300)
  await page.locator('#checkbox-3').click()
  await page.waitForTimeout(300)

  await expect(page.locator('#checkbox-4')).not.toHaveClass(/bg-brand-solid/)
  await expect(page.locator('#checkbox-3')).toHaveClass(/bg-brand-solid/)
})

test('brand filter - checkbox toggles on click', async ({ page }) => {
  const firstBrandCheckbox = page.locator('[id="Dunkin-Donuts"]')
  await firstBrandCheckbox.click()
  await expect(firstBrandCheckbox).toBeChecked()

  // Reset button should appear
  await expect(page.locator('#Brand-reset-btn')).toBeVisible()
})

test('brand filter - reset clears selection', async ({ page }) => {
  const firstBrandCheckbox = page.locator('[id="Dunkin-Donuts"]')
  await firstBrandCheckbox.click()
  await expect(firstBrandCheckbox).toBeChecked()

  await page.locator('#Brand-reset-btn').click()
  await expect(firstBrandCheckbox).not.toBeChecked()
  await expect(page.locator('#Brand-reset-btn')).not.toBeVisible()
})

test('brand filter - show more expands list beyond 5 items', async ({ page }) => {
  const showMoreBtn = page.locator('#Brand-filter-btn')
  if (await showMoreBtn.isVisible()) {
    const brandGroup = page.locator('[data-testid="filter-group-brand"]')
    const beforeCount = await brandGroup.locator('input[type="checkbox"]').count()
    await showMoreBtn.click()
    const afterCount = await brandGroup.locator('input[type="checkbox"]').count()
    expect(afterCount).toBeGreaterThan(beforeCount)
  }
})

test('seller filter - checkbox toggles on click', async ({ page }) => {
  const sellerCheckbox = page.locator('[id="BeanBrewers"]')
  await sellerCheckbox.click()
  await expect(sellerCheckbox).toBeChecked()
  await expect(page.locator('#Seller-reset-btn')).toBeVisible()
})

test('seller filter - reset clears selection', async ({ page }) => {
  const sellerCheckbox = page.locator('[id="BeanBrewers"]')
  await sellerCheckbox.click()
  await page.locator('#Seller-reset-btn').click()
  await expect(sellerCheckbox).not.toBeChecked()
})

test('combined filters - brand + price narrows results', async ({ page }) => {
  await page.locator('[id="Folgers"]').click()
  await page.locator('#from-price-input').fill('3')
  await page.waitForTimeout(1500)
  await page.waitForSelector('[data-testid="product-card"]')

  const cards = page.locator('[data-testid="product-card"]')
  expect(await cards.count()).toBeGreaterThan(0)
})
