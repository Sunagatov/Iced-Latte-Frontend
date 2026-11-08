import type { ErrorEvent } from '@sentry/core'

// Sentry 11 collects more data by default; preserve the previous restricted baseline.
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
    response: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
  },
  httpBodies: [],
  urlQueryParams: {
    deny: [
      'forwarded',
      '-ip',
      'remote-',
      'via',
      '-user',
      'token',
      'code',
      'oauthCode',
      'codeChallenge',
    ],
  },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
}

const SENSITIVE_REQUEST_HEADERS = new Set(['authorization', 'cookie', 'x-oauth-verifier'])

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
