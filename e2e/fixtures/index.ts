import { test as base, expect } from '@playwright/test'
import { HomePage } from '../pages/home.page'
import { SignInPage } from '../pages/signin.page'
import { ProductDetailPage } from '../pages/product-detail.page'
import { CartPage } from '../pages/cart.page'

type Fixtures = {
  homePage: HomePage
  signInPage: SignInPage
  productDetailPage: ProductDetailPage
  cartPage: CartPage
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page))
  },
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page))
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page))
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page))
  },
})

export { expect }
