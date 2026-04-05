import type { Page } from '@playwright/test'
import { IS_REAL } from './mockRoute'

/**
 * Seeds cart/favourites via the real API before a test.
 * No-op in mocked mode — mocks handle state directly.
 *
 * Uses page.context().request which shares the browser context cookies
 * (including the auth session from storageState / global-setup.ts).
 */

function req(page: Page) {
  return page.context().request
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function seedCart(
  page: Page,
  items: { productId: string; productQuantity: number }[],
): Promise<void> {
  if (!IS_REAL) return
  await req(page).post('/api/proxy/cart/items', { data: { items } })
}

export async function clearCart(page: Page): Promise<void> {
  if (!IS_REAL) return
  const res = await req(page).get('/api/proxy/cart')
  const cart = await res.json()
  const ids: string[] = (cart.items ?? []).map((i: { id: string }) => i.id)
  if (ids.length > 0) {
    await req(page).delete('/api/proxy/cart/items', {
      data: { shoppingCartItemIds: ids },
    })
  }
}

export async function seedFavourite(page: Page, productId: string): Promise<void> {
  if (!IS_REAL) return
  await req(page).post('/api/proxy/favorites', {
    data: { productIds: [productId] },
  })
}

export async function clearFavourites(page: Page): Promise<void> {
  if (!IS_REAL) return
  const res = await req(page).get('/api/proxy/favorites')
  const data = await res.json()
  const products: { id: string }[] = data.products ?? []
  for (const p of products) {
    await sleep(300)
    await req(page).delete(`/api/proxy/favorites/${p.id}`)
  }
}

export async function removeFavourite(page: Page, productId: string): Promise<void> {
  if (!IS_REAL) return
  await req(page).delete(`/api/proxy/favorites/${productId}`)
}
