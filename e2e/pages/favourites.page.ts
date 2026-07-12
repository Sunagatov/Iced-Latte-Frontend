import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class FavouritesPage extends BasePage {
  readonly items: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    super(page)
    this.items = page.getByTestId('fav-element')
    this.emptyState = page.getByTestId('favourites-empty')
  }

  async goto() {
    await this.page.goto('/favourites')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.items.first().or(this.emptyState)).toBeVisible({ timeout: 12_000 })
  }

  async expectEmpty() {
    await expect(this.emptyState).toBeVisible({ timeout: 12_000 })
  }

  async expectItemCount(count: number) {
    await expect(this.items).toHaveCount(count, { timeout: 12_000 })
  }

  async removeFirst() {
    await this.items.first().locator('button[aria-label="Remove from favourites"]').click()
  }
}
