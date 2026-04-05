import type { Page } from '@playwright/test'
import { IS_REAL } from './mockRoute'

/**
 * Real product IDs from the seeded DB — stable across runs.
 * Used in real-mode tests instead of fake UUIDs.
 */
export const REAL_PRODUCT_ID = 'd1a2b3c4-0001-4000-8000-000000000001' // Oat Milk Latte
export const REAL_PRODUCT_ID_2 = 'd1a2b3c4-0001-4000-8000-000000000002' // Brown Sugar Shaken Espresso
export const REAL_PRODUCT_ID_WITH_REVIEWS = 'd1a2b3c4-0001-4000-8000-000000000008' // Salted Caramel Cold Foam Brew

/**
 * Fetches the first real product ID from the API.
 * Falls back to REAL_PRODUCT_ID if not in real mode.
 */
export async function getFirstRealProductId(page: Page): Promise<string> {
  if (!IS_REAL) return REAL_PRODUCT_ID
  const res = await page.request.get('/api/proxy/products?page=0&size=1&sort_attribute=averageRating&sort_direction=desc')
  const data = await res.json()
  return data.products[0].id
}
