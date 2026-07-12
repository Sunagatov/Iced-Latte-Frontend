import type { APIResponse, Page } from '@playwright/test'
import { config } from 'dotenv'
import { test, expect } from './fixtures'
import { clearCart, clearFavourites } from './helpers/api'
import { PRODUCT_ID } from './helpers/constants'

config({ path: '.env.local' })

const EMAIL = process.env.E2E_EMAIL ?? 'olivia@example.com'
const PASSWORD = process.env.E2E_PASSWORD ?? 'p@ss1logic11'

type JsonObject = Record<string, unknown>

function expectObject(value: unknown, label: string): JsonObject {
  expect(value, `${label} should be an object`).toEqual(expect.any(Object))
  expect(Array.isArray(value), `${label} should not be an array`).toBe(false)

  return value as JsonObject
}

function expectString(value: unknown, label: string) {
  expect(value, `${label} should be a string`).toEqual(expect.any(String))
  expect((value as string).length, `${label} should not be empty`).toBeGreaterThan(0)
}

function expectNumber(value: unknown, label: string) {
  expect(value, `${label} should be a number`).toEqual(expect.any(Number))
  expect(Number.isFinite(value as number), `${label} should be finite`).toBe(true)
}

function expectProductContract(value: unknown, label: string) {
  const product = expectObject(value, label)

  expectProductSummaryContract(product, label)
  expectString(product['description'], `${label}.description`)
  expectNumber(product['quantity'], `${label}.quantity`)
  expect(product['active'], `${label}.active`).toEqual(expect.any(Boolean))
  expectNumber(product['averageRating'], `${label}.averageRating`)
  expectNumber(product['reviewsCount'], `${label}.reviewsCount`)
  expectString(product['brandName'], `${label}.brandName`)
  expectString(product['sellerName'], `${label}.sellerName`)
  expectString(product['originCountry'], `${label}.originCountry`)
  expectNumber(product['weight'], `${label}.weight`)
  expectNumber(product['length'], `${label}.length`)
  expectNumber(product['width'], `${label}.width`)
  expectNumber(product['height'], `${label}.height`)
  expectNumber(product['soldProductsCount'], `${label}.soldProductsCount`)
  expectNumber(product['discount'], `${label}.discount`)
  expectString(product['dateAdded'], `${label}.dateAdded`)
  expectNumber(product['popularityScore'], `${label}.popularityScore`)
  if (product['productImageUrls'] != null) {
    expect(Array.isArray(product['productImageUrls']), `${label}.productImageUrls should be an array`).toBe(true)
  }
}

function expectProductSummaryContract(value: unknown, label: string) {
  const product = expectObject(value, label)

  expectString(product['id'], `${label}.id`)
  expectString(product['name'], `${label}.name`)
  expectNumber(product['price'], `${label}.price`)

  if (product['productFileUrl'] != null) {
    expectString(product['productFileUrl'], `${label}.productFileUrl`)
  }
}

async function expectOkJson(response: APIResponse, label: string): Promise<unknown> {
  expect(response.ok(), `${label}: HTTP ${response.status()} ${await response.text()}`).toBe(true)

  return response.json()
}

function collectCriticalFailures(page: Page) {
  const failures: string[] = []

  page.on('console', message => {
    if (message.type() === 'error') {
      failures.push(`console error: ${message.text()}`)
    }
  })
  page.on('pageerror', error => {
    failures.push(`page error: ${error.message}`)
  })
  page.on('response', response => {
    const url = response.url()

    if ((url.includes('/api/proxy/') || url.includes('/api/v1/')) && response.status() >= 500) {
      failures.push(`server error: ${response.status()} ${url}`)
    }
  })

  return failures
}

test.describe('FE/BE contract smoke', () => {
  test.afterEach(async ({ page }) => {
    await clearCart(page)
    await clearFavourites(page)
  })

  test('product list exposes the fields consumed by catalog and PDP', async ({ page }) => {
    const response = await page.context().request.get('/api/proxy/products?page=0&size=3')
    const body = expectObject(await expectOkJson(response, 'GET /products'), 'products response')
    const products = body['products']

    expect(Array.isArray(products), 'products should be an array').toBe(true)
    expect((products as unknown[]).length, 'seeded catalog should have products').toBeGreaterThan(0)
    expectNumber(body['page'], 'products response.page')
    expectNumber(body['size'], 'products response.size')
    expectNumber(body['totalElements'], 'products response.totalElements')
    expectNumber(body['totalPages'], 'products response.totalPages')
    expectProductContract((products as unknown[])[0], 'products[0]')
  })

  test('product detail and products-by-ids stay aligned with list item shape', async ({ page }) => {
    const detailResponse = await page.context().request.get(`/api/proxy/products/${PRODUCT_ID}`)
    const detail = expectObject(await expectOkJson(detailResponse, 'GET /products/{id}'), 'product detail')

    expectProductContract(detail, 'product detail')
    expect(detail['id']).toBe(PRODUCT_ID)

    const byIdsResponse = await page.context().request.post('/api/proxy/products/ids', {
      data: { productIds: [PRODUCT_ID] },
    })
    const products = await expectOkJson(byIdsResponse, 'POST /products/ids')

    expect(Array.isArray(products), 'products by ids should be an array').toBe(true)
    expect((products as unknown[]).length).toBe(1)
    expectProductContract((products as unknown[])[0], 'products by ids[0]')
    expect(expectObject((products as unknown[])[0], 'products by ids[0]')['id']).toBe(PRODUCT_ID)
  })

  test('cart mutation contract matches frontend payload and totals expectations', async ({ page }) => {
    await clearCart(page)

    const response = await page.context().request.post('/api/proxy/cart/items', {
      data: { items: [{ productId: PRODUCT_ID, productQuantity: 2 }] },
    })
    const cart = expectObject(await expectOkJson(response, 'POST /cart/items'), 'cart response')
    const items = cart['items']

    expectString(cart['id'], 'cart response.id')
    expectString(cart['userId'], 'cart response.userId')
    expect(Array.isArray(items), 'cart response.items should be an array').toBe(true)
    expectNumber(cart['itemsQuantity'], 'cart response.itemsQuantity')
    expectNumber(cart['itemsTotalPrice'], 'cart response.itemsTotalPrice')
    expectNumber(cart['productsQuantity'], 'cart response.productsQuantity')
    expect(cart['itemsQuantity']).toBe((items as unknown[]).length)

    const item = expectObject((items as unknown[])[0], 'cart response.items[0]')

    expectString(item['id'], 'cart response.items[0].id')
    expect(item['productQuantity']).toBe(2)
    expect(cart['productsQuantity']).toBe(item['productQuantity'])
    expectProductSummaryContract(item['productInfo'], 'cart response.items[0].productInfo')
    expect(expectObject(item['productInfo'], 'cart response.items[0].productInfo')['id']).toBe(PRODUCT_ID)
  })

  test('favourites contract returns product summaries for saved products', async ({ page }) => {
    await clearFavourites(page)

    const response = await page.context().request.post('/api/proxy/favorites', {
      data: { productIds: [PRODUCT_ID] },
    })
    const body = expectObject(await expectOkJson(response, 'POST /favorites'), 'favourites response')
    const products = body['products']

    expect(Array.isArray(products), 'favourites response.products should be an array').toBe(true)
    expect((products as unknown[]).length).toBe(1)
    expectProductSummaryContract((products as unknown[])[0], 'favourites response.products[0]')
    expect(expectObject((products as unknown[])[0], 'favourites response.products[0]')['id']).toBe(PRODUCT_ID)
  })

  test('auth proxy stores token pair as HttpOnly cookies without exposing tokens in JSON', async ({ page }) => {
    const response = await page.context().request.post('/api/proxy/auth/authenticate', {
      data: { email: EMAIL, password: PASSWORD },
    })
    const body = expectObject(await expectOkJson(response, 'POST /auth/authenticate'), 'auth response')
    const setCookie = response.headers()['set-cookie'] ?? ''

    expect(body).toEqual({ authenticated: true })
    expect(body['token']).toBeUndefined()
    expect(body['refreshToken']).toBeUndefined()
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('token=')
    expect(setCookie).toContain('refreshToken=')
  })

  test('critical browse-to-cart flow has no browser errors or backend 5xx responses', async ({ page, homePage, cartPage }) => {
    const failures = collectCriticalFailures(page)

    await clearCart(page)
    await homePage.goto()
    await homePage.expectProductsVisible()
    await homePage.clickFirstProduct()

    const addButton = page.getByRole('button', { name: 'Add to cart' })

    await expect(addButton).toBeVisible({ timeout: 10_000 })
    await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/proxy/cart/items') && response.request().method() === 'POST',
        { timeout: 15_000 },
      ),
      addButton.click(),
    ])

    await cartPage.goto()
    await cartPage.expectItemCount(1)
    expect(failures).toEqual([])
  })
})
