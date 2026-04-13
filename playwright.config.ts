import { defineConfig } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const IS_REAL = !!process.env.BASE_URL

export default defineConfig({
  testDir: './e2e',
  retries: 1,
  timeout: 30000,
  globalSetup: IS_REAL ? './e2e/global-setup.ts' : undefined,
  webServer: IS_REAL ? undefined : {
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
