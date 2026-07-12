import CheckoutSuccessPage from './page'
import { ROUTES } from '@/shared/config/routes'
import { requireRecoverableSession } from '@/shared/auth/guards'
import { redirect } from 'next/navigation'

jest.mock('@/shared/auth/guards', () => ({
  requireRecoverableSession: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

jest.mock('@/features/payment/CheckoutSuccess', () => ({
  CheckoutSuccess: ({ orderId }: { orderId: string }) => (
    <div data-testid="checkout-success">{orderId}</div>
  ),
}))

const mockedRequireRecoverableSession = jest.mocked(requireRecoverableSession)
const mockedRedirect = jest.mocked(redirect)

describe('CheckoutSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedRequireRecoverableSession.mockResolvedValue(undefined)
  })

  it('requires a recoverable session before rendering', async () => {
    await CheckoutSuccessPage({
      searchParams: Promise.resolve({ order_id: 'order-1' }),
    })

    expect(mockedRequireRecoverableSession).toHaveBeenCalledWith(ROUTES.checkout)
  })

  it('renders checkout success for a single order id', async () => {
    const page = await CheckoutSuccessPage({
      searchParams: Promise.resolve({ order_id: 'order-1' }),
    })

    expect(page.props.orderId).toBe('order-1')
  })

  it('trims a single order id before rendering', async () => {
    const page = await CheckoutSuccessPage({
      searchParams: Promise.resolve({ order_id: ' order-1 ' }),
    })

    expect(page.props.orderId).toBe('order-1')
  })

  it('redirects when order id is missing', async () => {
    await expect(
      CheckoutSuccessPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mockedRedirect).toHaveBeenCalledWith(ROUTES.orders)
  })

  it('redirects when order id is blank', async () => {
    await expect(
      CheckoutSuccessPage({ searchParams: Promise.resolve({ order_id: ' ' }) }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mockedRedirect).toHaveBeenCalledWith(ROUTES.orders)
  })

  it('redirects when order id is duplicated', async () => {
    await expect(
      CheckoutSuccessPage({
        searchParams: Promise.resolve({ order_id: ['order-1', 'order-2'] }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mockedRedirect).toHaveBeenCalledWith(ROUTES.orders)
  })
})
