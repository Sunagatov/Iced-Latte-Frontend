import { test, expect } from '@playwright/test'

const PRODUCT_A = '00000000-0000-0000-0000-000000000001'

function makeProduct(id: string) {
  return { id, name: 'Test Coffee', price: 9.99, productFileUrl: null, brandName: 'Brand', sellerName: 'Seller', averageRating: 4.5, reviewsCount: 1, quantity: 250, description: 'desc', active: true }
}
function makeCart(items: object[]) {
  return { id: 'cart-uuid-1', userId: 'user-uuid-1', items, itemsQuantity: items.length, itemsTotalPrice: 0, productsQuantity: 0, createdAt: '2024-01-01T00:00:00Z', closedAt: null }
}

test('probe: what URL does the POST actually have?', async ({ page }) => {
  const posts: string[] = []

  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    posts.push(`${method} ${url}`)
    if (url.includes('/cart') && method === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeCart([{ id: 'slot1', productInfo: makeProduct(PRODUCT_A), productQuantity: 2 }])) })
    } else if (url.includes('/users')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })

  await page.addInitScript(([productId]: string[]) => {
    localStorage.setItem('cart-storage', JSON.stringify({
      state: { itemsIds: [{ productId, productQuantity: 2 }], tempItems: [], count: 2, totalPrice: 0, isSync: false },
      version: 0,
    }))
  }, [PRODUCT_A])

  await page.goto('http://localhost:3000')
  await page.waitForTimeout(5000)
  console.log('ALL INTERCEPTED REQUESTS:', JSON.stringify(posts, null, 2))
  expect(posts.length).toBeGreaterThan(0)
})
