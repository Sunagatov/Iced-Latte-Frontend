import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class OrdersPage extends BasePage {
  readonly heading: Locator
  readonly orderCards: Locator
  readonly allTab: Locator
  readonly placedTab: Locator
  readonly deliveredTab: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByText('My Orders')
    this.orderCards = page.locator('button', { hasText: /Order #/ })
    this.allTab = page.getByRole('button', { name: 'All' })
    this.placedTab = page.getByRole('button', { name: 'Placed' })
    this.deliveredTab = page.getByRole('button', { name: 'Delivered' })
  }

  async goto() {
    await this.page.goto('/orders')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 8_000 })
  }

  async expandFirstOrder() {
    await expect(this.orderCards.first()).toBeVisible({ timeout: 8_000 })
    await this.orderCards.first().click()
  }
}
