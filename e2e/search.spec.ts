import { mockRoute } from './helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'

const latteProduct = {
  id: '1',
  name: 'Latte Coffee',
  price: 9.99,
  productFileUrl: null,
  brandName: 'Brand',
  sellerName: 'Seller',
  averageRating: 4.5,
  reviewsCount: 1,
  quantity: 250,
  description: 'desc',
  active: true,
}

async function setup(page: Page) {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('keyword=latte')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [latteProduct],
          page: 0,
          size: 5,
          totalElements: 1,
          totalPages: 1,
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
  await page.waitForSelector('#hero input[aria-label="Search products"]', {
    timeout: 10000,
  })
}

test('search bar is visible in header', async ({ page }) => {
  await mockRoute(page, '**/api/proxy/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  )
  await page.goto('/')
  await expect(
    page.getByRole('textbox', { name: 'Search products' }),
  ).toBeVisible()
})

test('typing shows autocomplete suggestions', async ({ page }) => {
  await setup(page)
  const input = page.locator('#hero input[aria-label="Search products"]')

  await input.fill('latte')
  await expect(page.locator('[data-testid="search-dropdown"]')).toBeVisible({
    timeout: 5000,
  })
})

test('clear button resets input', async ({ page }) => {
  await setup(page)
  const input = page.locator('#hero input[aria-label="Search products"]')

  await input.fill('espresso')
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(input).toHaveValue('')
})

test('submitting search scrolls to catalog and filters products', async ({
  page,
}) => {
  await setup(page)
  const input = page.locator('#hero input[aria-label="Search products"]')

  await input.fill('latte')
  await input.press('Enter')
  await expect(page.locator('#catalog')).toBeInViewport({ timeout: 3000 })
})

test('recent searches appear on focus after a search', async ({ page }) => {
  await setup(page)
  const input = page.locator('#hero input[aria-label="Search products"]')

  await input.fill('mocha')
  await input.press('Enter')
  await input.fill('')
  await input.focus()
  await expect(
    page.getByRole('button', { name: 'Remove mocha', exact: true }),
  ).toBeVisible({ timeout: 3000 })
})

test('keyboard navigation selects suggestion', async ({ page }) => {
  await setup(page)
  const input = page.locator('#hero input[aria-label="Search products"]')

  await input.fill('latte')
  const dropdown = page.locator('[data-testid="search-dropdown"]')

  await expect(dropdown).toBeVisible({ timeout: 5000 })
  const suggestionText = (
    await dropdown.locator('li').first().locator('button').innerText()
  )
    .trim()
    .split('\n')[0]

  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(input).toHaveValue(suggestionText)
})

test('Escape closes dropdown', async ({ page }) => {
  await setup(page)
  const input = page.locator('#hero input[aria-label="Search products"]')

  await input.fill('latte')
  await expect(page.locator('[data-testid="search-dropdown"]')).toBeVisible({
    timeout: 5000,
  })
  await input.press('Escape')
  await expect(
    page.locator('[data-testid="search-dropdown"]'),
  ).not.toBeVisible()
})
