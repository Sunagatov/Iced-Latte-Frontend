import { NextRequest, NextResponse } from 'next/server'
import { OBSERVABILITY_LOG_EVENTS } from '@/shared/config/observabilityServer'

const MAX_EVENT_BYTES = 64 * 1024
const ALLOWED_EVENT_TYPES = new Set([
  'browser-error',
  'unhandled-rejection',
  'web-vital',
])
const MAX_STRING_LENGTH = 4096

type NormalizedTelemetryEvent = {
  type: string
  timestamp: string
  route: string
  sessionId: string
  traceId: string
  service?: string
  userAgent?: string
  message?: string
  stack?: string
  filename?: string
  lineno?: number
  colno?: number
  name?: string
  id?: string
  value?: number
  delta?: number
  rating?: string
  navigationType?: string
}

function noStoreResponse(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function hasValidDeclaredLength(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length')

  if (!contentLength) return true

  const parsed = Number(contentLength)

  return (
    Number.isFinite(parsed) &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed <= MAX_EVENT_BYTES
  )
}

function boundedString(
  value: unknown,
  maxLength = MAX_STRING_LENGTH,
): string | undefined {
  return typeof value === 'string' && value.length <= maxLength
    ? value
    : undefined
}

function boundedNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function normalizeTelemetryEvent(
  value: unknown,
): NormalizedTelemetryEvent | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  const event = value as Record<string, unknown>
  const route = event['route']
  const sessionId = event['sessionId']
  const traceId = event['traceId']
  const type = event['type']
  const timestamp = event['timestamp']

  if (
    typeof type !== 'string' ||
    !ALLOWED_EVENT_TYPES.has(type) ||
    typeof timestamp !== 'string' ||
    typeof route !== 'string' ||
    !route.startsWith('/') ||
    route.includes('?') ||
    route.length > 256 ||
    typeof sessionId !== 'string' ||
    sessionId.length > 128 ||
    typeof traceId !== 'string' ||
    traceId.length > 128
  ) {
    return null
  }

  return {
    type,
    timestamp,
    route,
    sessionId,
    traceId,
    service: boundedString(event['service'], 128),
    userAgent: boundedString(event['userAgent'], 512),
    message: boundedString(event['message']),
    stack: boundedString(event['stack']),
    filename: boundedString(event['filename'], 512),
    lineno: boundedNumber(event['lineno']),
    colno: boundedNumber(event['colno']),
    name: boundedString(event['name'], 64),
    id: boundedString(event['id'], 128),
    value: boundedNumber(event['value']),
    delta: boundedNumber(event['delta']),
    rating: boundedString(event['rating'], 32),
    navigationType: boundedString(event['navigationType'], 64),
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasValidDeclaredLength(request)) {
    return noStoreResponse({ error: 'Observability event too large' }, 413)
  }

  let rawBody: string

  try {
    rawBody = await request.text()
  } catch {
    return noStoreResponse({ error: 'Invalid observability event' }, 400)
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_EVENT_BYTES) {
    return noStoreResponse({ error: 'Observability event too large' }, 413)
  }

  let parsedEvent: unknown

  try {
    parsedEvent = JSON.parse(rawBody) as unknown
  } catch {
    return noStoreResponse({ error: 'Invalid observability event' }, 400)
  }

  const event = normalizeTelemetryEvent(parsedEvent)

  if (!event) {
    return noStoreResponse({ error: 'Invalid observability event' }, 400)
  }

  if (OBSERVABILITY_LOG_EVENTS) {
    console.info('browser_observability_event', event)
  }

  return new NextResponse(null, {
    status: 202,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
