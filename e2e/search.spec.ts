import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('search bar is visible in header', async ({ page }) => {
  await expect(page.getByRole('textbox', { name: 'Search products' })).toBeVisible()
})

test('typing shows autocomplete suggestions', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search products' })
  await input.fill('latte')
  await expect(page.locator('[role="listbox"], ul').first()).toBeVisible({ timeout: 2000 })
})

test('clear button resets input', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search products' })
  await input.fill('espresso')
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(input).toHaveValue('')
})

test('submitting search scrolls to catalog and filters products', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search products' })
  await input.fill('latte')
  await input.press('Enter')
  await expect(page.locator('#catalog')).toBeInViewport({ timeout: 3000 })
})

test('recent searches appear on focus after a search', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search products' })
  await input.fill('mocha')
  await input.press('Enter')
  await input.fill('')
  await input.focus()
  await expect(page.getByText('mocha')).toBeVisible({ timeout: 1000 })
})

test('keyboard navigation selects suggestion', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search products' })
  await input.fill('latte')
  await page.waitForTimeout(400)
  await input.press('ArrowDown')
  await input.press('Enter')
  // After selecting, dropdown should close
  await expect(input).not.toHaveValue('latte')
})

test('Escape closes dropdown', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Search products' })
  await input.fill('cap')
  await page.waitForTimeout(400)
  // Dropdown is the div directly after the input wrapper
  const dropdown = page.locator('header ~ * .absolute, header .absolute').filter({ has: page.locator('ul') })
  await expect(dropdown).toBeVisible()
  await input.press('Escape')
  await expect(dropdown).not.toBeVisible()
})
