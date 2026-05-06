import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const IS_CI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: IS_CI ? 2 : 1,
  fullyParallel: true,

  reporter: IS_CI
    ? [['dot'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    headless: true,
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // --- Auth setup (runs once, saves storageState) ---
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },

    // --- Real e2e against localhost or prod (no mocks) ---
    {
      name: 'e2e',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['auth-setup'],
      testMatch: /.*\.e2e\.ts/,
    },

    // --- Guest tests (no auth, no mocks) ---
    {
      name: 'guest',
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: /.*\.guest\.ts/,
    },
  ],

  webServer: BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')
    ? {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
})
