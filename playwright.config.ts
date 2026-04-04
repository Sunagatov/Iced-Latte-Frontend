import { defineConfig } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const IS_REAL = !!process.env.BASE_URL

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: 1,
  timeout: 15000,
  globalSetup: IS_REAL ? './e2e/global-setup.ts' : undefined,
  use: {
    baseURL: BASE_URL,
    headless: true,
    storageState: IS_REAL ? 'e2e/.auth.json' : undefined,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
})
