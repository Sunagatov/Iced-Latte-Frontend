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

/**
 * Seeds the cart to an exact known state: clears first, then posts items,
 * then polls until exact productId→quantity map and total productsQuantity match.
 * Throws with diagnostics if state does not converge within the poll window.
 */
export async function seedExactCart(
  page: Page,
  items: { productId: string; productQuantity: number }[],
): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  await clearCart(page)
  await req(page).post('/api/proxy/cart/items', { data: { items } })

  const expectedQtyMap = new Map(items.map((i) => [i.productId, i.productQuantity]))
  const expectedTotal = items.reduce((s, i) => s + i.productQuantity, 0)

  for (let i = 0; i < 20; i++) {
    await sleep(500)
    const res = await req(page).get('/api/proxy/cart')
    const cart = await res.json()
    const cartItems: { productInfo: { id: string }; productQuantity: number }[] = cart.items ?? []
    const actualTotal: number = cart.productsQuantity ?? cartItems.reduce((s: number, ci) => s + ci.productQuantity, 0)

    const allMatch = [...expectedQtyMap.entries()].every(([id, qty]) => {
      const found = cartItems.find((ci) => ci.productInfo.id === id)

      return found?.productQuantity === qty
    })

    if (allMatch && actualTotal === expectedTotal) return
  }

  throw new Error(
    `seedExactCart: cart did not converge to expected state after 10s. ` +
    `Expected: ${JSON.stringify(items)}`,
  )
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

/**
 * Seeds favourites to an exact known set: clears first, then posts all IDs,
 * then polls until the exact set of IDs is present.
 * Handles 429 rate limiting with backoff between individual POSTs.
 * Throws with diagnostics if state does not converge.
 */
export async function seedExactFavourites(
  page: Page,
  productIds: string[],
): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  await clearFavourites(page)

  // POST all IDs — retry each on 429
  for (const id of productIds) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const r = await req(page).post('/api/proxy/favorites', { data: { productIds: [id] } })

      if (r.status() !== 429) break
      await sleep(2000 * (attempt + 1))
    }
    // Small gap between sequential POSTs to avoid rate limiting
    await sleep(300)
  }

  const expectedSet = new Set(productIds)

  for (let i = 0; i < 20; i++) {
    await sleep(500)
    const check = await req(page).get('/api/proxy/favorites')
    const body = await check.json()
    const presentIds = new Set((body.products ?? []).map((p: { id: string }) => p.id))
    const allPresent = [...expectedSet].every((id) => presentIds.has(id))

    if (allPresent && presentIds.size === expectedSet.size) return
  }

  throw new Error(
    `seedExactFavourites: favourites did not converge to expected set after 10s. ` +
    `Expected: ${JSON.stringify(productIds)}`,
  )
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
