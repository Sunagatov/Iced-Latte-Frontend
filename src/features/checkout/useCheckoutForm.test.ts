import { renderHook, act } from '@testing-library/react'
import { useCheckoutForm } from '@/features/checkout/useCheckoutForm'
import * as paymentApi from '@/features/payment/paymentApi'
import { useCartStore } from '@/features/cart/cartStore'
import { useAuthStore } from '@/features/auth/store'

jest.mock('@/features/payment/paymentApi')
jest.mock('@/features/payment/config', () => ({
  hostedCheckoutEnabled: true,
  getCheckoutUnavailableMessage: () => 'Checkout unavailable',
}))

const mockedPaymentApi = jest.mocked(paymentApi)

function mockSubmitEvent() {
  return { preventDefault: jest.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>
}

describe('useCheckoutForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useAuthStore.setState({
      userData: { id: 'u1', firstName: 'Test', lastName: 'User', email: 'test@example.com' } as never,
      isLoggedIn: true,
    })
    useCartStore.setState({
      tempItems: [{ id: 'ci1', productInfo: { id: 'p1', name: 'Coffee', price: 10 }, productQuantity: 1 }] as never,
      count: 1,
      totalPrice: 10,
    })
  })

  it('calls createCheckout with correct payload on submit', async () => {
    mockedPaymentApi.createCheckout.mockResolvedValue({
      orderId: 'o1',
      stripeSessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/test',
    })

    const { result } = renderHook(() => useCheckoutForm())

    // jsdom throws on window.location.href assignment — catch it
    await act(async () => {
      try {
        await result.current.handleSubmit(mockSubmitEvent())
      } catch {
        // Expected: jsdom rejects navigation to external URL
      }
    })

    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledTimes(1)
    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ recipientName: 'Test', recipientSurname: 'User' }),
      expect.any(String),
    )
  })

  it('sends Idempotency-Key in UUID format', async () => {
    mockedPaymentApi.createCheckout.mockResolvedValue({
      orderId: 'o1',
      stripeSessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/test',
    })

    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => {
      try {
        await result.current.handleSubmit(mockSubmitEvent())
      } catch {
        // Expected: jsdom rejects navigation
      }
    })

    const idempotencyKey = mockedPaymentApi.createCheckout.mock.calls[0][1]

    expect(idempotencyKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('does not reset cart on submit (cart cleared only after payment confirmation)', async () => {
    mockedPaymentApi.createCheckout.mockResolvedValue({
      orderId: 'o1',
      stripeSessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/test',
    })

    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => {
      try {
        await result.current.handleSubmit(mockSubmitEvent())
      } catch {
        // Expected: jsdom rejects navigation
      }
    })

    expect(useCartStore.getState().count).toBe(1)
  })

})
