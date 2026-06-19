jest.mock('@/features/checkout/components/CheckoutForm', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/features/payment/CheckoutSuccess', () => ({
  __esModule: true,
  CheckoutSuccess: () => null,
}))

jest.mock('@/features/orders/components/OrderHistory', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/features/user/components/profile/ProfileScreen', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/shared/auth/guards', () => ({
  requireRecoverableSession: jest.fn(),
}))

import { dynamic as checkoutCancelDynamic } from '@/app/checkout/cancel/page'
import { dynamic as checkoutDynamic } from '@/app/checkout/page'
import { dynamic as checkoutSuccessDynamic } from '@/app/checkout/success/page'
import { dynamic as ordersDynamic } from '@/app/orders/page'
import { dynamic as profileDynamic } from '@/app/profile/page'

describe('protected route rendering mode', () => {
  it('forces protected pages to stay dynamic for cookie-aware redirects', () => {
    expect(profileDynamic).toBe('force-dynamic')
    expect(ordersDynamic).toBe('force-dynamic')
    expect(checkoutDynamic).toBe('force-dynamic')
    expect(checkoutCancelDynamic).toBe('force-dynamic')
    expect(checkoutSuccessDynamic).toBe('force-dynamic')
  })
})
