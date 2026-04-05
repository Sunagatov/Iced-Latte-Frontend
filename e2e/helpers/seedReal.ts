import type { Page } from '@playwright/test'
import { IS_REAL } from './mockRoute'

/**
 * Seeds cart/favourites via the real API before a test.
 * No-op in mocked mode — mocks handle state directly.
 */

export async function seedCart(
  page: Page,
  items: { productId: string; productQuantity: number }[],
): Promise<void> {
  if (!IS_REAL) return
  await page.request.post('/api/proxy/cart/items', { data: items })
}

export async function clearCart(page: Page): Promise<void> {
  if (!IS_REAL) return
  const res = await page.request.get('/api/proxy/cart')
  const cart = await res.json()
  const ids: string[] = (cart.items ?? []).map((i: { id: string }) => i.id)
  if (ids.length > 0) {
    await page.request.delete('/api/proxy/cart/items', {
      data: { shoppingCartItemIds: ids },
    })
  }
}

export async function seedFavourite(page: Page, productId: string): Promise<void> {
  if (!IS_REAL) return
  await page.request.post('/api/proxy/favorites', {
    data: { productIds: [productId] },
  })
}

export async function clearFavourites(page: Page): Promise<void> {
  if (!IS_REAL) return
  const res = await page.request.get('/api/proxy/favorites')
  const data = await res.json()
  const products: { id: string }[] = data.products ?? []
  for (const p of products) {
    await page.request.delete(`/api/proxy/favorites/${p.id}`)
  }
}

export async function removeFavourite(page: Page, productId: string): Promise<void> {
  if (!IS_REAL) return
  await page.request.delete(`/api/proxy/favorites/${productId}`)
}
