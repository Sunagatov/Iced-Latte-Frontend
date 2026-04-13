import { defineConfig } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const IS_REAL = !!process.env.BASE_URL

export default defineConfig({
  testDir: './e2e',
  workers: 1,
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
      // Default: fully mocked, no real backend, runs on every push
      name: 'mocked',
      testIgnore: ['**/real.spec.ts'],
      use: {
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      // Real integration: requires BASE_URL + running backend, can mutate state
      name: 'real',
      testMatch: ['**/*.spec.ts'],
      use: {
        storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] },
      },
    },
    {
      // Prod smoke: read-only, safe to run against production
      name: 'prod-smoke',
      testMatch: ['**/real.spec.ts'],
      use: {
        storageState: IS_REAL ? 'e2e/.auth.json' : { cookies: [], origins: [] },
      },
    },
  ],
})
