import { test, expect } from '@playwright/test'

const EMAIL = 'olivia@example.com'
const PASSWORD = 'p@ss1logic11'

async function loginViaApi(page: import('@playwright/test').Page) {
  const res = await page.request.post('http://localhost:8083/api/v1/auth/authenticate', {
    data: { email: EMAIL, password: PASSWORD },
  })
  const { token, refreshToken } = await res.json()
  await page.context().addCookies([{ name: 'token', value: token, url: 'http://localhost:3000' }])
  await page.goto('/')
  await page.evaluate(
    ({ t, rt }) => {
      localStorage.setItem('token', JSON.stringify({ state: { token: t, refreshToken: rt, isLoggedIn: true }, version: 0 }))
    },
    { t: token, rt: refreshToken },
  )
}

test.beforeEach(async ({ page }) => {
  await loginViaApi(page)
})

test('add product to cart', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const addToCart = page.locator('button:has(img[src*="plus"])').first()
  await addToCart.waitFor({ timeout: 15000 })
  await addToCart.click()
  await page.goto('/cart')
  await expect(page.locator('main')).toBeVisible()
})

test('cart page is accessible', async ({ page }) => {
  await page.goto('/cart')
  await expect(page).not.toHaveURL(/signin/)
})

test('favourites page is accessible', async ({ page }) => {
  await page.goto('/favourites')
  await expect(page).not.toHaveURL(/signin/)
})

test('profile page is accessible', async ({ page }) => {
  await page.goto('/profile')
  await expect(page).not.toHaveURL(/signin/)
})
