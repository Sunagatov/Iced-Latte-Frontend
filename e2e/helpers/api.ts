/**
 * API helpers for real-mode e2e tests.
 * These seed/clear backend state via the proxy API.
 */
import type { Page } from '@playwright/test'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function req(page: Page) { return page.context().request }

async function retryOn429(
  label: string,
  fn: () => Promise<{ ok(): boolean; status(): number; text(): Promise<string>; headers(): Record<string, string>; json(): Promise<unknown> }>,
  maxRetries = 4,
) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fn()
    if (res.status() !== 429) {
      if (!res.ok()) throw new Error(`${label}: HTTP ${res.status()} — ${await res.text()}`)
      return res
    }
    const delay = 5000
    await sleep(delay)
  }
  throw new Error(`${label}: rate limited after ${maxRetries + 1} attempts`)
}

// --- Cart ---

export async function seedCart(page: Page, items: { productId: string; productQuantity: number }[]) {
  await clearCart(page)
  for (const item of items) {
    await retryOn429('POST /cart/items', () => req(page).post('/api/proxy/cart/items', { data: { items: [item] } }))
    await sleep(200)
  }
  // Poll until items appear
  for (let i = 0; i < 20; i++) {
    await sleep(500)
    const res = await req(page).get('/api/proxy/cart')
    const cart = await res.json() as { items?: { productInfo: { id: string } }[] }
    const ids = new Set((cart.items ?? []).map(ci => ci.productInfo.id))
    if (items.every(it => ids.has(it.productId))) return
  }
}

export async function clearCart(page: Page) {
  const res = await req(page).get('/api/proxy/cart')
  if (!res.ok()) return
  const cart = await res.json() as { items?: { id: string }[] }
  const ids = (cart.items ?? []).map(i => i.id)
  if (ids.length === 0) return
  await retryOn429('DELETE /cart/items', () => req(page).delete('/api/proxy/cart/items', { data: { shoppingCartItemIds: ids } }))
  for (let i = 0; i < 10; i++) {
    await sleep(500)
    const check = await req(page).get('/api/proxy/cart')
    const body = await check.json() as { items?: unknown[] }
    if ((body.items ?? []).length === 0) return
  }
}

// --- Favourites ---

export async function seedFavourites(page: Page, productIds: string[]) {
  await clearFavourites(page)
  for (const id of productIds) {
    await retryOn429(`POST /favorites (${id})`, () => req(page).post('/api/proxy/favorites', { data: { productIds: [id] } }))
    await sleep(300)
  }
  const expected = new Set(productIds)
  for (let i = 0; i < 20; i++) {
    await sleep(500)
    const res = await req(page).get('/api/proxy/favorites')
    const body = await res.json() as { products?: { id: string }[] }
    const present = new Set((body.products ?? []).map(p => p.id))
    if ([...expected].every(id => present.has(id))) return
  }
}

export async function clearFavourites(page: Page) {
  const res = await req(page).get('/api/proxy/favorites')
  if (!res.ok()) return
  const data = await res.json() as { products?: { id: string }[] }
  for (const p of data.products ?? []) {
    await sleep(500)
    await req(page).delete(`/api/proxy/favorites/${p.id}`)
  }
  for (let i = 0; i < 6; i++) {
    await sleep(1000)
    const check = await req(page).get('/api/proxy/favorites')
    const body = await check.json() as { products?: unknown[] }
    if ((body.products ?? []).length === 0) return
  }
}
