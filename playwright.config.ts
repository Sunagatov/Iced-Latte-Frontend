import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
})
