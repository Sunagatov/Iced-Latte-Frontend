import { test } from '@playwright/test'

test('debug existing email signup', async ({ page }) => {
  const responses: Array<{ status: number; url: string; body: string }> = []
  page.on('response', async (res) => {
    if (res.url().includes('register')) {
      const body = await res.text().catch(() => '')
      responses.push({ status: res.status(), url: res.url(), body })
    }
  })

  await page.goto('/signup')
  await page.fill('#firstName', 'Olivia')
  await page.fill('#lastName', 'Example')
  await page.fill('#email', 'olivia@example.com')
  await page.fill('#password', 'ValidPass1@')
  await page.click('#register-btn')
  await page.waitForTimeout(5000)

  const errorsAfter = await page.locator('.text-negative').allTextContents()
  console.log('URL:', page.url())
  console.log('Errors:', errorsAfter)
  console.log('Responses:', JSON.stringify(responses, null, 2))
})
