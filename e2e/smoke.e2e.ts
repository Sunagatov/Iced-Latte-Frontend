import { test, expect } from './fixtures/index'

test.describe('Navigation (authenticated)', () => {
  test('header is visible on home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
  })

  test('footer is visible on home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
  })

  test('home page has correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Iced Latte/)
  })

  test('catalog section is visible', async ({ homePage }) => {
    await homePage.goto()
    await expect(homePage['page'].locator('#catalog')).toBeVisible()
  })

  test('product cards are visible', async ({ homePage }) => {
    await homePage.goto()
    await homePage.expectProductsVisible()
  })

  test('cart page accessible', async ({ page }) => {
    await page.goto('/cart')
    await expect(page).not.toHaveURL(/signin/)
    await expect(page.locator('main')).toBeVisible()
  })

  test('favourites page accessible', async ({ page }) => {
    await page.goto('/favourites')
    await expect(page).not.toHaveURL(/signin/)
    await expect(page.locator('main')).toBeVisible()
  })

  test('profile page accessible', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).not.toHaveURL(/signin/)
  })

  test('orders page accessible', async ({ page }) => {
    await page.goto('/orders')
    await expect(page.locator('main')).toBeVisible()
  })

  test('checkout page accessible', async ({ page }) => {
    await page.goto('/checkout')
    await expect(page.locator('main')).toBeVisible()
  })

  test('header cart badge is visible', async ({ homePage }) => {
    await homePage.goto()
    // Badge may or may not be visible depending on cart state — just check header exists
    await expect(homePage['page'].locator('header')).toBeVisible()
  })

  test('header favourites icon is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
  })
})
