import { test as base } from '@playwright/test'
import { IS_REAL } from './mockRoute'

/**
 * Extended test fixture that adds a pause between tests in real mode
 * to avoid hitting the backend rate limiter.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    if (IS_REAL) await new Promise((r) => setTimeout(r, 800))
    await use(page)
  },
})

export { expect } from '@playwright/test'
