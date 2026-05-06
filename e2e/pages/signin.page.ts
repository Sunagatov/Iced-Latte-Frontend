import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class SignInPage extends BasePage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.getByLabel('Enter your email address')
    this.passwordInput = page.getByLabel('Password')
    this.loginButton = page.getByRole('button', { name: 'Login' })
    this.errorMessage = page.locator('.text-negative')
  }

  async goto(next?: string) {
    const url = next ? `/signin?next=${next}` : '/signin'
    await this.page.goto(url)
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.emailInput).toBeVisible()
  }

  async login(email: string, password: string) {
    await this.safeFill(this.emailInput, email)
    await this.safeFill(this.passwordInput, password)
    await this.safeClick(this.loginButton)
  }

  async expectError(text: string | RegExp) {
    await expect(this.errorMessage).toContainText(text, { timeout: 10_000 })
  }

  async expectRedirectedAway() {
    await expect(this.page).not.toHaveURL(/\/signin/, { timeout: 15_000 })
  }
}
