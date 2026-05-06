import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class CartPage extends BasePage {
  readonly cartItems: Locator
  readonly emptyState: Locator
  readonly checkoutButton: Locator

  constructor(page: Page) {
    super(page)
    this.cartItems = page.getByTestId('cart-item')
    this.emptyState = page.getByTestId('cart-empty')
    this.checkoutButton = page.getByRole('button', { name: /checkout/i })
  }

  async goto() {
    await this.page.goto('/cart')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.cartItems.first().or(this.emptyState)).toBeVisible({ timeout: 12_000 })
  }

  async expectEmpty() {
    await expect(this.emptyState).toBeVisible({ timeout: 12_000 })
  }

  async expectItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count, { timeout: 12_000 })
  }
}
