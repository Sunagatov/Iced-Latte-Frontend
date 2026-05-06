import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class ProductDetailPage extends BasePage {
  readonly title: Locator
  readonly price: Locator
  readonly addToCartButton: Locator
  readonly favouriteButton: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.locator('h1').first()
    this.price = page.getByTestId('product-price')
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i })
    this.favouriteButton = page.getByTestId('favourite-btn')
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/product\//)
    await expect(this.title).toBeVisible({ timeout: 10_000 })
  }

  async addToCart() {
    await this.safeClick(this.addToCartButton)
  }
}
