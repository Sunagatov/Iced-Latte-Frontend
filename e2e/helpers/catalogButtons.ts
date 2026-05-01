import type { Page, Route } from '@playwright/test'
import { mockRoute, IS_REAL } from './mockRoute'

export const FAKE_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
}

export const PRODUCT_ID = '00000000-0000-0000-0000-000000000001'

export const product = {
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

export const productsList = {
  products: [product],
  page: 0,
  size: 6,
  totalElements: 1,
  totalPages: 1,
}

function makeCart(qty: number) {
  if (qty === 0) {
    return {
      id: 'c1',
      userId: 'u1',
      items: [],
      itemsQuantity: 0,
      itemsTotalPrice: 0,
      productsQuantity: 0,
      createdAt: '',
      closedAt: null,
    }
  }

  return {
    id: 'c1',
    userId: 'u1',
    items: [{ id: 'ci1', productInfo: product, productQuantity: qty }],
    itemsQuantity: 1,
    itemsTotalPrice: +(product.price * qty).toFixed(2),
    productsQuantity: qty,
    createdAt: '',
    closedAt: null,
  }
}

export async function mockWithCart(
  page: Page,
  initialQty: number,
  favProducts: object[] = [],
  authenticated = false,
) {
  let serverQty = initialQty
  let serverFavs = [...favProducts]

  await mockRoute(page, '**/api/proxy/**', async (route: Route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/products/ids')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([product]),
      })
      return
    }

    if (url.includes('/products')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsList),
      })
      return
    }

    if (url.includes('/cart/items') && method === 'DELETE') {
      serverQty = 0
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeCart(0)),
      })
      return
    }

    if (url.includes('/cart/items') && method === 'PATCH') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      serverQty = Math.max(0, serverQty + (body.productQuantityChange ?? 0))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeCart(serverQty)),
      })
      return
    }

    if (url.includes('/cart/items') && method === 'POST') {
      serverQty = 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeCart(1)),
      })
      return
    }

    if (url.includes('/cart')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeCart(serverQty)),
      })
      return
    }

    if (url.includes('/favorites') && method === 'DELETE') {
      serverFavs = []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] }),
      })
      return
    }

    if (url.includes('/favorites') && method === 'POST') {
      serverFavs = [...favProducts]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: serverFavs }),
      })
      return
    }

    if (url.includes('/favorites')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: serverFavs }),
      })
      return
    }

    if (
      url.includes('/users') &&
      !url.includes('/addresses') &&
      !url.includes('/reviews') &&
      !url.includes('/avatar') &&
      !url.includes('/orders')
    ) {
      await route.fulfill({
        status: authenticated ? 200 : 401,
        contentType: 'application/json',
        body: authenticated
          ? JSON.stringify(FAKE_USER)
          : JSON.stringify({ message: 'Unauthorized' }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
}

export async function loginAndGoto(page: Page, route: string, cartQty = 0) {
  if (!IS_REAL && cartQty > 0) {
    await page.addInitScript((qty: number) => {
      const productId = '00000000-0000-0000-0000-000000000001'

      localStorage.setItem(
        'cart-storage',
        JSON.stringify({
          state: {
            itemsIds: [{ productId, productQuantity: qty }],
            tempItems: [
              {
                id: 'ci1',
                productInfo: {
                  id: productId,
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
                },
                productQuantity: qty,
              },
            ],
            count: qty,
            totalPrice: +(9.99 * qty).toFixed(2),
            isSync: true,
          },
          version: 0,
        }),
      )
    }, cartQty)
  }

  await page.goto(route)
  await page.waitForLoadState('domcontentloaded')
}

export async function mockLoggedOutProductRoutes(page: Page) {
  await page.unrouteAll()
  await mockRoute(page, '**/api/proxy/**', async (route: Route) => {
    const url = route.request().url()

    if (
      url.includes('/users') &&
      !url.includes('/addresses') &&
      !url.includes('/reviews') &&
      !url.includes('/avatar') &&
      !url.includes('/orders')
    ) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      })
      return
    }

    if (url.includes('/products')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsList),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
}
