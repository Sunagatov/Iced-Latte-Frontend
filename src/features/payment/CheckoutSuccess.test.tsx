import { render, waitFor, act } from '@testing-library/react'
import { CheckoutSuccess } from '@/features/payment/CheckoutSuccess'
import * as paymentApi from '@/features/payment/paymentApi'
import { useCartStore } from '@/features/cart/cartStore'

jest.mock('@/features/payment/paymentApi')
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockedPaymentApi = jest.mocked(paymentApi)

describe('CheckoutSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCartStore.setState({ count: 1, totalPrice: 9.99, tempItems: [], itemsIds: [] })
  })

  it('resets cart after backend confirms PAID', async () => {
    mockedPaymentApi.getCheckoutStatus.mockResolvedValue({
      orderId: 'o1',
      orderStatus: 'PAID',
      paymentStatus: 'PAID',
    })

    const { getByText } = render(<CheckoutSuccess orderId="o1" />)

    await waitFor(() => {
      expect(getByText('Payment confirmed!')).toBeInTheDocument()
    })

    expect(useCartStore.getState().count).toBe(0)
  })

  it('shows error state when API call fails', async () => {
    mockedPaymentApi.getCheckoutStatus.mockRejectedValue(new Error('Network error'))

    const { findByText } = render(<CheckoutSuccess orderId="o1" />)

    const error = await findByText('Something went wrong')

    expect(error).toBeInTheDocument()
  })

  it('shows pending state after exhausting retries', async () => {
    jest.useFakeTimers()

    mockedPaymentApi.getCheckoutStatus.mockResolvedValue({
      orderId: 'o1',
      orderStatus: 'PENDING_PAYMENT',
      paymentStatus: 'STRIPE_SESSION_CREATED',
    })

    const { getByText } = render(<CheckoutSuccess orderId="o1" />)

    // Advance through all 5 retries (each waits 2000ms)
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        jest.advanceTimersByTime(2100)
      })
    }

    await waitFor(() => {
      expect(getByText('Payment not yet confirmed')).toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})
