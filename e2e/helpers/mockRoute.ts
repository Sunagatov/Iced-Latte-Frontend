import type { Page } from '@playwright/test'

/** True when tests run against a real backend (BASE_URL env var is set). */
export const IS_REAL = !!process.env.BASE_URL

/**
 * Registers a route mock only in mocked mode.
 * When BASE_URL is set (real mode), this is a no-op — real API calls go through.
 */
export async function mockRoute(
  page: Page,
  pattern: Parameters<Page['route']>[0],
  handler: Parameters<Page['route']>[1],
): Promise<void> {
  if (IS_REAL) return
  await page.route(pattern, handler)
}
