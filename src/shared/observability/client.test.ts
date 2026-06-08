import {
  messageForUnknown,
  reportObservabilityEvent,
} from '@/shared/observability/client'

jest.mock('@/shared/config/observabilityClient', () => ({
  CLIENT_OBSERVABILITY_ENABLED: true,
  CLIENT_OBSERVABILITY_ENDPOINT: '/api/observability/events',
  WEB_VITALS_SAMPLE_RATE: 1,
}))

jest.mock('@/shared/auth/sessionTracing', () => ({
  getSessionId: () => 'session-id',
  generateTraceId: () => 'trace-id',
}))

describe('client observability', () => {
  const originalSendBeacon = navigator.sendBeacon

  beforeEach(() => {
    window.history.pushState({}, '', '/checkout?token=secret')
    Object.defineProperty(navigator, 'userAgent', {
      value: 'jest-browser',
      configurable: true,
    })
    Object.defineProperty(navigator, 'sendBeacon', {
      value: jest.fn(() => true),
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      configurable: true,
    })
    jest.restoreAllMocks()
  })

  it('sends sanitized browser telemetry without query strings', () => {
    reportObservabilityEvent({
      type: 'browser-error',
      message: 'checkout failed',
    })

    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1)
    const [, rawBody] = jest.mocked(navigator.sendBeacon).mock.calls[0]
    const body = JSON.parse(String(rawBody))

    expect(body).toEqual(
      expect.objectContaining({
        type: 'browser-error',
        message: 'checkout failed',
        route: '/checkout',
        sessionId: 'session-id',
        traceId: 'trace-id',
        userAgent: 'jest-browser',
      }),
    )
    expect(JSON.stringify(body)).not.toContain('token=secret')
  })

  it('respects sampling', () => {
    reportObservabilityEvent(
      {
        type: 'web-vital',
        name: 'LCP',
        id: 'metric-id',
        value: 123,
        delta: 123,
        rating: 'good',
        navigationType: 'navigate',
      },
      { sampleRate: 0 },
    )

    expect(navigator.sendBeacon).not.toHaveBeenCalled()
  })

  it('normalizes unknown error messages', () => {
    expect(messageForUnknown(new Error('boom'))).toBe('boom')
    expect(messageForUnknown('plain')).toBe('plain')
    expect(messageForUnknown({ nested: true })).toBe('Unknown browser error')
  })
})
