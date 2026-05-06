/**
 * Smoke tests — authenticated user flows.
 * Runs against real backend (prod or localhost), no mocks.
 */
import { test, expect } from './fixtures/index'

test.describe('Home page', () => {
  test('displays product catalog', async ({ homePage }) => {
    await homePage.goto()
    await homePage.expectProductsVisible()
  })

  test('has correct title', async ({ homePage }) => {
    await homePage.goto()
    await expect(homePage['page']).toHaveTitle(/Iced Latte/)
  })

  test('search returns results or empty state', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchFor('coffee')

    await expect(
      homePage.productCards.first().or(homePage['page'].getByTestId('empty-state')),
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Product detail', () => {
  test('navigates to product detail from catalog', async ({ homePage, productDetailPage }) => {
    await homePage.goto()
    await homePage.clickFirstProduct()
    await productDetailPage.expectLoaded()
  })

  test('product detail shows title and price', async ({ homePage, productDetailPage }) => {
    await homePage.goto()
    await homePage.clickFirstProduct()
    await productDetailPage.expectLoaded()
    await expect(productDetailPage.title).not.toBeEmpty()
  })
})

test.describe('Cart', () => {
  test('cart page is accessible', async ({ cartPage }) => {
    await cartPage.goto()
  })
})

test.describe('Favourites', () => {
  test('favourites page is accessible', async ({ page }) => {
    await page.goto('/favourites')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })
})
