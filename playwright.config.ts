import { defineConfig } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: 1,
  timeout: 15000,
  use: {
    baseURL: BASE_URL,
    headless: true,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
})
