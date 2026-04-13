import { defineConfig } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const IS_REAL = !!process.env.BASE_URL
const IS_PROD = IS_REAL && !BASE_URL.includes('localhost') && !BASE_URL.includes('127.0.0.1')

if (IS_REAL && IS_PROD && process.env.npm_lifecycle_event?.includes('local-real')) {
  throw new Error(
    `test:e2e:local-real must not target ${BASE_URL}. Use localhost or 127.0.0.1.`,
  )
}

export default defineConfig({
  testDir: './e2e',
  retries: 1,
  timeout: 30000,
  globalSetup: IS_REAL ? './e2e/global-setup.ts' : undefined,
  // webServer starts the dev server for mocked and local-real runs.
  // Prod smoke points at an already-running host — no webServer needed.
  webServer: IS_PROD ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
  use: {
    baseURL: BASE_URL,
    headless: true,
    actionTimeout: 15000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      // Fully mocked — no real backend, runs on every push, safe to parallelize
      name: 'mocked',
      workers: 4,
      testIgnore: ['**/real.spec.ts', '**/debug-*.spec.ts'],
      use: {
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      // Real integration — requires BASE_URL + running backend, can mutate state
      // Only safe against localhost or an explicit staging host
      name: 'real',
      workers: 1,
      testIgnore: ['**/real.spec.ts', '**/debug-*.spec.ts'],
      use: {
        storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] },
      },
    },
    {
      // Prod smoke — read-only, safe against production, no mutations
      name: 'prod-smoke',
      workers: 1,
      testMatch: ['**/real.spec.ts'],
      use: {
        storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] },
      },
    },
  ],
})
