import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class CheckoutPage extends BasePage {
  readonly heading: Locator
  readonly recipientName: Locator
  readonly recipientSurname: Locator
  readonly addressLine: Locator
  readonly city: Locator
  readonly postcode: Locator
  readonly country: Locator
  readonly placeOrderButton: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.locator('h1', { hasText: 'Checkout' })
    this.recipientName = page.locator('#recipientName')
    this.recipientSurname = page.locator('#recipientSurname')
    this.addressLine = page.locator('#addressLine')
    this.city = page.locator('#city')
    this.postcode = page.locator('#postcode')
    this.country = page.locator('#country')
    this.placeOrderButton = page.getByRole('button', { name: 'Place order' })
  }

  async goto() {
    await this.page.goto('/checkout')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 8_000 })
  }

  async expectReady() {
    await expect(this.placeOrderButton).toBeVisible({ timeout: 10_000 })
    await expect(this.placeOrderButton).toBeEnabled({ timeout: 10_000 })
  }

  async fillForm(data?: { name?: string; surname?: string; address?: string; city?: string; postcode?: string; country?: string }) {
    await this.recipientName.fill(data?.name ?? 'John')
    await this.recipientSurname.fill(data?.surname ?? 'Doe')
    await this.addressLine.fill(data?.address ?? '123 Main St')
    await this.city.fill(data?.city ?? 'London')
    await this.postcode.fill(data?.postcode ?? 'SW1A 1AA')
    await this.country.fill(data?.country ?? 'United Kingdom')
  }
}
