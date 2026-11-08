import type {
  BeforeSendHook,
  ExceptionEvent,
  MeasurementEvent,
} from '@grafana/faro-web-sdk'

const errorTypes = new Set([
  'Error',
  'TypeError',
  'ReferenceError',
  'RangeError',
  'SyntaxError',
  'URIError',
])
const measurements = new Set([
  'lcp',
  'cls',
  'inp',
  'ttfb',
  'fcp',
  'duration_ms',
  'status',
])

// Rebuild the payload rather than trying to redact arbitrary user-supplied text.
export const sanitizeTelemetry: BeforeSendHook = (item) => {
  const meta = { app: item.meta.app }

  if (item.type === 'exception') {
    const source = item.payload as ExceptionEvent
    const type = errorTypes.has(source.type) ? source.type : 'Error'
    const frames = source.stacktrace?.frames
      .flatMap((frame) => {
        try {
          const url = new URL(frame.filename)

          if (
            !['https:', 'http:'].includes(url.protocol) ||
            !/\.(m?js)$/.test(url.pathname)
          )
            return []

          return [
            {
              filename: url.origin + url.pathname,
              function: '<script>',
              lineno: frame.lineno,
              colno: frame.colno,
            },
          ]
        } catch {
          return []
        }
      })
      .slice(0, 12)

    return {
      ...item,
      meta,
      payload: {
        timestamp: source.timestamp,
        type,
        value: `${type} (message omitted)`,
        stacktrace: { frames: frames ?? [] },
      },
    }
  }
  if (item.type === 'measurement') {
    const source = item.payload as MeasurementEvent

    if (!['web-vitals', 'http'].includes(source.type)) return null
    const values = Object.fromEntries(
      Object.entries(source.values).filter(
        ([key, value]) =>
          measurements.has(key.toLowerCase()) && Number.isFinite(value),
      ),
    )

    if (!Object.keys(values).length) return null

    return {
      ...item,
      meta,
      payload: { timestamp: source.timestamp, type: source.type, values },
    }
  }

  return null
}

type RequestReporter = (status: number, duration: number) => void

// Observe outcomes only: never URLs, headers, bodies, response text or cookies.
export function observeRequests(
  report: RequestReporter,
  collector: string,
): () => void {
  const originalFetch = window.fetch
  const originalSend = XMLHttpRequest.prototype.send
  const emit = (status: number, start: number) => {
    if (status === 0 || status >= 400 || performance.now() - start >= 2000) {
      try {
        report(status, performance.now() - start)
      } catch {
        /* Telemetry cannot affect a request. */
      }
    }
  }
  const observedFetch: typeof fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url

    if (url === collector) return originalFetch.call(window, input, init)
    const start = performance.now()

    try {
      const response = await originalFetch.call(window, input, init)

      if (!['opaque', 'opaqueredirect'].includes(response.type)) emit(response.status, start)

      return response
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError'))
        emit(0, start)
      throw error
    }
  }
  const observedSend: typeof originalSend = function(
    this: XMLHttpRequest,
    body,
  ) {
    const start = performance.now()
    let aborted = false
    const onAbort = () => {
      aborted = true
    }
    const onEnd = () => {
      this.removeEventListener('abort', onAbort)
      if (!aborted) emit(this.status, start)
    }

    this.addEventListener('abort', onAbort, { once: true })
    this.addEventListener('loadend', onEnd, { once: true })
    try {
      return originalSend.call(this, body)
    } catch (error) {
      this.removeEventListener('abort', onAbort)
      this.removeEventListener('loadend', onEnd)
      throw error
    }
  }

  window.fetch = observedFetch
  XMLHttpRequest.prototype.send = observedSend

  return () => {
    if (window.fetch === observedFetch) window.fetch = originalFetch
    if (XMLHttpRequest.prototype.send === observedSend)
      XMLHttpRequest.prototype.send = originalSend
  }
}

let started = false

export async function startBrowserTelemetry(
  url: string | undefined,
  app: string,
): Promise<void> {
  if (!url || started || typeof window === 'undefined') return
  try {
    const endpoint = new URL(url)

    if (endpoint.protocol !== 'https:') return
    started = true
    const { initializeFaro, ErrorsInstrumentation, WebVitalsInstrumentation } =
      await import('@grafana/faro-web-sdk')
    let remaining = 60
    let resetsAt = Date.now() + 60_000
    const faro = initializeFaro({
      url: endpoint.href,
      app: { name: app, environment: 'production' },
      metas: [{ app: { name: app, environment: 'production' } }],
      sessionTracking: { enabled: false },
      instrumentations: [
        new ErrorsInstrumentation(),
        new WebVitalsInstrumentation(),
      ],
      preventGlobalExposure: true,
      batching: { enabled: true, itemLimit: 10, sendTimeout: 5000 },
      beforeSend: (item) => {
        if (Date.now() >= resetsAt) {
          remaining = 60
          resetsAt = Date.now() + 60_000
        }

        return remaining-- > 0 ? sanitizeTelemetry(item) : null
      },
    })

    if (faro)
      observeRequests(
        (status, duration) =>
          faro.api.pushMeasurement({
            type: 'http',
            values: { status, duration_ms: duration },
          }),
        endpoint.href,
      )
  } catch {
    /* Monitoring is optional and must not prevent startup. */
  }
}
