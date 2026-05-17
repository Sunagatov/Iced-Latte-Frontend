import { test, expect } from './fixtures/index'
import { seedFavourites, clearFavourites } from './helpers/api'
import { PRODUCT_ID } from './helpers/constants'

test.describe('Favourites (authenticated)', () => {
  test.afterEach(async ({ page }) => { await clearFavourites(page) })

  test('favourites page is accessible', async ({ favouritesPage }) => {
    await favouritesPage['page'].goto('/favourites')
    await expect(favouritesPage['page'].locator('main')).toBeVisible({ timeout: 10_000 })
    await expect(favouritesPage['page']).not.toHaveURL(/signin/)
  })

  test('empty state when no favourites', async ({ page, favouritesPage }) => {
    await clearFavourites(page)
    await favouritesPage.goto()
    await favouritesPage.expectEmpty()
  })

  test('shows saved favourite', async ({ page, favouritesPage }) => {
    await seedFavourites(page, [PRODUCT_ID])
    await favouritesPage.goto()
    await favouritesPage.expectItemCount(1)
  })

  test('remove favourite updates list', async ({ page, favouritesPage }) => {
    await seedFavourites(page, [PRODUCT_ID])
    await favouritesPage.goto()
    await favouritesPage.expectItemCount(1)
    await favouritesPage.removeFirst()
    await expect(favouritesPage.items).toHaveCount(0, { timeout: 8_000 })
  })

  test('clicking favourite navigates to product detail', async ({ page, favouritesPage }) => {
    await seedFavourites(page, [PRODUCT_ID])
    await favouritesPage.goto()
    await favouritesPage.expectItemCount(1)
    await favouritesPage.items.first().getByRole('link').first().click()
    await expect(page).toHaveURL(new RegExp(`/product/${PRODUCT_ID}`), { timeout: 8_000 })
  })

  test('heart icon visible on product card', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    const cards = await homePage.productCards.count()
    if (cards === 0) return
    await expect(page.getByTestId('favourite-btn').first()).toBeVisible({ timeout: 5_000 })
  })

  test('clicking heart toggles favourite state', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    const heartBtn = page.getByTestId('favourite-btn').first()
    await heartBtn.waitFor({ timeout: 10_000 })
    const before = await heartBtn.getAttribute('data-active')
    await heartBtn.click()
    await expect(heartBtn).toHaveAttribute('data-active', before === 'true' ? 'false' : 'true', { timeout: 5_000 })
  })
})
