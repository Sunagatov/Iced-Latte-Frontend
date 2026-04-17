import { strictMockProxy, mockRoute } from '../helpers/mockRoute'
import { test, expect, type Page } from '@playwright/test'
import type { Route } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

// ─── Factories ────────────────────────────────────────────────────────────────

const PRODUCT_A = '00000000-0000-0000-0000-000000000001'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}

const USER_BODY = JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null })

function userHandler(authenticated: boolean): (route: Route) => Promise<void> {
  return async (route) => {
    await route.fulfill({
      status: authenticated ? 200 : 401,
      contentType: 'application/json',
      body: authenticated ? USER_BODY : JSON.stringify({ message: 'Unauthorized' }),
    })
  }
}

async function setFavStorage(page: Page, favouriteIds: string[]) {
  await page.evaluate((ids) => {
    localStorage.setItem('fav-storage', JSON.stringify({
      state: { favouriteIds: ids, favourites: [] },
      version: 0,
    }))
  }, favouriteIds)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('bootstrap favourite sync fires once for persisted guest favourites', async ({ page }) => {
  let syncCallCount = 0

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/favorites') && method === 'POST') {
      syncCallCount++
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [makeProduct(PRODUCT_A)] }) })
    } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: USER_BODY })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })

  await page.addInitScript(([productId]: string[]) => {
    localStorage.setItem('fav-storage', JSON.stringify({
      state: { favouriteIds: [productId], isSync: false },
      version: 0,
    }))
  }, [PRODUCT_A])

  const syncResponse = page.waitForResponse(
    (res) => res.url().includes('/api/proxy/favorites') && res.request().method() === 'POST',
  )

  await page.goto('/')
  await syncResponse
  expect(syncCallCount).toBe(1)
})

test('add favourite (logged in) updates header badge immediately', async ({ page }) => {
  const product = makeProduct(PRODUCT_A)

  await page.goto('/')
  await page.evaluate(() => localStorage.removeItem('fav-storage'))

  await strictMockProxy(page, {
    '/favorites': async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product] }) })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) })
      }
    },
    '/products': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) }),
    '/users': userHandler(true),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  })

  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })

  const badge = page.locator('[data-testid="header-favourites-badge"]')

  await expect(badge).not.toBeVisible({ timeout: 3000 })
  await page.locator('[data-testid="favourite-btn"]').first().click()
  await expect(badge).toBeVisible({ timeout: 5000 })
  await expect(badge).toHaveText('1', { timeout: 5000 })
})

test('remove favourite (logged in) calls DELETE endpoint', async ({ page }) => {
  const product = makeProduct(PRODUCT_A)
  let deleteWasCalled = false

  await strictMockProxy(page, {
    '/favorites': async (route) => {
      if (route.request().method() === 'DELETE') {
        deleteWasCalled = true
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product] }) })
      }
    },
    '/users': userHandler(true),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    '/products/ids': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([product]) }),
  })

  await page.goto('/')
  await setFavStorage(page, [PRODUCT_A])
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.goto('/favourites')
  await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
  await page.locator('[data-testid="fav-element"]').first().locator('button[aria-label="Remove from favourites"]').click()
  await page.waitForResponse(
    (res) => res.url().includes('/api/proxy/favorites') && res.request().method() === 'DELETE',
  )
  expect(deleteWasCalled).toBe(true)
})

test('guest add favourite shows item in favourites list', async ({ page }) => {
  const product = makeProduct(PRODUCT_A)

  await strictMockProxy(page, {
    '/products/ids': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([product]) }),
    '/products': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [product], page: 0, size: 6, totalElements: 1, totalPages: 1 }) }),
    '/users': async (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  })

  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await page.locator('[data-testid="favourite-btn"]').first().click()
  await page.waitForResponse(
    (res) => res.url().includes('/api/proxy/products/ids') && res.request().method() === 'GET',
  )
  await page.goto('/favourites')
  await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
})

test('favourites page shows empty state for guest with no favourites', async ({ page }) => {
  await strictMockProxy(page, {
    '/users': async (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) }),
    '/favorites': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  })
  await page.goto('/favourites')
  await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 8000 })
})

test('favourites page shows full list for guest with persisted favouriteIds', async ({ page }) => {
  const product = makeProduct(PRODUCT_A)

  await strictMockProxy(page, {
    '/products/ids': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([product]) }),
    '/users': async (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  })

  await page.goto('/')
  await setFavStorage(page, [PRODUCT_A])
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.goto('/favourites')
  await expect(page.locator('[data-testid="fav-element"]')).toBeVisible({ timeout: 8000 })
})

test('fresh session with no stored state shows empty cart', async ({ page }) => {
  await strictMockProxy(page, {
    '/users': async (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  })
  await page.goto('/cart')
  await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 8000 })
})

test('fresh session with no stored state shows empty favourites', async ({ page }) => {
  await strictMockProxy(page, {
    '/users': async (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) }),
    '/favorites': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [] }) }),
    '/cart': async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  })
  await page.goto('/')
  await page.evaluate(() => localStorage.removeItem('fav-storage'))
  await page.goto('/favourites')
  await expect(page.locator('[data-testid="favourites-empty"]')).toBeVisible({ timeout: 8000 })
})
