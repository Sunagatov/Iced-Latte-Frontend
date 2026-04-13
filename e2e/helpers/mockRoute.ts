import type { Page, Route } from '@playwright/test'

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

type RouteHandlers = Record<string, (route: Route) => Promise<void>>

/**
 * Strict mock helper for mocked mode.
 * Registers explicit handlers keyed by URL substring.
 * Any unhandled /api/proxy/** call fails the test immediately,
 * exposing missing mocks and contract drift.
 * No-op in real mode.
 */
export async function strictMockProxy(
  page: Page,
  handlers: RouteHandlers,
): Promise<void> {
  if (IS_REAL) return

  await page.route('**/api/proxy/**', async (route) => {
    const url = route.request().url()

    for (const [key, handle] of Object.entries(handlers)) {
      if (url.includes(key)) {
        await handle(route)

        return
      }
    }

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: `Unhandled mock route: ${url}` }),
    })

    throw new Error(`Unhandled mock route: ${url}`)
  })
}
