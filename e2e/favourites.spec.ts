import { test, expect } from '@playwright/test'

const EMAIL = 'olivia@example.com'
const PASSWORD = 'p@ss1logic11'

async function login(page: import('@playwright/test').Page) {
  const res = await page.request.post('http://localhost:8083/api/v1/auth/authenticate', {
    data: { email: EMAIL, password: PASSWORD },
  })
  const { token, refreshToken } = await res.json()
  await page.goto('/')
  await page.evaluate(
    ({ t, rt }) => {
      localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: rt, isLoggedIn: true }, version: 0 }))
    },
    { t: token, rt: refreshToken },
  )
}

test('favourites page is accessible when logged in', async ({ page }) => {
  await login(page)
  await page.goto('/favourites')
  await expect(page).not.toHaveURL(/signin/, { timeout: 10000 })
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
})

test('heart icon on product card is visible', async ({ page }) => {
  await login(page)
  await page.goto('/')
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  await expect(page.locator('[data-testid="favourite-btn"]').first()).toBeVisible()
})

test('clicking heart toggles favourite state', async ({ page }) => {
  await login(page)
  await page.reload()
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
  const heartBtn = page.locator('[data-testid="favourite-btn"]').first()
  await heartBtn.waitFor({ timeout: 10000 })
  const before = await heartBtn.getAttribute('data-active')
  await heartBtn.click()
  await page.waitForTimeout(800)
  const after = await heartBtn.getAttribute('data-active')
  expect(after).not.toBe(before)
})
