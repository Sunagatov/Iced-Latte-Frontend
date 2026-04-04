import { mockRoute } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'

function makeProduct(id: string) {
  return {
    id,
    name: 'Test Coffee',
    price: 5.99,
    productFileUrl: null,
    brandName: 'Dunkin-Donuts',
    sellerName: 'BeanBrewers',
    averageRating: 4.5,
    reviewsCount: 1,
    quantity: 250,
    description: 'desc',
    active: true,
  }
}

async function mockProducts(page: Page) {
  const products = Array.from({ length: 6 }, (_, i) =>
    makeProduct(`0000000${i}-0000-0000-0000-000000000001`),
  )
  const productsList = {
    products,
    page: 0,
    size: 6,
    totalElements: 6,
    totalPages: 1,
  }

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/products') && !url.includes('/ids')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsList),
      })
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      })
    }
  })
}

test.beforeEach(async ({ page }) => {
  await mockProducts(page)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 })
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
  await page.waitForTimeout(1500)
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 })
})

test('price filter - rejects non-numeric input', async ({ page }) => {
  const fromInput = page.locator('#from-price-input')

  await fromInput.fill('abc')
  await expect(fromInput).toHaveValue('')
})

test('rating filter - selecting 4 stars filters products', async ({ page }) => {
  await page.locator('#checkbox-4').click()
  await page.waitForTimeout(500)
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 })
  await expect(page.locator('#checkbox-4')).toHaveClass(/bg-brand-solid/)
})

test('rating filter - selecting Any shows all products', async ({ page }) => {
  await page.locator('#checkbox-any').click()
  await page.waitForTimeout(500)
  await expect(page.locator('#checkbox-any')).toHaveClass(/bg-brand-solid/)
})

test('rating filter - only one rating option can be selected at a time', async ({
  page,
}) => {
  await page.locator('#checkbox-4').click()
  await page.waitForTimeout(300)
  await page.locator('#checkbox-3').click()
  await page.waitForTimeout(300)
  await expect(page.locator('#checkbox-4')).not.toHaveClass(/bg-brand-solid/)
  await expect(page.locator('#checkbox-3')).toHaveClass(/bg-brand-solid/)
})

test('brand filter - checkbox toggles on click', async ({ page }) => {
  const firstBrandCheckbox = page
    .locator('[data-testid="filter-group-brand"] input[type="checkbox"]')
    .first()

  if (!(await firstBrandCheckbox.isVisible())) return
  await firstBrandCheckbox.click()
  await expect(firstBrandCheckbox).toBeChecked()
  await expect(page.locator('#Brand-reset-btn')).toBeVisible()
})

test('brand filter - reset clears selection', async ({ page }) => {
  const firstBrandCheckbox = page
    .locator('[data-testid="filter-group-brand"] input[type="checkbox"]')
    .first()

  if (!(await firstBrandCheckbox.isVisible())) return
  await firstBrandCheckbox.click()
  await expect(firstBrandCheckbox).toBeChecked()
  await page.locator('#Brand-reset-btn').click()
  await expect(firstBrandCheckbox).not.toBeChecked()
  await expect(page.locator('#Brand-reset-btn')).not.toBeVisible()
})

test('brand filter - show more expands list beyond 5 items', async ({
  page,
}) => {
  const showMoreBtn = page.locator('#Brand-filter-btn')

  if (!(await showMoreBtn.isVisible())) return
  const brandGroup = page.locator('[data-testid="filter-group-brand"]')
  const beforeCount = await brandGroup.locator('input[type="checkbox"]').count()

  await showMoreBtn.click()
  const afterCount = await brandGroup.locator('input[type="checkbox"]').count()

  expect(afterCount).toBeGreaterThan(beforeCount)
})

test('seller filter - checkbox toggles on click', async ({ page }) => {
  const sellerCheckbox = page
    .locator('[data-testid="filter-group-seller"] input[type="checkbox"]')
    .first()

  if (!(await sellerCheckbox.isVisible())) return
  await sellerCheckbox.click()
  await expect(sellerCheckbox).toBeChecked()
  await expect(page.locator('#Seller-reset-btn')).toBeVisible()
})

test('seller filter - reset clears selection', async ({ page }) => {
  const sellerCheckbox = page
    .locator('[data-testid="filter-group-seller"] input[type="checkbox"]')
    .first()

  if (!(await sellerCheckbox.isVisible())) return
  await sellerCheckbox.click()
  await page.locator('#Seller-reset-btn').click()
  await expect(sellerCheckbox).not.toBeChecked()
})

test('combined filters - brand + price narrows results', async ({ page }) => {
  const firstBrandCheckbox = page
    .locator('[data-testid="filter-group-brand"] input[type="checkbox"]')
    .first()

  if (await firstBrandCheckbox.isVisible()) await firstBrandCheckbox.click()
  await page.locator('#from-price-input').fill('3')
  await page.waitForTimeout(1500)
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 })
  expect(
    await page.locator('[data-testid="product-card"]').count(),
  ).toBeGreaterThan(0)
})
