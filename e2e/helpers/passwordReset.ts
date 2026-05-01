import type { Page, Route } from '@playwright/test'
import { mockRoute } from './mockRoute'

export const EXISTING_EMAIL =
  process.env.E2E_EXISTING_EMAIL ?? 'olivia@example.com'

function isSessionUserRoute(url: string) {
  return (
    url.includes('/users') &&
    !url.includes('/addresses') &&
    !url.includes('/reviews') &&
    !url.includes('/avatar') &&
    !url.includes('/orders')
  )
}

export async function mockAll200(page: Page) {
  await mockRoute(page, '**/api/proxy/**', (route: Route) => {
    const url = route.request().url()

    if (isSessionUserRoute(url)) {
      void route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      })
      return
    }

    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
}

export async function mockAll200Authenticated(page: Page) {
  await mockRoute(page, '**/api/proxy/**', (route: Route) => {
    const url = route.request().url()

    if (isSessionUserRoute(url)) {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'u1',
          firstName: 'Test',
          lastName: 'User',
          email: 'olivia@example.com',
          phoneNumber: null,
          birthDate: null,
          address: null,
        }),
      })
      return
    }

    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
}

export async function loginAs(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.goto('/resetpass')
  await page.waitForLoadState('domcontentloaded')
}

export async function mockPasswordChangeSuccess(page: Page) {
  await mockRoute(page, '**/api/proxy/auth/password/change', (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
}

export async function mockForgotPasswordSuccess(page: Page) {
  await mockRoute(page, '**/api/proxy/auth/password/forgot', (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  })
}

export async function mockUsersPatch(
  page: Page,
  patchHandler: (route: Route) => void | Promise<void>,
) {
  await mockRoute(page, '**/api/proxy/users', (route: Route) => {
    if (route.request().method() === 'PATCH') {
      return patchHandler(route)
    }

    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'u1',
        firstName: 'Olivia',
        lastName: 'Test',
        email: 'olivia@example.com',
      }),
    })
  })
}
