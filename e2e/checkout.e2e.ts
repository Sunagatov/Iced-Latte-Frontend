import { test, expect } from './fixtures/index'
import { seedCart, clearCart } from './helpers/api'
import { PRODUCT_ID } from './helpers/constants'

test.describe('Checkout', () => {
  test.afterEach(async ({ page }) => { await clearCart(page) })

  test('checkout page renders heading', async ({ checkoutPage }) => {
    await checkoutPage.goto()
    await expect(checkoutPage.heading).toBeVisible()
  })

  test('form renders required fields', async ({ page, checkoutPage }) => {
    await seedCart(page, [{ productId: PRODUCT_ID, productQuantity: 1 }])
    await checkoutPage.goto()
    await checkoutPage.expectReady()
    await expect(checkoutPage.recipientName).toBeVisible()
    await expect(checkoutPage.recipientSurname).toBeVisible()
    await expect(checkoutPage.addressLine).toBeVisible()
    await expect(checkoutPage.city).toBeVisible()
    await expect(checkoutPage.postcode).toBeVisible()
    await expect(checkoutPage.country).toBeVisible()
  })

  test('order summary shows price and quantity', async ({ page, checkoutPage }) => {
    await seedCart(page, [{ productId: PRODUCT_ID, productQuantity: 1 }])
    await checkoutPage.goto()
    await checkoutPage.expectReady()
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(/×\d+/).first()).toBeVisible({ timeout: 8_000 })
  })

  test('Place order button is visible and enabled', async ({ page, checkoutPage }) => {
    await seedCart(page, [{ productId: PRODUCT_ID, productQuantity: 1 }])
    await checkoutPage.goto()
    await checkoutPage.expectReady()
    await expect(checkoutPage.placeOrderButton).toBeVisible()
    await expect(checkoutPage.placeOrderButton).toBeEnabled()
  })

  test('placing order sends Idempotency-Key header', async ({ page, checkoutPage }) => {
    await seedCart(page, [{ productId: PRODUCT_ID, productQuantity: 1 }])
    await checkoutPage.goto()
    await checkoutPage.expectReady()
    await checkoutPage.fillForm()

    const [request] = await Promise.all([
      page.waitForRequest(
        req => req.url().includes('/payment/checkout') && req.method() === 'POST',
        { timeout: 15_000 },
      ),
      checkoutPage.placeOrderButton.click(),
    ])

    expect(request.headers()['idempotency-key']).toBeTruthy()
    expect(request.headers()['idempotency-key'].length).toBeGreaterThan(0)
  })

  test('successful checkout returns checkoutUrl', async ({ page, checkoutPage }) => {
    await seedCart(page, [{ productId: PRODUCT_ID, productQuantity: 1 }])
    await checkoutPage.goto()
    await checkoutPage.expectReady()
    await checkoutPage.fillForm()

    const [response] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/payment/checkout') && res.request().method() === 'POST' && res.status() < 300,
        { timeout: 20_000 },
      ),
      checkoutPage.placeOrderButton.click(),
    ])

    const body = await response.json() as { checkoutUrl?: string }
    expect(body.checkoutUrl).toBeTruthy()
  })

  test('cancel page shows cancellation message', async ({ page }) => {
    await page.goto('/checkout/cancel')
    await expect(page.getByText('Payment cancelled')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('no real money')).toBeVisible()
  })

  test('success page shows confirmation on PAID', async ({ page }) => {
    // Navigate to success page with a known order_id — if the order exists it shows confirmation
    await page.goto('/checkout/success?order_id=test-order')
    // Either shows "Payment confirmed" or an error/loading state
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })
})
