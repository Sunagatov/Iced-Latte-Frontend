import { renderHook, act } from '@testing-library/react'
import { useCheckoutForm } from '@/features/checkout/useCheckoutForm'
import * as paymentApi from '@/features/payment/paymentApi'
import { useCartStore } from '@/features/cart/cartStore'
import { useAuthStore } from '@/features/auth/store'
import { redirectToHostedCheckout } from '@/features/checkout/redirect'

let mockCheckoutTurnstileEnabled = false

jest.mock('@/features/payment/paymentApi')
jest.mock('@/features/checkout/redirect')
jest.mock('@/features/payment/config', () => ({
  get checkoutTurnstileEnabled() {
    return mockCheckoutTurnstileEnabled
  },
  hostedCheckoutEnabled: true,
  getCheckoutErrorMessage: () => 'Checkout failed with backend detail',
  getCheckoutUnavailableMessage: () => 'Checkout unavailable',
}))

const mockedPaymentApi = jest.mocked(paymentApi)
const mockedRedirectToHostedCheckout = jest.mocked(redirectToHostedCheckout)

function mockSubmitEvent() {
  return { preventDefault: jest.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>
}

describe('useCheckoutForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckoutTurnstileEnabled = false

    useAuthStore.setState({
      userData: {
        id: 'u1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        address: {
          country: 'UK',
          city: 'London',
          line: '123 Main St',
          postcode: 'SW1A 1AA',
        },
      } as never,
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

    await act(async () => {
      await result.current.handleSubmit(mockSubmitEvent())
    })

    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledTimes(1)
    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ recipientName: 'Test', recipientSurname: 'User' }),
      expect.any(String),
    )
    expect(mockedRedirectToHostedCheckout).toHaveBeenCalledWith(
      'https://checkout.stripe.com/test',
    )
  })

  it('includes Turnstile token when checkout Turnstile is enabled', async () => {
    mockCheckoutTurnstileEnabled = true
    mockedPaymentApi.createCheckout.mockResolvedValue({
      orderId: 'o1',
      stripeSessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/test',
    })

    const { result } = renderHook(() => useCheckoutForm())

    act(() => {
      result.current.setTurnstileToken('turnstile-token')
    })

    await act(async () => {
      await result.current.handleSubmit(mockSubmitEvent())
    })

    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ turnstileToken: 'turnstile-token' }),
      expect.any(String),
    )
  })

  it('does not submit checkout when Turnstile is enabled and token is missing', async () => {
    mockCheckoutTurnstileEnabled = true

    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => {
      await result.current.handleSubmit(mockSubmitEvent())
    })

    expect(mockedPaymentApi.createCheckout).not.toHaveBeenCalled()
    expect(result.current.error).toBe(
      'Please complete verification before placing your order.',
    )
  })

  it('trims recipient and address fields before submitting checkout', async () => {
    mockedPaymentApi.createCheckout.mockResolvedValue({
      orderId: 'o1',
      stripeSessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/test',
    })

    useAuthStore.setState({
      userData: {
        id: 'u1',
        firstName: ' Test ',
        lastName: ' User ',
        email: 'test@example.com',
        address: {
          country: ' UK ',
          city: ' London ',
          line: ' 123 Main St ',
          postcode: ' SW1A 1AA ',
        },
      } as never,
      isLoggedIn: true,
    })

    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => {
      await result.current.handleSubmit(mockSubmitEvent())
    })

    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientName: 'Test',
        recipientSurname: 'User',
        address: {
          country: 'UK',
          city: 'London',
          line: '123 Main St',
          postcode: 'SW1A 1AA',
        },
      }),
      expect.any(String),
    )
  })

  it('does not submit whitespace-only required checkout fields', async () => {
    useAuthStore.setState({
      userData: {
        id: 'u1',
        firstName: ' ',
        lastName: 'User',
        email: 'test@example.com',
        address: {
          country: 'UK',
          city: 'London',
          line: ' ',
          postcode: 'SW1A 1AA',
        },
      } as never,
      isLoggedIn: true,
    })

    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => {
      await result.current.handleSubmit(mockSubmitEvent())
    })

    expect(mockedPaymentApi.createCheckout).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Please complete all required checkout fields.')
  })

  it('sends Idempotency-Key in UUID format', async () => {
    mockedPaymentApi.createCheckout.mockResolvedValue({
      orderId: 'o1',
      stripeSessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/test',
    })

    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => {
      await result.current.handleSubmit(mockSubmitEvent())
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
      await result.current.handleSubmit(mockSubmitEvent())
    })

    expect(useCartStore.getState().count).toBe(1)
  })

})
