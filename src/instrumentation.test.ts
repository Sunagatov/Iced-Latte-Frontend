/**
 * @jest-environment node
 */

jest.mock('@vercel/otel', () => ({
  registerOTel: jest.fn(),
}))

jest.mock('@sentry/nextjs', () => ({
  captureRequestError: jest.fn(),
}))

describe('Next.js instrumentation', () => {
  const originalLogEvents = process.env.OBSERVABILITY_LOG_EVENTS

  afterEach(() => {
    if (originalLogEvents === undefined) {
      delete process.env.OBSERVABILITY_LOG_EVENTS
    } else {
      process.env.OBSERVABILITY_LOG_EVENTS = originalLogEvents
    }
    jest.resetModules()
    jest.restoreAllMocks()
  })

  it('logs request errors without query strings', async () => {
    process.env.OBSERVABILITY_LOG_EVENTS = 'true'
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const { onRequestError } = await import('./instrumentation')

    await onRequestError(
      new Error('render failed'),
      {
        method: 'GET',
        path: '/checkout?token=secret',
        headers: {},
      },
      {
        routerKind: 'App Router',
        routePath: '/checkout',
        routeType: 'render',
        revalidateReason: undefined,
      },
    )

    expect(error).toHaveBeenCalledWith(
      'next_request_error',
      expect.objectContaining({
        message: 'render failed',
        path: '/checkout',
      }),
    )
    expect(JSON.stringify(error.mock.calls)).not.toContain('token=secret')
  })

  it('captures request errors in Sentry when local log mirroring is disabled', async () => {
    delete process.env.OBSERVABILITY_LOG_EVENTS
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const { captureRequestError } = await import('@sentry/nextjs')
    const { onRequestError } = await import('./instrumentation')
    const request = {
      method: 'GET',
      path: '/checkout',
      headers: {},
    }
    const context = {
      routerKind: 'App Router' as const,
      routePath: '/checkout',
      routeType: 'render' as const,
      revalidateReason: undefined,
    }
    const requestError = new Error('render failed')

    await onRequestError(requestError, request, context)

    expect(error).not.toHaveBeenCalled()
    expect(captureRequestError).toHaveBeenCalledWith(
      requestError,
      request,
      context,
    )
  })
})
