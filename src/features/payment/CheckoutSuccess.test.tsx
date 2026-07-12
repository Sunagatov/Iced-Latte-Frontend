import { render, waitFor, act } from '@testing-library/react'
import type * as React from 'react'
import { CheckoutSuccess } from '@/features/payment/CheckoutSuccess'
import * as paymentApi from '@/features/payment/paymentApi'
import { useCartStore } from '@/features/cart/public'
import { trackGoogleAnalyticsEvent } from '@/shared/analytics/googleAnalytics'

jest.mock('@/features/payment/paymentApi')
jest.mock('@/shared/analytics/googleAnalytics', () => ({
  __esModule: true,
  trackGoogleAnalyticsEvent: jest.fn(),
  buildGoogleAnalyticsItems: jest.requireActual(
    '@/shared/analytics/googleAnalytics',
  ).buildGoogleAnalyticsItems,
}))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockedPaymentApi = jest.mocked(paymentApi)
const mockedTrackGoogleAnalyticsEvent = jest.mocked(trackGoogleAnalyticsEvent)

describe('CheckoutSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCartStore.setState({
      count: 1,
      itemsIds: [{ productId: 'p1', productQuantity: 1 }],
      status: 'ready',
      tempItems: [
        {
          id: 'cart-item-1',
          productInfo: {
            id: 'p1',
            name: 'Cold Brew',
            price: 9.99,
          },
          productQuantity: 1,
        },
      ],
      totalPrice: 9.99,
      isSync: true,
      lastError: null,
      pendingProductIds: new Set(),
    })
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
    expect(mockedTrackGoogleAnalyticsEvent).toHaveBeenCalledWith(
      'purchase',
      expect.objectContaining({
        currency: 'USD',
        transaction_id: 'o1',
        value: 9.99,
      }),
    )
  })

  it('tracks a new paid order after rerendering with a different order id', async () => {
    mockedPaymentApi.getCheckoutStatus.mockImplementation(
      async (currentOrderId: string) => ({
        orderId: currentOrderId,
        orderStatus: 'PAID',
        paymentStatus: 'PAID',
      }),
    )

    const { rerender } = render(<CheckoutSuccess orderId="o1" />)

    await waitFor(() => {
      expect(mockedTrackGoogleAnalyticsEvent).toHaveBeenCalledWith(
        'purchase',
        expect.objectContaining({ transaction_id: 'o1' }),
      )
    })

    await act(async () => {
      useCartStore.setState({
        count: 1,
        itemsIds: [{ productId: 'p2', productQuantity: 1 }],
        status: 'ready',
        tempItems: [
          {
            id: 'cart-item-2',
            productInfo: {
              id: 'p2',
              name: 'Oat Milk Latte',
              price: 6.5,
            },
            productQuantity: 1,
          },
        ],
        totalPrice: 6.5,
        isSync: true,
        lastError: null,
        pendingProductIds: new Set(),
      })
    })

    rerender(<CheckoutSuccess orderId="o2" />)

    await waitFor(() => {
      expect(mockedTrackGoogleAnalyticsEvent).toHaveBeenCalledWith(
        'purchase',
        expect.objectContaining({
          transaction_id: 'o2',
          value: 6.5,
        }),
      )
    })
  })

  it('waits for hydrated cart items before tracking a purchase', async () => {
    mockedPaymentApi.getCheckoutStatus.mockResolvedValue({
      orderId: 'o1',
      orderStatus: 'PAID',
      paymentStatus: 'PAID',
    })

    render(<CheckoutSuccess orderId="o1" />)

    await act(async () => {
      useCartStore.setState({
        count: 2,
        itemsIds: [
          { productId: 'p1', productQuantity: 1 },
          { productId: 'p2', productQuantity: 1 },
        ],
        status: 'ready',
        tempItems: [
          {
            id: 'cart-item-1',
            productInfo: {
              id: 'p1',
              name: 'Cold Brew',
              price: 9.99,
            },
            productQuantity: 1,
          },
          {
            id: 'cart-item-2',
            productInfo: {
              id: 'p2',
              name: 'Oat Milk Latte',
              price: 6.5,
            },
            productQuantity: 1,
          },
        ],
        totalPrice: 16.49,
        isSync: true,
        lastError: null,
        pendingProductIds: new Set(),
      })
    })

    await waitFor(() => {
      expect(mockedTrackGoogleAnalyticsEvent).toHaveBeenCalledWith(
        'purchase',
        expect.objectContaining({
          transaction_id: 'o1',
          value: 16.49,
          items: expect.arrayContaining([
            expect.objectContaining({ item_id: 'p1', quantity: 1 }),
            expect.objectContaining({ item_id: 'p2', quantity: 1 }),
          ]),
        }),
      )
    })
  })

  it('shows error state when API call fails', async () => {
    mockedPaymentApi.getCheckoutStatus.mockRejectedValue(new Error('Network error'))

    const { findByText } = render(<CheckoutSuccess orderId="o1" />)

    const error = await findByText('Something went wrong')

    expect(error).toBeInTheDocument()
  })

  it('shows failed state when backend reports terminal payment failure', async () => {
    mockedPaymentApi.getCheckoutStatus.mockResolvedValue({
      orderId: 'o1',
      orderStatus: 'PAYMENT_FAILED',
      paymentStatus: 'FAILED',
    })

    const { findByText } = render(<CheckoutSuccess orderId="o1" />)

    expect(await findByText('Payment could not be completed')).toBeInTheDocument()
    expect(useCartStore.getState().count).toBe(1)
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

  it('clears pending retry timer on unmount', async () => {
    jest.useFakeTimers()
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    mockedPaymentApi.getCheckoutStatus.mockResolvedValue({
      orderId: 'o1',
      orderStatus: 'PENDING_PAYMENT',
      paymentStatus: 'STRIPE_SESSION_CREATED',
    })

    const { unmount } = render(<CheckoutSuccess orderId="o1" />)

    await act(async () => {
      await Promise.resolve()
    })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
    jest.useRealTimers()
  })
})
