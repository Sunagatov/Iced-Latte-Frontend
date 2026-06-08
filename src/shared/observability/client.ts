import {
  CLIENT_OBSERVABILITY_ENABLED,
  CLIENT_OBSERVABILITY_ENDPOINT,
  WEB_VITALS_SAMPLE_RATE,
} from '@/shared/config/observabilityClient'
import { generateTraceId, getSessionId } from '@/shared/auth/sessionTracing'

export type BrowserObservabilityEvent =
  | {
      type: 'browser-error'
      message: string
      stack?: string
      filename?: string
      lineno?: number
      colno?: number
    }
  | {
      type: 'unhandled-rejection'
      message: string
      stack?: string
    }
  | {
      type: 'web-vital'
      name: string
      id: string
      value: number
      delta: number
      rating: 'good' | 'needs-improvement' | 'poor'
      navigationType: string
    }

export type ObservabilityEnvelope = BrowserObservabilityEvent & {
  service: string
  timestamp: string
  route: string
  sessionId: string
  traceId: string
  userAgent: string
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined'
}

function shouldSample(sampleRate: number): boolean {
  if (sampleRate >= 1) return true
  if (sampleRate <= 0) return false

  return Math.random() < sampleRate
}

function currentRoute(): string {
  return window.location.pathname || '/'
}

function stackFor(value: unknown): string | undefined {
  return value instanceof Error ? value.stack : undefined
}

export function messageForUnknown(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value

  return 'Unknown browser error'
}

export function reportObservabilityEvent(
  event: BrowserObservabilityEvent,
  options: { sampleRate?: number } = {},
): void {
  if (!CLIENT_OBSERVABILITY_ENABLED || !isBrowser()) return
  if (!shouldSample(options.sampleRate ?? 1)) return

  const envelope: ObservabilityEnvelope = {
    ...event,
    service: 'iced-latte-frontend',
    timestamp: new Date().toISOString(),
    route: currentRoute(),
    sessionId: getSessionId(),
    traceId: generateTraceId(),
    userAgent: navigator.userAgent,
  }

  const body = JSON.stringify(envelope)

  if (navigator.sendBeacon) {
    navigator.sendBeacon(CLIENT_OBSERVABILITY_ENDPOINT, body)

    return
  }

  void fetch(CLIENT_OBSERVABILITY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined)
}

export function reportBrowserError(event: ErrorEvent): void {
  reportObservabilityEvent({
    type: 'browser-error',
    message:
      event.error == null && event.message
        ? event.message
        : messageForUnknown(event.error),
    stack: stackFor(event.error),
    filename: event.filename || undefined,
    lineno: event.lineno || undefined,
    colno: event.colno || undefined,
  })
}

export function reportUnhandledRejection(event: PromiseRejectionEvent): void {
  reportObservabilityEvent({
    type: 'unhandled-rejection',
    message: messageForUnknown(event.reason),
    stack: stackFor(event.reason),
  })
}

export function reportWebVital(metric: {
  name: string
  id: string
  value: number
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType: string
}): void {
  reportObservabilityEvent(
    {
      type: 'web-vital',
      name: metric.name,
      id: metric.id,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      navigationType: metric.navigationType,
    },
    { sampleRate: WEB_VITALS_SAMPLE_RATE },
  )
}
