import { test, expect } from '@playwright/test'

test('home page loads with products', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Iced Latte')
  await expect(page.locator('header')).toBeVisible()
})
