import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('search bar is visible in header', async ({ page }) => {
  await expect(page.getByRole('textbox', { name: 'Search products' })).toBeVisible()
})

test('typing shows autocomplete suggestions', async ({ page }) => {
  const product = { id: '1', name: 'Latte Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
  await page.route('**/api/proxy/products**keyword=latte**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 5, totalElements: 1, totalPages: 1 }) })
  })
  await page.goto('/')
  const input = page.locator('#hero').getByRole('textbox', { name: 'Search products' })
  await input.click()
  await input.fill('latte')
  const dropdown = page.locator('.absolute').filter({ has: page.locator('ul') })
  await expect(dropdown).toBeVisible({ timeout: 5000 })
})

test('clear button resets input', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search products' })
  await input.fill('espresso')
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(input).toHaveValue('')
})

test('submitting search scrolls to catalog and filters products', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search products' })
  await input.fill('latte')
  await input.press('Enter')
  await expect(page.locator('#catalog')).toBeInViewport({ timeout: 3000 })
})

test('recent searches appear on focus after a search', async ({ page }) => {
  const input = page.locator('#hero').getByRole('textbox', { name: 'Search products' })
  await input.fill('mocha')
  await input.press('Enter')
  await input.fill('')
  await input.focus()
  await expect(page.getByRole('button', { name: 'Remove mocha', exact: true })).toBeVisible({ timeout: 1000 })
})

test('keyboard navigation selects suggestion', async ({ page }) => {
  const product = { id: '1', name: 'Latte Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
  await page.route('**/api/proxy/products**keyword=latte**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 5, totalElements: 1, totalPages: 1 }) })
  })
  await page.goto('/')
  const input = page.locator('#hero').getByRole('textbox', { name: 'Search products' })
  await input.click()
  await input.fill('latte')
  const dropdown = page.locator('.absolute').filter({ has: page.locator('ul') })
  await expect(dropdown).toBeVisible({ timeout: 5000 })
  const firstSuggestion = dropdown.locator('li').first().locator('button')
  const suggestionText = (await firstSuggestion.innerText()).trim().split('\n')[0]
  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(input).toHaveValue(suggestionText)
})

test('Escape closes dropdown', async ({ page }) => {
  const product = { id: '1', name: 'Latte Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
  await page.route('**/api/proxy/products**keyword=latte**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 5, totalElements: 1, totalPages: 1 }) })
  })
  await page.goto('/')
  const input = page.locator('#hero').getByRole('textbox', { name: 'Search products' })
  await input.click()
  await input.fill('latte')
  const dropdown = page.locator('.absolute').filter({ has: page.locator('ul') })
  await expect(dropdown).toBeVisible({ timeout: 5000 })
  await input.press('Escape')
  await expect(dropdown).not.toBeVisible()
})
