import type { ErrorEvent } from '@sentry/core'

const SENSITIVE_REQUEST_HEADERS = new Set(['authorization', 'cookie'])

export function parseTelemetrySampleRate(value: string | undefined): number {
  if (!value) return 0

  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0
}

export function cleanSentryDsn(value: string | undefined): string | undefined {
  const trimmed = value?.trim()

  return trimmed || undefined
}

export function sanitizeSentryEvent(event: ErrorEvent): ErrorEvent {
  const headers = event.request?.headers

  if (!headers) return event

  for (const header of Object.keys(headers)) {
    if (SENSITIVE_REQUEST_HEADERS.has(header.toLowerCase())) {
      delete headers[header]
    }
  }

  return event
}
