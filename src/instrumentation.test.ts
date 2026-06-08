/**
 * @jest-environment node
 */

jest.mock('@vercel/otel', () => ({
  registerOTel: jest.fn(),
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
})
