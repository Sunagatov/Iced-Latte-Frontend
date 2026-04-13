import type { Page } from '@playwright/test'
import { IS_REAL, assertMutableTestEnvironment } from './mockRoute'
import { ensureAuth } from './ensureAuth'

function req(page: Page) {
  return page.context().request
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function assertOk(res: Awaited<ReturnType<ReturnType<typeof req>['get']>>, label: string): Promise<void> {
  if (!res.ok()) {
    const body = await res.text().catch(() => '(unreadable)')

    throw new Error(`seedReal: ${label} failed — HTTP ${res.status()}\n${body}`)
  }
}

/**
 * Extracts the retry delay in ms from a 429 response.
 * Reads retryAfter from JSON body first, then Retry-After header.
 */
async function get429DelayMs(res: Awaited<ReturnType<ReturnType<typeof req>['get']>>): Promise<number> {
  try {
    const body = await res.json()

    if (typeof body?.retryAfter === 'number') {
      return body.retryAfter * 1000
    }
  } catch {
    // ignore parse error
  }

  const header = res.headers()['retry-after']

  if (header) {
    const seconds = parseInt(header, 10)

    if (!isNaN(seconds)) return seconds * 1000
  }

  return 5000 // safe default
}

/**
 * Executes a cart mutation with 429-aware retry/backoff.
 * Fails immediately on any non-429 error.
 */
async function cartRequest(
  label: string,
  fn: () => Promise<Awaited<ReturnType<ReturnType<typeof req>['get']>>>,
  maxRetries = 4,
): Promise<Awaited<ReturnType<ReturnType<typeof req>['get']>>> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fn()

    if (res.status() === 429) {
      if (attempt === maxRetries) {
        const body = await res.text().catch(() => '(unreadable)')

        throw new Error(`seedReal: ${label} hit rate limit after ${maxRetries + 1} attempts\n${body}`)
      }

      const delay = await get429DelayMs(res)

      await sleep(delay + 500)
      continue
    }

    await assertOk(res, label)

    return res
  }

  throw new Error(`seedReal: ${label} exhausted retries`)
}

export async function seedCart(
  page: Page,
  items: { productId: string; productQuantity: number }[],
): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()

  for (const item of items) {
    await cartRequest(
      `POST /cart/items (${item.productId})`,
      () => req(page).post('/api/proxy/cart/items', { data: { items: [item] } }),
    )
    await sleep(200)
  }

  const expectedIds = new Set(items.map((i) => i.productId))

  for (let i = 0; i < 10; i++) {
    await sleep(500)
    const res = await req(page).get('/api/proxy/cart')

    await assertOk(res, 'GET /cart')
    const cart = await res.json()
    const presentIds = new Set((cart.items ?? []).map((ci: { productInfo: { id: string } }) => ci.productInfo.id))
    const allPresent = [...expectedIds].every((id) => presentIds.has(id))

    if (allPresent) return
  }
}

/**
 * Seeds the cart to an exact known state using a reconciliation loop.
 * Clears first, then POSTs all items, then reconciles actual vs expected
 * using PATCH for wrong quantities and DELETE for unexpected items.
 * Throws with diagnostics if state does not converge within the poll window.
 */
export async function seedExactCart(
  page: Page,
  items: { productId: string; productQuantity: number }[],
): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  await ensureAuth(page)
  await clearCart(page)

  // Seed one item at a time — bulk POST is not reliably atomic
  for (const item of items) {
    await cartRequest(
      `POST /cart/items (${item.productId})`,
      () => req(page).post('/api/proxy/cart/items', { data: { items: [item] } }),
    )
    await sleep(200)
  }

  const expectedQtyMap = new Map(items.map((i) => [i.productId, i.productQuantity]))

  for (let attempt = 0; attempt < 20; attempt++) {
    await sleep(500)
    const res = await req(page).get('/api/proxy/cart')
    const cart = await res.json()
    const cartItems: { id: string; productInfo: { id: string }; productQuantity: number }[] = cart.items ?? []

    // Check for unexpected items to delete
    const unexpected = cartItems.filter((ci) => !expectedQtyMap.has(ci.productInfo.id))

    if (unexpected.length > 0) {
      await cartRequest(
        'DELETE /cart/items (unexpected)',
        () => req(page).delete('/api/proxy/cart/items', {
          data: { shoppingCartItemIds: unexpected.map((ci) => ci.id) },
        }),
      )
      continue
    }

    let needsReconcile = false

    for (const [productId, expectedQty] of expectedQtyMap) {
      const found = cartItems.find((ci) => ci.productInfo.id === productId)

      if (!found) {
        // Missing product — add it
        await cartRequest(
          `POST /cart/items reconcile (${productId})`,
          () => req(page).post('/api/proxy/cart/items', {
            data: { items: [{ productId, productQuantity: expectedQty }] },
          }),
        )
        needsReconcile = true
        break
      }

      const delta = expectedQty - found.productQuantity

      if (delta !== 0) {
        await cartRequest(
          `PATCH /cart/items (${found.id})`,
          () => req(page).patch('/api/proxy/cart/items', {
            data: { shoppingCartItemId: found.id, productQuantityChange: delta },
          }),
        )
        needsReconcile = true
        break
      }
    }

    if (needsReconcile) continue

    // Verify exact total count
    const expectedTotal = items.reduce((s, i) => s + i.productQuantity, 0)
    const actualTotal: number = cart.productsQuantity ?? cartItems.reduce((s: number, ci) => s + ci.productQuantity, 0)

    if (actualTotal === expectedTotal && cartItems.length === expectedQtyMap.size) return
  }

  const finalRes = await req(page).get('/api/proxy/cart')
  const finalCart = await finalRes.json()
  const lastStatus = finalRes.status()

  throw new Error(
    `seedExactCart: cart did not converge to expected state after 10s.\n` +
    `Expected: ${JSON.stringify(items)}\n` +
    `Actual: ${JSON.stringify(finalCart.items ?? [])}\n` +
    `Last GET /cart status: ${lastStatus}`,
  )
}

export async function clearCart(page: Page): Promise<void> {
  if (!IS_REAL) return
  assertMutableTestEnvironment()
  const res = await req(page).get('/api/proxy/cart')

  if (!res.ok()) return // cart unreadable — skip clear
  const cart = await res.json()
  const ids: string[] = (cart.items ?? []).map((i: { id: string }) => i.id)

  if (ids.length > 0) {
    await cartRequest(
      'DELETE /cart/items (clear)',
      () => req(page).delete('/api/proxy/cart/items', {
        data: { shoppingCartItemIds: ids },
      }),
    )
  }

  // Poll until cart is confirmed empty
  for (let i = 0; i < 10; i++) {
    await sleep(500)
    const check = await req(page).get('/api/proxy/cart')

    if (!check.ok()) continue
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
