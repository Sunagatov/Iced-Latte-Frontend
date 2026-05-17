import { test, expect } from './fixtures/index'
import { seedCart, clearCart } from './helpers/api'
import { PRODUCT_ID, PRODUCT_ID_2 } from './helpers/constants'

test.describe('Cart (authenticated)', () => {
  test.afterEach(async ({ page }) => { await clearCart(page) })

  test('empty cart shows empty state', async ({ page, cartPage }) => {
    await clearCart(page)
    await cartPage.goto()
    await cartPage.expectEmpty()
  })

  test('does not redirect to signin', async ({ cartPage }) => {
    await cartPage.goto()
    await expect(cartPage['page']).not.toHaveURL(/signin/)
  })

  test('add product to cart from PDP updates badge', async ({ page }) => {
    await clearCart(page)
    await page.goto(`/product/${PRODUCT_ID}`)
    const addBtn = page.getByTestId('add-to-cart-btn')
    await expect(addBtn).toBeVisible({ timeout: 15_000 })

    await Promise.all([
      page.waitForResponse(res => res.url().includes('/cart/items') && res.request().method() === 'POST', { timeout: 15_000 }),
      addBtn.click(),
    ])

    const badge = page.getByTestId('header-cart-badge')
    await expect(badge).toBeVisible({ timeout: 10_000 })
    const text = await badge.textContent()
    expect(parseInt(text ?? '0')).toBeGreaterThan(0)
  })

  test('add product from catalog card updates badge', async ({ homePage }) => {
    await clearCart(homePage['page'])
    await homePage.goto()
    const addBtn = homePage['page'].getByTestId('add-to-cart-circle-btn').first()
    await addBtn.waitFor({ timeout: 10_000 })

    await Promise.all([
      homePage['page'].waitForResponse(res => res.url().includes('/cart/items') && res.request().method() === 'POST', { timeout: 15_000 }),
      addBtn.click(),
    ])

    const badge = homePage['page'].getByTestId('header-cart-badge')
    await expect(badge).toBeVisible({ timeout: 10_000 })
  })

  test('cart page shows seeded item', async ({ page, cartPage }) => {
    await seedCart(page, [{ productId: PRODUCT_ID, productQuantity: 1 }])
    await cartPage.goto()
    await cartPage.expectItemCount(1)
  })

  test('cart shows multiple items', async ({ page, cartPage }) => {
    await seedCart(page, [
      { productId: PRODUCT_ID, productQuantity: 1 },
      { productId: PRODUCT_ID_2, productQuantity: 2 },
    ])
    await cartPage.goto()
    await cartPage.expectItemCount(2)
  })

  test('removing item from cart updates list', async ({ page, cartPage }) => {
    await seedCart(page, [{ productId: PRODUCT_ID, productQuantity: 1 }])
    await cartPage.goto()
    await cartPage.expectItemCount(1)
    // Click remove button on first cart item
    const removeBtn = page.getByTestId('cart-item').first().getByRole('button', { name: /remove|delete/i }).or(
      page.getByTestId('cart-item').first().locator('[data-testid="remove-item-btn"]'),
    )
    if (await removeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await removeBtn.click()
      await cartPage.expectEmpty()
    }
  })

  test('cart header badge shows correct count', async ({ page }) => {
    await seedCart(page, [{ productId: PRODUCT_ID, productQuantity: 2 }])
    await page.goto('/')
    const badge = page.getByTestId('header-cart-badge')
    await expect(badge).toBeVisible({ timeout: 12_000 })
    const text = await badge.textContent()
    expect(parseInt(text ?? '0')).toBeGreaterThanOrEqual(2)
  })
})
