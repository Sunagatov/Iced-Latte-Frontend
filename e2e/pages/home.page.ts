import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class HomePage extends BasePage {
  readonly productCards: Locator
  readonly searchInput: Locator
  readonly sortDropdown: Locator
  readonly cartBadge: Locator
  readonly favouritesBadge: Locator

  constructor(page: Page) {
    super(page)
    this.productCards = page.getByTestId('product-card')
    this.searchInput = page.getByRole('textbox', { name: 'Search products' })
    this.sortDropdown = page.locator('#productDropdown')
    this.cartBadge = page.getByTestId('header-cart-badge')
    this.favouritesBadge = page.getByTestId('header-favourites-badge')
  }

  async goto() {
    await this.page.goto('/')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.productCards.first().or(this.page.getByTestId('empty-state'))).toBeVisible({
      timeout: 20_000,
    })
  }

  async expectProductsVisible() {
    await expect(this.productCards.first()).toBeVisible({ timeout: 15_000 })
  }

  async searchFor(query: string) {
    await this.safeFill(this.searchInput, query)
    await this.searchInput.press('Enter')
  }

  async clickFirstProduct() {
    await this.safeClick(this.productCards.first())
  }
}
