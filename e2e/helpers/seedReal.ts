import type { Page } from '@playwright/test'
import { IS_REAL, assertMutableTestEnvironment } from './mockRoute'

function req(page: Page) {
  return page.context().request
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function seedCart(
  page: Page,
  items: { productId: string; productQuantity: number }[],
): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  await req(page).post('/api/proxy/cart/items', { data: { items } })

  // Poll until all seeded items appear in the cart
  const expectedIds = new Set(items.map((i) => i.productId))

  for (let i = 0; i < 10; i++) {
    await sleep(500)
    const res = await req(page).get('/api/proxy/cart')
    const cart = await res.json()
    const presentIds = new Set((cart.items ?? []).map((ci: { productInfo: { id: string } }) => ci.productInfo.id))
    const allPresent = [...expectedIds].every((id) => presentIds.has(id))

    if (allPresent) return
  }
}

export async function clearCart(page: Page): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  const res = await req(page).get('/api/proxy/cart')
  const cart = await res.json()
  const ids: string[] = (cart.items ?? []).map((i: { id: string }) => i.id)

  if (ids.length > 0) {
    await req(page).delete('/api/proxy/cart/items', {
      data: { shoppingCartItemIds: ids },
    })
  }

  // Poll until cart is confirmed empty
  for (let i = 0; i < 10; i++) {
    await sleep(500)
    const check = await req(page).get('/api/proxy/cart')
    const body = await check.json()

    if ((body.items ?? []).length === 0) return
  }
}

export async function seedFavourite(page: Page, productId: string): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  await req(page).post('/api/proxy/favorites', {
    data: { productIds: [productId] },
  })

  for (let i = 0; i < 6; i++) {
    await sleep(1000)
    const check = await req(page).get('/api/proxy/favorites')
    const body = await check.json()

    if ((body.products ?? []).some((p: { id: string }) => p.id === productId)) return
  }
}

export async function clearFavourites(page: Page): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  const res = await req(page).get('/api/proxy/favorites')
  const data = await res.json()
  const products: { id: string }[] = data.products ?? []

  for (const p of products) {
    for (let attempt = 0; attempt < 3; attempt++) {
      await sleep(attempt === 0 ? 500 : 2000)
      const r = await req(page).delete(`/api/proxy/favorites/${p.id}`)

      if (r.status() !== 429) break
    }
  }

  for (let i = 0; i < 6; i++) {
    await sleep(1000)
    const check = await req(page).get('/api/proxy/favorites')
    const body = await check.json()

    if ((body.products ?? []).length === 0) return
  }
}

export async function removeFavourite(page: Page, productId: string): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  await req(page).delete(`/api/proxy/favorites/${productId}`)
}
