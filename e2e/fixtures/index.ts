import { test as base, expect } from '@playwright/test'
import { HomePage } from '../pages/home.page'
import { SignInPage } from '../pages/signin.page'
import { ProductDetailPage } from '../pages/product-detail.page'
import { CartPage } from '../pages/cart.page'
import { FavouritesPage } from '../pages/favourites.page'
import { ProfilePage } from '../pages/profile.page'
import { OrdersPage } from '../pages/orders.page'
import { CheckoutPage } from '../pages/checkout.page'

type Fixtures = {
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  homePage: HomePage
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  signInPage: SignInPage
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  productDetailPage: ProductDetailPage
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  cartPage: CartPage
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  favouritesPage: FavouritesPage
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  profilePage: ProfilePage
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  ordersPage: OrdersPage
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  checkoutPage: CheckoutPage
}

export const test = base.extend<Fixtures>({
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  homePage: async ({ page }, use) => { await use(new HomePage(page)) },
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  signInPage: async ({ page }, use) => { await use(new SignInPage(page)) },
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  productDetailPage: async ({ page }, use) => { await use(new ProductDetailPage(page)) },
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  cartPage: async ({ page }, use) => { await use(new CartPage(page)) },
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  favouritesPage: async ({ page }, use) => { await use(new FavouritesPage(page)) },
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  profilePage: async ({ page }, use) => { await use(new ProfilePage(page)) },
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  ordersPage: async ({ page }, use) => { await use(new OrdersPage(page)) },
  // noinspection JSUnusedGlobalSymbols -- Playwright consumes fixture names by parameter injection.
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)) },
})

export { expect }
