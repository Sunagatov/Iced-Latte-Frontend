/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

function makeRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost/api/observability/events', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  })
}

describe('observability events route', () => {
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

  it('accepts valid browser observability events', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      makeRequest({
        type: 'web-vital',
        timestamp: '2026-06-08T12:00:00.000Z',
        route: '/checkout',
        sessionId: 'session-id',
        traceId: 'trace-id',
        name: 'LCP',
        value: 100,
      }),
    )

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('')
  })

  it('rejects invalid payloads', async () => {
    const { POST } = await import('./route')
    const response = await POST(makeRequest({ type: 'unknown' }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Invalid observability event',
    })
  })

  it('rejects routes that include query strings', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      makeRequest({
        type: 'browser-error',
        timestamp: '2026-06-08T12:00:00.000Z',
        route: '/checkout?token=secret',
        sessionId: 'session-id',
        traceId: 'trace-id',
        message: 'checkout failed',
      }),
    )

    expect(response.status).toBe(400)
  })

  it('rejects oversized declared payloads before reading JSON', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      makeRequest(
        {
          type: 'web-vital',
          timestamp: '2026-06-08T12:00:00.000Z',
          route: '/checkout',
          sessionId: 'session-id',
          traceId: 'trace-id',
        },
        { 'content-length': String(64 * 1024 + 1) },
      ),
    )

    expect(response.status).toBe(413)
    expect(await response.json()).toEqual({
      error: 'Observability event too large',
    })
  })

  it('rejects oversized payloads when content length is missing', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      makeRequest({
        type: 'browser-error',
        timestamp: '2026-06-08T12:00:00.000Z',
        route: '/checkout',
        sessionId: 'session-id',
        traceId: 'trace-id',
        message: 'x'.repeat(64 * 1024),
      }),
    )

    expect(response.status).toBe(413)
    expect(await response.json()).toEqual({
      error: 'Observability event too large',
    })
  })

  it('logs only normalized allowlisted fields', async () => {
    process.env.OBSERVABILITY_LOG_EVENTS = 'true'
    const info = jest.spyOn(console, 'info').mockImplementation(() => undefined)
    const { POST } = await import('./route')

    const response = await POST(
      makeRequest({
        type: 'browser-error',
        timestamp: '2026-06-08T12:00:00.000Z',
        route: '/checkout',
        sessionId: 'session-id',
        traceId: 'trace-id',
        message: 'checkout failed',
        secret: 'must-not-log',
      }),
    )

    expect(response.status).toBe(202)
    expect(info).toHaveBeenCalledWith(
      'browser_observability_event',
      expect.not.objectContaining({ secret: 'must-not-log' }),
    )
  })
})
