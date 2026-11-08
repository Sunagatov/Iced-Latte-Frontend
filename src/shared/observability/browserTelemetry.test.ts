import { observeRequests, sanitizeTelemetry } from './browserTelemetry'
import type { TransportItem } from '@grafana/faro-web-sdk'

const sanitize = (input: unknown) => sanitizeTelemetry(input as TransportItem)

describe('browser telemetry privacy', () => {
  it('keeps code locations without error text, URLs with queries, user or session data', () => {
    const result = sanitize({
      type: 'exception',
      meta: {
        app: { name: 'test' },
        user: { email: 'private@example.com' },
        page: { url: 'https://site/?token=secret' },
      },
      payload: {
        timestamp: '2026-11-08T00:00:00Z',
        type: 'TypeError',
        value: 'password=secret',
        context: { input: 'private' },
        stacktrace: {
          frames: [
            {
              filename: 'https://site/assets/app.js?token=secret',
              function: 'private',
              lineno: 12,
            },
            {
              filename: 'https://site/users/private@example.com',
              function: 'private',
            },
          ],
        },
      },
    })

    expect(result).toMatchObject({
      payload: {
        type: 'TypeError',
        stacktrace: {
          frames: [{ filename: 'https://site/assets/app.js', lineno: 12 }],
        },
      },
    })
    expect(JSON.stringify(result)).not.toMatch(/secret|private|email|password/)
  })

  it('only accepts finite known performance measurements', () => {
    const result = sanitize({
      type: 'measurement',
      meta: {},
      payload: {
        type: 'http',
        timestamp: 'now',
        values: { status: 503, duration_ms: 50, input: 123, lcp: Infinity },
        context: { token: 'secret' },
      },
    })

    expect(result?.payload).toEqual({
      type: 'http',
      timestamp: 'now',
      values: { status: 503, duration_ms: 50 },
    })
    expect(
      sanitize({ type: 'log', meta: {}, payload: { message: 'private' } }),
    ).toBeNull()
  })
})

describe('request observation', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    cleanup?.()
    cleanup = undefined
    jest.restoreAllMocks()
  })

  it('preserves the response and does not report its own collector request', async () => {
    const response = { status: 503 } as Response

    jest.spyOn(window, 'fetch').mockResolvedValue(response)
    const report = jest.fn()

    cleanup = observeRequests(report, 'https://monitor/collect')
    expect(await window.fetch('/api/private?token=secret')).toBe(response)
    expect(report).toHaveBeenCalledWith(503, expect.any(Number))
    await window.fetch('https://monitor/collect')
    expect(report).toHaveBeenCalledTimes(1)
  })

  it('preserves network failures even when reporting fails, and ignores cancelled requests', async () => {
    const failure = new TypeError('network down')
    const fetch = jest.spyOn(window, 'fetch').mockRejectedValue(failure)
    const report = jest.fn(() => {
      throw new Error('monitor unavailable')
    })

    cleanup = observeRequests(report, 'https://monitor/collect')
    await expect(window.fetch('/api')).rejects.toBe(failure)
    fetch.mockRejectedValue(new DOMException('cancelled', 'AbortError'))
    await expect(window.fetch('/api')).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(report).toHaveBeenCalledTimes(1)
  })

  it('observes repeated XHR requests once each without recording their contents', () => {
    jest.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(function(
      this: XMLHttpRequest,
    ) {
      this.dispatchEvent(new Event('loadend'))
    })
    const report = jest.fn()

    cleanup = observeRequests(report, 'https://monitor/collect')
    const xhr = new XMLHttpRequest()

    Object.defineProperty(xhr, 'status', { value: 500 })
    xhr.send('private')
    xhr.send('private')
    expect(report).toHaveBeenCalledTimes(2)
    expect(report).toHaveBeenLastCalledWith(500, expect.any(Number))
  })
})
