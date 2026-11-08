/* Invoked by SyncBrowserIntegrationTest. All account data/API responses come
 * from the actual Spring application and its disposable PostgreSQL database. */
import { chromium, expect } from '@playwright/test'
import fs from 'node:fs'
import crypto from 'node:crypto'
const A = '418499f3-d951-40bf-9414-5cb90ab21ecb'
const input = () =>
  new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      data += chunk
    })
    process.stdin.on('end', () => resolve(JSON.parse(data)))
  })

async function main() {
  const config = await input()
  const url = new URL(config.url)
  if (url.hostname !== '127.0.0.1' || url.protocol !== 'http:')
    throw new Error('Local test URL required')
  const browser = await chromium.launch({
    channel: process.env.SYNC_BROWSER_CHANNEL || 'chrome',
    headless: true,
  })
  const results = []
  let index = 0
  try {
    for (const width of [1440, 390])
      for (const scenario of [
        'copied-tab',
        'favourites',
        'profile',
        'guest-merge',
      ]) {
        const context = await browser.newContext({
          viewport: { width, height: width === 390 ? 844 : 1000 },
        })
        const account = config.accounts[index++]
        await context.addCookies([
          {
            name: 'token',
            value: account.token,
            url: config.url,
            httpOnly: true,
          },
          {
            name: 'refreshToken',
            value: account.refreshToken,
            url: config.url,
            httpOnly: true,
          },
        ])
        const errors = []
        context.on('page', (page) => {
          page.setDefaultTimeout(12000)
          page.on('pageerror', (error) => errors.push(error.message))
        })
        const userResponse = await context.request.get(
          config.url + '/api/proxy/users',
        )
        expect(userResponse.status()).toBe(200)
        const user = await userResponse.json()
        const read = async (resource) => {
          const response = await context.request.get(
            `${config.url}/api/proxy/sync/${resource}`,
          )
          expect(response.status()).toBe(200)
          return response.json()
        }
        const command = async (resource, type, payload) => {
          const base = await read(resource)
          const response = await context.request.post(
            `${config.url}/api/proxy/sync/${resource}/operations`,
            {
              headers: { Origin: config.url },
              data: {
                operationId: crypto.randomUUID(),
                expectedUserId: user.id,
                expectedRevision: base.revision,
                type,
                payload,
              },
            },
          )
          expect(response.status()).toBe(200)
          const result = await response.json()
          expect(result.outcome).toBe('APPLIED')
          return result
        }
        await command('cart', 'add', {
          items: [
            {
              productId: A,
              productQuantity: scenario === 'guest-merge' ? 98 : 1,
            },
          ],
        })
        if (scenario === 'favourites')
          await command('favourites', 'save', { productId: A, saved: true })
        let loseNext = null
        const operations = []
        await context.route('**/*', async (route) => {
          const request = route.request()
          const address = new URL(request.url())
          if (address.hostname !== '127.0.0.1') return route.abort()
          if (address.pathname === '/_next/image')
            return route.fulfill({
              contentType: 'image/svg+xml',
              body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>',
            })
          const match = address.pathname.match(
            /^\/api\/proxy\/sync\/(cart|favourites|profile)\/operations$/,
          )
          if (match && request.method() === 'POST') {
            operations.push({ resource: match[1], ...request.postDataJSON() })
            if (loseNext === match[1]) {
              loseNext = null
              // Fetch the REAL response first: the database transaction commits.
              const response = await route.fetch()
              expect(response.status()).toBe(200)
              expect((await response.json()).outcome).toBe('APPLIED')
              return route.abort('failed')
            }
          }
          return route.continue()
        })
        if (scenario === 'guest-merge')
          await context.addInitScript(
            ({ A }) => {
              if (location.protocol !== 'http:') return
              if (localStorage.getItem('sync-guest-seeded')) return
              localStorage.setItem('sync-guest-seeded', 'yes')
              localStorage.setItem(
                'cart-storage',
                JSON.stringify({
                  version: 0,
                  state: {
                    isSync: false,
                    count: 5,
                    totalPrice: 50,
                    itemsIds: [{ productId: A, productQuantity: 5 }],
                    tempItems: [
                      {
                        id: A,
                        productInfo: { id: A, name: 'Guest coffee', price: 10 },
                        productQuantity: 5,
                      },
                    ],
                  },
                }),
              )
            },
            { A },
          )
        const page = await context.newPage()
        await page.goto(
          `${config.url}/${scenario === 'profile' ? 'profile' : scenario === 'favourites' ? 'favourites' : 'cart'}`,
          { waitUntil: 'domcontentloaded' },
        )
        try {
          if (scenario === 'copied-tab') {
            await expect(page.getByTestId('cart-item-qty')).toHaveText('1')
            await page.getByTestId('cart-plus-btn').click()
            await expect(page.getByTestId('cart-item-qty')).toHaveText('2')
            const opened = context.waitForEvent('page')
            await page.evaluate(() => window.open('/cart', 'sync-real-copy'))
            const copy = await opened
            await expect(copy.getByTestId('cart-item-qty')).toHaveText('2')
            loseNext = 'cart'
            await page.getByTestId('cart-plus-btn').click()
            await expect(
              page.getByRole('button', { name: 'Try again', exact: true }),
            ).toBeVisible()
            await copy.getByTestId('cart-plus-btn').click()
            await expect(copy.getByTestId('cart-item-qty')).toHaveText('4')
            expect((await read('cart')).data.productsQuantity).toBe(4)
            const adjustments = operations.filter(
              (op) => op.resource === 'cart' && op.type === 'adjust',
            )
            expect(new Set(adjustments.map((op) => op.operationId)).size).toBe(
              3,
            )
            await copy
              .getByRole('button', { name: 'Clear all', exact: true })
              .click()
            await expect(
              copy.getByText('Your cart is empty', { exact: true }),
            ).toBeVisible()
            expect((await read('cart')).data.productsQuantity).toBe(0)
            await page.reload({ waitUntil: 'domcontentloaded' })
            await expect(
              page.getByText('Your cart is empty', { exact: true }),
            ).toBeVisible()
            // The proxy must retain spaces and Unicode in the submitted search.
            // Dropping this keyword would incorrectly return the full catalog.
            await page.goto(config.url, { waitUntil: 'domcontentloaded' })
            await expect(page.getByTestId('product-card').first()).toBeVisible()
            const absentSearch = `No match cafР“В© ${crypto.randomUUID()}`
            const search = page.getByRole('textbox', { name: 'Search products' })
            await search.fill(absentSearch)
            await search.press('Enter')
            await expect(page.getByTestId('empty-state')).toContainText(absentSearch)
            await expect(page.getByTestId('product-card')).toHaveCount(0)
          } else if (scenario === 'favourites') {
            await expect(page.getByTestId('fav-element')).toHaveCount(1)
            loseNext = 'favourites'
            await page
              .getByRole('button', {
                name: 'Remove from favourites',
                exact: true,
              })
              .click()
            await expect(
              page.getByRole('button', { name: 'Retry', exact: true }),
            ).toBeVisible()
            await command('favourites', 'save', { productId: A, saved: true })
            await page
              .getByRole('button', { name: 'Retry', exact: true })
              .click()
            await expect(page.getByTestId('fav-element')).toHaveCount(1)
            await expect(
              page.getByRole('button', {
                name: 'Remove from favourites',
                exact: true,
              }),
            ).toBeEnabled()
            expect(
              (await read('favourites')).data.products.map((p) => p.id),
            ).toEqual([A])
          } else if (scenario === 'profile') {
            await page.getByRole('button', { name: /Edit Profile/ }).click()
            await expect(
              page.getByLabel('First name', { exact: true }),
            ).toHaveValue('Integration')
            await command('profile', 'update', {
              firstName: 'Remote',
              lastName: 'Updated',
            })
            await page.getByLabel('First name', { exact: true }).fill('Зуфар')
            await page.locator('#save-btn').click()
            await expect(page.locator('form [role=alert]')).toContainText(
              'profile changed on another device',
            )
            await expect(page.locator('form [role=alert]')).toBeFocused()
            await expect(page.locator('form [role=alert]')).toBeInViewport()
            await expect(page.locator('#save-btn')).toBeDisabled()
            await page.locator('form [role=alert]').screenshot({
              path: `${config.output}/profile-conflict-${width}.png`,
            })
            await page
              .getByRole('button', {
                name: 'Keep my edits and review',
                exact: true,
              })
              .click()
            await expect(
              page.getByLabel('First name', { exact: true }),
            ).toHaveValue('Зуфар')
            await expect(
              page.getByLabel('Last name', { exact: true }),
            ).toHaveValue('Updated')
            await page.locator('#save-btn').click()
            await expect(page.locator('#edit-btn')).toBeVisible()
            const profile = (await read('profile')).data
            expect(profile.firstName).toBe('Зуфар')
            expect(profile.lastName).toBe('Updated')
            await page.locator('#edit-btn').scrollIntoViewIfNeeded()
            await page.locator('#edit-btn').click()
            await expect(page.getByRole('button', { name: 'Manage delivery addresses' })).toBeVisible()
            await expect(page.getByLabel('Country', { exact: true })).toHaveCount(0)
            await page.getByRole('button', { name: 'Manage delivery addresses' }).click()
            await page.getByRole('button', { name: 'Add address', exact: true }).click()
            const dialog = page.getByRole('dialog')
            await expect(dialog).toBeVisible()
            await expect(dialog.getByRole('button', { name: /Close/i })).toBeFocused()
            if (width === 390) {
              await page.setViewportSize({ width: 844, height: 390 })
              const box = await dialog.boundingBox()
              expect(box.y).toBeGreaterThanOrEqual(0)
              expect(box.y + box.height).toBeLessThanOrEqual(390)
              await dialog.getByRole('button', { name: 'Add address', exact: true }).scrollIntoViewIfNeeded()
              await expect(dialog.getByRole('button', { name: 'Add address', exact: true })).toBeInViewport()
              await page.setViewportSize({ width: 320, height: 700 })
            }
            await page.keyboard.press('Escape')
            await expect(dialog).toHaveCount(0)
            expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
            const observer = await context.newPage()
            await observer.goto(config.url + '/profile')
            await expect(observer.getByRole('heading', { name: 'Зуфар Updated', exact: true })).toBeVisible()
            // Avatar mutations must invalidate the same profile revision that
            // protects profile edits, and refresh an already mounted image.
            const avatar = page.getByRole('img', {
              name: 'Profile photo',
              exact: true,
            })
            const upload = page.getByLabel('Upload profile photo', {
              exact: true,
            })
            const firstFile = fs.readFileSync(
              new URL('./fixtures/avatar-teal.png', import.meta.url),
            )
            const secondFile = fs.readFileSync(
              new URL('./fixtures/avatar-blue.png', import.meta.url),
            )
            const beforeAvatar = (await read('profile')).revision
            await upload.setInputFiles({
              name: 'avatar.png',
              mimeType: 'image/png',
              buffer: firstFile,
            })
            await expect(
              page.getByRole('button', { name: 'Remove photo', exact: true }),
            ).toBeEnabled()
            await expect(avatar).toHaveJSProperty('naturalWidth', 128)
            expect((await read('profile')).revision).toBe(beforeAvatar + 1)
            await observer.bringToFront()
            await observer
              .getByRole('button', { name: 'Overview', exact: true })
              .click()
            const observerAvatar = observer.getByRole('img', {
              name: 'Profile photo',
              exact: true,
            })
            await expect(observerAvatar).toHaveJSProperty('naturalWidth', 128)
            const previousSrc = await observerAvatar.getAttribute('src')
            await page.bringToFront()
            await upload.setInputFiles({
              name: 'replacement.png',
              mimeType: 'image/png',
              buffer: secondFile,
            })
            await expect(
              page.getByRole('button', { name: 'Remove photo', exact: true }),
            ).toBeEnabled()
            expect((await read('profile')).revision).toBe(beforeAvatar + 2)
            await observer.bringToFront()
            await observer
              .getByRole('button', { name: 'Overview', exact: true })
              .click()
            await expect(observerAvatar).not.toHaveAttribute('src', previousSrc)
            await expect(observerAvatar).toHaveJSProperty('naturalWidth', 128)
            const imageBytes = await observerAvatar.evaluate(async (image) =>
              Array.from(
                new Uint8Array(await (await fetch(image.src)).arrayBuffer()),
              ),
            )
            expect(imageBytes).toEqual(Array.from(secondFile))
            // Controls fit the hero even on the existing 320px profile check.
            const controlsBox = await page
              .getByRole('button', { name: 'Remove photo', exact: true })
              .boundingBox()
            const photoBox = await avatar.boundingBox()
            const heroBox = await page
              .locator('.bg-gradient-to-r')
              .boundingBox()
            expect(controlsBox.y).toBeGreaterThanOrEqual(
              photoBox.y + photoBox.height,
            )
            expect(controlsBox.y + controlsBox.height).toBeLessThanOrEqual(
              heroBox.y + heroBox.height,
            )
            await page.screenshot({
              path: `${config.output}/avatar-controls-${width}.png`,
            })
            await page
              .getByRole('button', { name: 'Remove photo', exact: true })
              .click()
            await expect(avatar).toHaveCount(0)
            expect((await read('profile')).revision).toBe(beforeAvatar + 3)
            await observer.bringToFront()
            await observer
              .getByRole('button', { name: 'Overview', exact: true })
              .click()
            await expect(observerAvatar).toHaveCount(0)
            await page.locator('#logout-btn').click()
            await expect(observer).toHaveURL(/signin/)
            await expect(observer.getByRole('heading', { name: 'Зуфар Updated', exact: true })).toHaveCount(0)
            await observer.close()
            if (width === 390) await page.setViewportSize({ width: 390, height: 844 })

          } else {
            const review = page.getByRole('region', {
              name: 'Guest items needing review',
            })
            await expect(review).toBeVisible()
            await expect(page.getByTestId('cart-item-qty')).toHaveText('98')
            await page.reload({ waitUntil: 'domcontentloaded' })
            await expect(review).toBeVisible()
            await page.getByTestId('cart-minus-btn').click()
            await expect(page.getByTestId('cart-item-qty')).toHaveText('97')
            await review.getByRole('spinbutton').fill('2')
            await review
              .getByRole('button', { name: 'Retry corrected draft' })
              .click()
            await expect(review).toHaveCount(0)
            await expect(page.getByTestId('cart-item-qty')).toHaveText('99')
            expect((await read('cart')).data.productsQuantity).toBe(99)
          }
          expect(errors).toEqual([])
          await page.screenshot({
            path: `${config.output}/${scenario}-${width}.png`,
          })
          results.push({
            scenario,
            width,
            passed: true,
            title: await page.title(),
            runtimeErrors: errors,
            operations: operations.map(
              ({ operationId, resource, type, expectedRevision }) => ({
                operationId,
                resource,
                type,
                expectedRevision,
              }),
            ),
          })
        } catch (error) {
          fs.writeFileSync(
            `${config.output}/failure-${scenario}-${width}.json`,
            JSON.stringify(
              {
                url: page.url(),
                text: await page.locator('body').innerText(),
                runtimeErrors: errors,
              },
              null,
              2,
            ),
          )
          await page.screenshot({
            path: `${config.output}/failure-${scenario}-${width}.png`,
            fullPage: true,
          })
          throw error
        }
        await context.close()
      }
  } finally {
    await browser.close()
    fs.writeFileSync(
      `${config.output}/results.json`,
      JSON.stringify(
        {
          backend: 'actual Spring application',
          database: 'disposable Testcontainers PostgreSQL',
          browser: 'Playwright Chrome',
          results,
        },
        null,
        2,
      ),
    )
  }
  console.log(`Passed ${results.length} real backend/browser scenarios.`)
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
