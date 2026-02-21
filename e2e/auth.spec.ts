import { test, expect } from '@playwright/test'

const EMAIL = 'olivia@example.com'
const PASSWORD = 'p@ss1logic11'

test('login with valid credentials', async ({ page }) => {
  const res = await page.request.post('http://localhost:8083/api/v1/auth/authenticate', {
    data: { email: EMAIL, password: PASSWORD },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.token).toBeTruthy()
})

test('login with invalid credentials returns 401', async ({ page }) => {
  const res = await page.request.post('http://localhost:8083/api/v1/auth/authenticate', {
    data: { email: 'wrong@example.com', password: 'wrongpassword1A!' },
  })
  expect(res.status()).toBe(401)
})
