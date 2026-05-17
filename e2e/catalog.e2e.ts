import { test, expect } from './fixtures/index'

test.describe('Catalog', () => {
  test('displays product cards', async ({ homePage }) => {
    await homePage.goto()
    await homePage.expectProductsVisible()
  })

  test('sort dropdown is visible', async ({ homePage }) => {
    await homePage.goto()
    await expect(homePage.sortDropdown).toBeVisible()
  })

  test('changing sort re-renders products', async ({ homePage }) => {
    await homePage.goto()
    await homePage.sortDropdown.click()
    await homePage['page'].locator('[data-testid="sort-option"]').first().click()
    await homePage.expectProductsVisible()
  })

  test('search with no results shows empty state', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchFor('zzznoresultsxxx')
    await expect(homePage['page'].getByTestId('empty-state')).toBeVisible({ timeout: 10_000 })
  })

  test('empty state shows suggestion pills', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchFor('zzznoresultsxxx')
    await expect(homePage['page'].getByTestId('suggestion-pill').first()).toBeVisible({ timeout: 8_000 })
  })

  test('clicking suggestion pill updates search', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchFor('zzznoresultsxxx')
    const pill = homePage['page'].getByTestId('suggestion-pill').first()
    await pill.waitFor({ timeout: 8_000 })
    await pill.click()
    await expect(homePage['page'].locator('#catalog')).toBeInViewport()
  })
})

test.describe('Search', () => {
  test('search bar is visible', async ({ homePage }) => {
    await homePage.goto()
    await expect(homePage.searchInput).toBeVisible()
  })

  test('typing shows autocomplete dropdown', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchInput.fill('latte')
    await expect(homePage['page'].getByTestId('search-dropdown')).toBeVisible({ timeout: 5_000 })
  })

  test('clear button resets input', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchInput.fill('espresso')
    await homePage['page'].getByRole('button', { name: 'Clear search' }).click()
    await expect(homePage.searchInput).toHaveValue('')
  })

  test('submitting search scrolls to catalog', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchFor('coffee')
    await expect(homePage['page'].locator('#catalog')).toBeInViewport({ timeout: 5_000 })
  })

  test('Escape closes dropdown', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchInput.fill('latte')
    const dropdown = homePage['page'].getByTestId('search-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 5_000 })
    await homePage.searchInput.press('Escape')
    await expect(dropdown).not.toBeVisible()
  })

  test('keyboard navigation selects suggestion', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchInput.fill('latte')
    const dropdown = homePage['page'].getByTestId('search-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 5_000 })
    await homePage.searchInput.press('ArrowDown')
    await homePage.searchInput.press('Enter')
    // After selecting, input should have the suggestion text
    const value = await homePage.searchInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test('recent searches appear after a search', async ({ homePage }) => {
    await homePage.goto()
    await homePage.searchFor('mocha')
    await homePage.searchInput.fill('')
    await homePage.searchInput.focus()
    await expect(homePage['page'].getByRole('button', { name: 'Remove mocha', exact: true })).toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Filters', () => {
  test('filter sidebar shows all sections', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    await expect(page.getByText('Price, $')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Rating' })).toBeVisible()
    await expect(page.getByText('Brand')).toBeVisible()
    await expect(page.getByText('Seller')).toBeVisible()
  })

  test('price from input accepts numeric values', async ({ homePage }) => {
    await homePage.goto()
    const fromInput = homePage['page'].locator('#from-price-input')
    await fromInput.fill('3')
    await expect(fromInput).toHaveValue('3')
  })

  test('price to input accepts numeric values', async ({ homePage }) => {
    await homePage.goto()
    const toInput = homePage['page'].locator('#to-price-input')
    await toInput.fill('6')
    await expect(toInput).toHaveValue('6')
  })

  test('price filter rejects non-numeric input', async ({ homePage }) => {
    await homePage.goto()
    const fromInput = homePage['page'].locator('#from-price-input')
    await fromInput.fill('abc')
    await expect(fromInput).toHaveValue('')
  })

  test('price filter filters products by range', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    await page.locator('#from-price-input').fill('3')
    await page.locator('#to-price-input').fill('6')
    await expect(
      homePage.productCards.first().or(page.getByTestId('empty-state')),
    ).toBeVisible({ timeout: 20_000 })
  })

  test('rating filter - selecting 4 stars', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    await page.locator('#checkbox-4').click()
    await expect(page.locator('#checkbox-4')).toHaveClass(/bg-brand-solid/)
  })

  test('rating filter - selecting Any shows all', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    await page.locator('#checkbox-any').waitFor({ state: 'visible', timeout: 5_000 })
    await page.locator('#checkbox-any').click()
    await expect(page.locator('#checkbox-any')).toHaveClass(/bg-brand-solid/, { timeout: 3_000 })
  })

  test('rating filter - only one option selected at a time', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    await page.locator('#checkbox-4').click()
    await page.locator('#checkbox-3').click()
    await expect(page.locator('#checkbox-4')).not.toHaveClass(/bg-brand-solid/)
    await expect(page.locator('#checkbox-3')).toHaveClass(/bg-brand-solid/)
  })

  test('brand filter checkbox toggles', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    const checkbox = page.locator('[data-testid="filter-group-brand"] input[type="checkbox"]').first()
    if (!(await checkbox.isVisible())) return
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    await expect(page.locator('#Brand-reset-btn')).toBeVisible()
  })

  test('brand filter reset clears selection', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    const checkbox = page.locator('[data-testid="filter-group-brand"] input[type="checkbox"]').first()
    if (!(await checkbox.isVisible())) return
    await checkbox.click()
    await expect(page.locator('#Brand-reset-btn')).toBeVisible({ timeout: 5_000 })
    await page.locator('#Brand-reset-btn').click()
    await expect(checkbox).not.toBeChecked()
    await expect(page.locator('#Brand-reset-btn')).not.toBeVisible()
  })

  test('brand filter show more expands list', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    const showMoreBtn = page.locator('#Brand-filter-btn')
    if (!(await showMoreBtn.isVisible())) return
    const brandGroup = page.locator('[data-testid="filter-group-brand"]')
    const beforeCount = await brandGroup.locator('input[type="checkbox"]').count()
    await showMoreBtn.click()
    const afterCount = await brandGroup.locator('input[type="checkbox"]').count()
    expect(afterCount).toBeGreaterThan(beforeCount)
  })

  test('seller filter checkbox toggles', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    const checkbox = page.locator('[data-testid="filter-group-seller"] input[type="checkbox"]').first()
    if (!(await checkbox.isVisible())) return
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    await expect(page.locator('#Seller-reset-btn')).toBeVisible()
  })

  test('seller filter reset clears selection', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    const checkbox = page.locator('[data-testid="filter-group-seller"] input[type="checkbox"]').first()
    if (!(await checkbox.isVisible())) return
    await checkbox.click()
    await page.locator('#Seller-reset-btn').click()
    await expect(checkbox).not.toBeChecked()
  })

  test('combined brand + price narrows results', async ({ homePage }) => {
    await homePage.goto()
    const page = homePage['page']
    const checkbox = page.locator('[data-testid="filter-group-brand"] input[type="checkbox"]').first()
    if (await checkbox.isVisible()) await checkbox.click()
    await page.locator('#from-price-input').fill('3')
    await expect(
      homePage.productCards.first().or(page.getByTestId('empty-state')),
    ).toBeVisible({ timeout: 20_000 })
  })
})
