import { test, expect, type Page } from '@playwright/test'

const PRODUCT_ID = '00000000-0000-0000-0000-000000000001'
const product = {
  id: PRODUCT_ID,
  name: 'Test Coffee',
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

async function mockFavouritesApi(page: Page, favProducts: object[]) {
  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({"id":"u1","firstName":"Test","lastName":"User","email":"test@example.com","phoneNumber":null,"birthDate":null,"address":null}),
      })
    else if (url.includes('/favorites'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: favProducts }),
      })
    else await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}

async function setup(page: Page, favProducts: object[]) {
  await mockFavouritesApi(page, favProducts)
  await page.goto('/favourites')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)
}

test('favourites page shows saved products', async ({ page }) => {
  await setup(page, [product])
  await expect(page.locator('[data-testid="fav-element"]').first()).toBeVisible(
    { timeout: 8000 },
  )
  await expect(page.getByText('Test Coffee')).toBeVisible()
})

test('removing a favourite updates the list', async ({ page }) => {
  let removed = false

  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders'))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({"id":"u1","firstName":"Test","lastName":"User","email":"test@example.com","phoneNumber":null,"birthDate":null,"address":null}),
      })
    else if (url.includes('/favorites') && method === 'DELETE') {
      removed = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] }),
      })
    } else if (url.includes('/favorites')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: removed ? [] : [product] }),
      })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
  await page.goto('http://localhost:3000')
  await page.evaluate((id) => {
    localStorage.setItem(
      'fav-storage',
      JSON.stringify({ state: { favouriteIds: [id] }, version: 0 }),
    )
  }, PRODUCT_ID)
  await page.goto('/favourites')
  await page.waitForSelector('[data-testid="fav-element"]', { timeout: 8000 })
  await page
    .locator('[data-testid="fav-element"]')
    .first()
    .locator('button[aria-label="Remove from favourites"]')
    .click()
  await expect(page.locator('[data-testid="fav-element"]')).toHaveCount(0, {
    timeout: 8000,
  })
})

test('empty state shown when no favourites', async ({ page }) => {
  await setup(page, [])
  await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({
    timeout: 8000,
  })
})

test('clicking a favourite product navigates to product detail', async ({
  page,
}) => {
  await setup(page, [product])
  await page.waitForSelector('[data-testid="fav-element"]', { timeout: 8000 })
  await page
    .locator('[data-testid="fav-element"]')
    .first()
    .getByRole('link')
    .first()
    .click()
  await expect(page).toHaveURL(new RegExp(`/product/${PRODUCT_ID}`), {
    timeout: 8000,
  })
})
