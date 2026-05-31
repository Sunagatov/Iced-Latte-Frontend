import { AxiosError, type InternalAxiosRequestConfig } from 'axios'

describe('payment config', () => {
  const originalEnv = process.env

  function makeAxiosError(status: number, data: unknown): AxiosError {
    return new AxiosError(
      'Request failed',
      undefined,
      {} as InternalAxiosRequestConfig,
      undefined,
      {
        status,
        statusText: 'Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        data,
      },
    )
  }

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it('hostedCheckoutEnabled is true when NEXT_PUBLIC_STRIPE_ENABLED=true', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'true' }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(true)
  })

  it('hostedCheckoutEnabled is false when NEXT_PUBLIC_STRIPE_ENABLED=false', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'false' }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(false)
  })

  it('hostedCheckoutEnabled is false when NEXT_PUBLIC_STRIPE_ENABLED is missing', async () => {
    const { NEXT_PUBLIC_STRIPE_ENABLED: _, ...envWithout } = originalEnv

    process.env = { ...envWithout, NODE_ENV: 'development' }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(false)
  })

  it('hostedCheckoutEnabled is false in production when NEXT_PUBLIC_STRIPE_ENABLED is missing', async () => {
    const { NEXT_PUBLIC_STRIPE_ENABLED: _, ...envWithout } = originalEnv

    process.env = { ...envWithout, NODE_ENV: 'production' }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(false)
  })

  it('hostedCheckoutEnabled is false in production when NEXT_PUBLIC_STRIPE_ENABLED=false', async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      NEXT_PUBLIC_STRIPE_ENABLED: 'false',
    }
    const { hostedCheckoutEnabled } = await import('@/features/payment/config')

    expect(hostedCheckoutEnabled).toBe(false)
  })

  it('getCheckoutUnavailableMessage returns disabled message when checkout is off', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'false' }
    const { getCheckoutUnavailableMessage } = await import('@/features/payment/config')

    expect(getCheckoutUnavailableMessage()).toContain('unavailable')
  })

  it('getCheckoutErrorMessage does not expose raw backend detail when checkout fails', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'true' }
    const { getCheckoutErrorMessage } = await import('@/features/payment/config')

    expect(getCheckoutErrorMessage(makeAxiosError(400, {
      detail: 'Either deliveryAddressId or address must be provided.',
    }))).toBe('Something went wrong. Please try again.')
  })

  it('getCheckoutErrorMessage returns a safe unavailable message on 404', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'true' }
    const { getCheckoutErrorMessage } = await import('@/features/payment/config')

    expect(getCheckoutErrorMessage(makeAxiosError(404, {
      detail: 'No resource found for POST /api/v1/payment/checkout',
    }))).toBe('Checkout is currently unavailable. Please try again later.')
  })

  it('getCheckoutErrorMessage surfaces validation field messages', async () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_STRIPE_ENABLED: 'true' }
    const { getCheckoutErrorMessage } = await import('@/features/payment/config')

    expect(getCheckoutErrorMessage(makeAxiosError(400, {
      errors: [
        { field: 'recipientName', message: 'must be between 2 and 128 characters' },
      ],
    }))).toBe('must be between 2 and 128 characters')
  })
})
