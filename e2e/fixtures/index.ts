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
  homePage: HomePage
  signInPage: SignInPage
  productDetailPage: ProductDetailPage
  cartPage: CartPage
  favouritesPage: FavouritesPage
  profilePage: ProfilePage
  ordersPage: OrdersPage
  checkoutPage: CheckoutPage
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => { await use(new HomePage(page)) },
  signInPage: async ({ page }, use) => { await use(new SignInPage(page)) },
  productDetailPage: async ({ page }, use) => { await use(new ProductDetailPage(page)) },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)) },
  favouritesPage: async ({ page }, use) => { await use(new FavouritesPage(page)) },
  profilePage: async ({ page }, use) => { await use(new ProfilePage(page)) },
  ordersPage: async ({ page }, use) => { await use(new OrdersPage(page)) },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)) },
})

export { expect }
