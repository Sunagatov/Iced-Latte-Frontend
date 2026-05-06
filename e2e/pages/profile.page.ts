import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class ProfilePage extends BasePage {
  readonly personalDetailsHeading: Locator
  readonly editButton: Locator
  readonly saveButton: Locator
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly phoneInput: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    this.personalDetailsHeading = page.locator('h2', { hasText: 'Personal details' })
    this.editButton = page.locator('#edit-btn')
    this.saveButton = page.locator('#save-btn')
    this.firstNameInput = page.locator('#firstName')
    this.lastNameInput = page.locator('#lastName')
    this.phoneInput = page.locator('#phoneNumber')
    this.errorMessage = page.locator('.text-negative').first()
  }

  async goto() {
    await this.page.goto('/profile')
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.page.locator('main')).toBeVisible({ timeout: 10_000 })
  }

  async openPersonalDetails() {
    const sidebar = this.page.locator('aside').getByRole('button', { name: 'Personal details' })
    const chip = this.page.getByRole('button', { name: 'Personal details' }).first()

    if (await sidebar.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sidebar.click()
    } else if (await chip.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chip.click()
    }
    await expect(this.personalDetailsHeading).toBeVisible({ timeout: 10_000 })
  }

  async openEditForm() {
    if (await this.firstNameInput.isVisible({ timeout: 1000 }).catch(() => false)) return
    await this.editButton.click()
    await expect(this.firstNameInput).toBeVisible({ timeout: 5000 })
  }
}
