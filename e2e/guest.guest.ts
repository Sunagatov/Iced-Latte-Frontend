import { test, expect } from './fixtures/index'

test.describe('Guest navigation', () => {
  test('home page loads products without auth', async ({ homePage }) => {
    await homePage.goto()
    await homePage.expectProductsVisible()
  })

  test('header visible on home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
  })

  test('catalog section visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#catalog')).toBeVisible({ timeout: 10_000 })
  })

  test('can navigate to product detail', async ({ homePage, productDetailPage }) => {
    await homePage.goto()
    await homePage.clickFirstProduct()
    await productDetailPage.expectLoaded()
  })

  test('cart page accessible for guest', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('favourites page accessible for guest', async ({ page }) => {
    await page.goto('/favourites')
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })

  test('profile page redirects to signin', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/signin/, { timeout: 5_000 })
  })

  test('orders page is accessible', async ({ page }) => {
    await page.goto('/orders')
    await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
  })

  test('header on signin page', async ({ page }) => {
    await page.goto('/signin')
    await expect(page.locator('header')).toBeVisible()
  })

  test('header on signup page', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('header')).toBeVisible()
  })
})
