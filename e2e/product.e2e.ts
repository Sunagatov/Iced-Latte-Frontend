import { test, expect } from './fixtures/index'
import { PRODUCT_ID, PRODUCT_ID_WITH_REVIEWS } from './helpers/constants'

test.describe('Product Detail', () => {
  test('navigates from catalog to product detail', async ({ homePage, productDetailPage }) => {
    await homePage.goto()
    await homePage.clickFirstProduct()
    await productDetailPage.expectLoaded()
  })

  test('shows product name', async ({ page, productDetailPage }) => {
    await page.goto(`/product/${PRODUCT_ID_WITH_REVIEWS}`)
    await productDetailPage.expectLoaded()
    await expect(productDetailPage.title).toBeVisible()
    const text = await productDetailPage.title.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test('shows product price', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_ID_WITH_REVIEWS}`)
    await expect(page.getByTestId('product-price').first()).toBeVisible({ timeout: 10_000 })
  })

  test('shows reviews section', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_ID_WITH_REVIEWS}`)
    await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 15_000 })
  })

  test('has add to cart button', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_ID}`)
    await expect(page.getByTestId('add-to-cart-btn')).toBeVisible({ timeout: 10_000 })
  })

  test('add to cart button works', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_ID}`)
    const addBtn = page.getByTestId('add-to-cart-btn')
    await expect(addBtn).toBeVisible({ timeout: 10_000 })

    await Promise.all([
      page.waitForResponse(res => res.url().includes('/cart/items') && res.request().method() === 'POST', { timeout: 15_000 }),
      addBtn.click(),
    ])

    const badge = page.getByTestId('header-cart-badge')
    await expect(badge).toBeVisible({ timeout: 10_000 })
  })

  test('favourite button is visible', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_ID}`)
    await expect(page.getByTestId('favourite-btn')).toBeVisible({ timeout: 10_000 })
  })

  test('back navigation returns to home', async ({ homePage, page }) => {
    await homePage.goto()
    await homePage.clickFirstProduct()
    await expect(page).toHaveURL(/\/product\//)
    await page.goBack()
    await expect(page).toHaveURL('/')
  })

  test('product detail URL contains product ID', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_ID}`)
    await expect(page).toHaveURL(new RegExp(PRODUCT_ID))
  })
})
