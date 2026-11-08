import { renderHook, act } from '@testing-library/react'
import { AxiosError } from 'axios'
import type * as React from 'react'
import { useCheckoutForm } from '@/features/checkout/useCheckoutForm'
import * as paymentApi from '@/features/payment/paymentApi'
import { useCartStore } from '@/features/cart/public'
import { useAuthStore } from '@/features/auth/public'
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
  return {
    preventDefault: jest.fn(),
  } as unknown as React.SyntheticEvent<HTMLFormElement>
}

describe('useCheckoutForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckoutTurnstileEnabled = false

    useAuthStore.setState({
      status: 'authenticated',
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
      tempItems: [
        {
          id: 'ci1',
          productInfo: { id: 'p1', name: 'Coffee', price: 10 },
          productQuantity: 1,
        },
      ] as never,
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
      expect.objectContaining({
        recipientName: 'Test',
        recipientSurname: 'User',
      }),
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
      result.current.handleTurnstileVerify('turnstile-token')
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

  it('clears missing Turnstile error after verification succeeds', async () => {
    mockCheckoutTurnstileEnabled = true

    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => {
      await result.current.handleSubmit(mockSubmitEvent())
    })

    expect(result.current.error).toBe(
      'Please complete verification before placing your order.',
    )

    act(() => {
      result.current.handleTurnstileVerify('turnstile-token')
    })

    expect(result.current.error).toBe('')
  })

  it('trims recipient and address fields before submitting checkout', async () => {
    mockedPaymentApi.createCheckout.mockResolvedValue({
      orderId: 'o1',
      stripeSessionId: 'cs_test',
      checkoutUrl: 'https://checkout.stripe.com/test',
    })

    useAuthStore.setState({
      status: 'authenticated',
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
      status: 'authenticated',
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
    expect(result.current.error).toBe(
      'Please complete all required checkout fields.',
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
      await result.current.handleSubmit(mockSubmitEvent())
    })

    const idempotencyKey = mockedPaymentApi.createCheckout.mock.calls[0][1]

    expect(idempotencyKey).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
  })

  it('ignores duplicate submissions while checkout creation is in flight', async () => {
    let resolveCheckout!: (value: {
      orderId: string
      stripeSessionId: string
      checkoutUrl: string
    }) => void

    mockedPaymentApi.createCheckout.mockReturnValue(
      new Promise((resolve) => {
        resolveCheckout = resolve
      }),
    )

    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => {
      void result.current.handleSubmit(mockSubmitEvent())
      await result.current.handleSubmit(mockSubmitEvent())
    })

    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveCheckout({
        orderId: 'o1',
        stripeSessionId: 'cs_test',
        checkoutUrl: 'https://checkout.stripe.com/test',
      })
    })
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

  it.each(['network', 'server'])('reuses the checkout key after an uncertain %s failure', async (failure) => {
    const error = failure === 'network' ? new Error('Response lost') : new AxiosError(
      'Server error', undefined, undefined, undefined,
      { status: 500 } as never,
    )

    mockedPaymentApi.createCheckout.mockRejectedValueOnce(error).mockResolvedValueOnce({
      orderId: 'o1', stripeSessionId: 'cs_test', checkoutUrl: 'https://checkout.stripe.com/test',
    })
    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => { await result.current.handleSubmit(mockSubmitEvent()) })
    await act(async () => { await result.current.handleSubmit(mockSubmitEvent()) })

    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledTimes(2)
    expect(mockedPaymentApi.createCheckout.mock.calls[1][1]).toBe(
      mockedPaymentApi.createCheckout.mock.calls[0][1],
    )
  })

  it('keeps the same checkout key when only the verification token changes', async () => {
    mockCheckoutTurnstileEnabled = true
    mockedPaymentApi.createCheckout.mockRejectedValue(new Error('Response lost'))
    const { result } = renderHook(() => useCheckoutForm())

    act(() => result.current.handleTurnstileVerify('first-token'))
    await act(async () => { await result.current.handleSubmit(mockSubmitEvent()) })
    act(() => result.current.handleTurnstileVerify('renewed-token'))
    await act(async () => { await result.current.handleSubmit(mockSubmitEvent()) })

    expect(mockedPaymentApi.createCheckout.mock.calls[1][1]).toBe(
      mockedPaymentApi.createCheckout.mock.calls[0][1],
    )
    expect(mockedPaymentApi.createCheckout.mock.calls[1][0].turnstileToken).toBe('renewed-token')
  })

  it.each(['recipient', 'cart', 'account', 'validation'])('uses a new key after changing %s', async (change) => {
    mockedPaymentApi.createCheckout.mockRejectedValue(change === 'validation'
      ? new AxiosError('Expired session', undefined, undefined, undefined, { status: 400 } as never)
      : new Error('Response lost'))
    const { result } = renderHook(() => useCheckoutForm())

    await act(async () => { await result.current.handleSubmit(mockSubmitEvent()) })

    act(() => {
      if (change === 'recipient') {
        result.current.updateField('recipientName')({ target: { value: 'New name' } } as never)
      } else if (change === 'cart') {
        useCartStore.setState({ tempItems: useCartStore.getState().tempItems.map(
          item => ({ ...item, productQuantity: 2 }),
        ) })
      } else if (change === 'account') {
        useAuthStore.getState().setAuthenticated({
          ...useAuthStore.getState().userData!, id: 'u2', email: 'other@example.com',
        })
      }
    })
    await act(async () => { await result.current.handleSubmit(mockSubmitEvent()) })

    expect(mockedPaymentApi.createCheckout).toHaveBeenCalledTimes(2)
    expect(mockedPaymentApi.createCheckout.mock.calls[1][1]).not.toBe(
      mockedPaymentApi.createCheckout.mock.calls[0][1],
    )
  })
})
