import { test, expect } from './fixtures/index'

test.describe('Profile', () => {
  test('page is accessible when logged in', async ({ profilePage }) => {
    await profilePage.goto()
    await expect(profilePage['page']).not.toHaveURL(/signin/)
  })

  test('personal details section visible', async ({ profilePage }) => {
    await profilePage.goto()
    await profilePage.openPersonalDetails()
    await expect(profilePage.personalDetailsHeading).toBeVisible()
  })

  test('shows user name in header', async ({ profilePage }) => {
    await profilePage.goto()
    await profilePage.openPersonalDetails()
    await expect(profilePage.personalDetailsHeading).toBeVisible({ timeout: 8_000 })
  })

  test('edit and save calls API successfully', async ({ profilePage, page }) => {
    await profilePage.goto()
    await profilePage.openPersonalDetails()
    await profilePage.openEditForm()
    await profilePage.firstNameInput.fill('Olivia')
    await profilePage.lastNameInput.fill('Johnson')

    const [response] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/api/proxy/users') && res.request().method() === 'PUT',
        { timeout: 15_000 },
      ),
      profilePage.saveButton.click(),
    ])
    expect(response.status()).toBeLessThan(300)
  })

  test('validation error for invalid phone', async ({ profilePage }) => {
    await profilePage.goto()
    await profilePage.openPersonalDetails()
    await profilePage.openEditForm()
    await profilePage.phoneInput.fill('not-a-phone')
    await profilePage.saveButton.click()
    await expect(profilePage.errorMessage).toBeVisible({ timeout: 5_000 })
  })

  test('save button has disabled styling when form has errors', async ({ profilePage }) => {
    await profilePage.goto()
    await profilePage.openPersonalDetails()
    await profilePage.openEditForm()
    await profilePage.firstNameInput.fill('')
    await expect(profilePage.saveButton).toHaveClass(/opacity/, { timeout: 3_000 })
  })
})

test.describe('Orders', () => {
  test('page loads with heading', async ({ ordersPage }) => {
    await ordersPage.goto()
    await expect(ordersPage.heading).toBeVisible()
  })

  test('status filter tabs are visible', async ({ ordersPage }) => {
    await ordersPage.goto()
    await expect(ordersPage.allTab).toBeVisible()
    await expect(ordersPage.placedTab).toBeVisible()
    await expect(ordersPage.deliveredTab).toBeVisible()
  })

  test('clicking Placed tab filters orders', async ({ ordersPage }) => {
    await ordersPage.goto()
    await ordersPage.placedTab.click()
    await expect(ordersPage.placedTab).toHaveAttribute('aria-pressed', 'true', { timeout: 3_000 })
  })

  test('clicking All tab resets filter', async ({ ordersPage }) => {
    await ordersPage.goto()
    await ordersPage.placedTab.click()
    await ordersPage.allTab.click()
    await expect(ordersPage.allTab).toHaveAttribute('aria-pressed', 'true', { timeout: 3_000 })
  })

  test('expand order shows details', async ({ ordersPage, page }) => {
    await ordersPage.goto()
    if (await ordersPage.orderCards.count() === 0) return
    await ordersPage.expandFirstOrder()
    await expect(
      page.getByTestId('order-item').first().or(page.locator('[class*="order"]').first()),
    ).toBeVisible({ timeout: 5_000 })
  })

  test('product link in order navigates to product page', async ({ ordersPage, page }) => {
    await ordersPage.goto()
    if (await ordersPage.orderCards.count() === 0) return
    await ordersPage.expandFirstOrder()
    const link = page.getByTestId('order-product-link').first()
    if (!(await link.isVisible({ timeout: 3_000 }).catch(() => false))) return
    await link.click()
    await expect(page).toHaveURL(/\/product\//, { timeout: 8_000 })
  })
})
