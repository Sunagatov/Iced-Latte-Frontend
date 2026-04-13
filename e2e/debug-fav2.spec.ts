import { test } from '@playwright/test'
import { mockRoute } from './helpers/mockRoute'

const PRODUCT_A = '00000000-0000-0000-0000-000000000001'

test('debug fav sync state', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://localhost:3000')
  await page.waitForLoadState('domcontentloaded')

  await page.evaluate((ids) => {
    localStorage.setItem('fav-storage', JSON.stringify({
      state: { favouriteIds: ids, favourites: [] },
      version: 0,
    }))
  }, [PRODUCT_A])

  const afterSet = await page.evaluate(() => localStorage.getItem('fav-storage'))
  console.log('After set:', afterSet)

  await page.waitForTimeout(3000)

  const afterWait = await page.evaluate(() => localStorage.getItem('fav-storage'))
  console.log('After 3s wait:', afterWait)

  let syncCallCount = 0

  await mockRoute(page, '**/api/proxy/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    console.log('ROUTE:', method, url)

    if (url.includes('/favorites') && method === 'POST') {
      syncCallCount++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [{ id: PRODUCT_A, productName: 'Test', price: 9.99 }] }),
      })
    } else if (url.includes('/users') && !url.includes('/addresses') && !url.includes('/reviews') && !url.includes('/avatar') && !url.includes('/orders')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com', phoneNumber: null, birthDate: null, address: null }),
      })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    }
  })

  await page.goto('http://localhost:3000')
  await page.waitForLoadState('domcontentloaded')

  const afterGoto2 = await page.evaluate(() => localStorage.getItem('fav-storage'))
  console.log('After 2nd goto:', afterGoto2)

  await page.waitForTimeout(3000)

  const afterWait2 = await page.evaluate(() => localStorage.getItem('fav-storage'))
  console.log('After 3s wait (2nd page):', afterWait2)

  console.log('syncCallCount:', syncCallCount)

  await context.close()
})
