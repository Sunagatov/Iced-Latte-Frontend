import { mockRoute } from './helpers/mockRoute'
import { test, expect } from '@playwright/test'

const product = { id: 'p1', name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }

test('home page loads with products', async ({ page }) => {
  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/products')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })
  await page.goto('/')
  await expect(page).toHaveTitle('Iced Latte')
  await expect(page.locator('header')).toBeVisible()
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 })
})
