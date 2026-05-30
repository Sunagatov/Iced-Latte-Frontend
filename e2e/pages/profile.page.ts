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
    await expect(
      this.page.getByRole('heading', { name: 'Account summary' }),
    ).toBeVisible({ timeout: 10_000 })
  }

  async openPersonalDetails() {
    const buttons = this.page.getByRole('button', { name: 'Personal details' })

    for (let index = 0; index < await buttons.count(); index += 1) {
      const button = buttons.nth(index)

      if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
        await button.click()
        break
      }
    }

    if (await this.personalDetailsHeading.isVisible({ timeout: 1000 }).catch(() => false)) {
      return
    }

    const editProfileAction = this.page.getByRole('button', {
      name: /edit profile|^edit$/i,
    })

    for (let index = 0; index < await editProfileAction.count(); index += 1) {
      const button = editProfileAction.nth(index)

      if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
        await button.click()
        break
      }
    }

    await expect(this.personalDetailsHeading).toBeVisible({ timeout: 10_000 })
  }

  async openEditForm() {
    if (await this.firstNameInput.isVisible({ timeout: 1000 }).catch(() => false)) return
    await this.editButton.click()
    await expect(this.firstNameInput).toBeVisible({ timeout: 5000 })
  }
}
