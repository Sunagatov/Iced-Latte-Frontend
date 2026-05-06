import { type Page, type Locator, expect } from '@playwright/test'

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async safeClick(locator: Locator) {
    await expect(locator).toBeVisible()
    await locator.click()
  }

  protected async safeFill(locator: Locator, value: string) {
    await expect(locator).toBeVisible()
    await locator.fill(value)
  }

  abstract expectLoaded(): Promise<void>
}
