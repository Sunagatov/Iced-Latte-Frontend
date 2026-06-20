import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createCorsResponse } from '@/shared/utils/corsUtils'
import { isTokenExpired } from '@/shared/auth/token'
import { COOKIE_NAMES } from '@/shared/auth/cookieNames'
import {
  ALLOWED_PATH_RE,
  ALLOWED_QUERY_PARAM_RE,
  FETCH_TIMEOUT_MS,
  FORWARDED_HEADERS,
  MAX_PROXY_BODY_BYTES,
  REQUEST_BODY_TOO_LARGE,
  type ProxyMethod,
} from './proxyConstants'

export function sanitizePath(segments: string[]): string | null {
  const joined = segments.join('/')

  return ALLOWED_PATH_RE.test(joined) ? joined : null
}

export function sanitizeQueryString(params: URLSearchParams): string {
  const safe = new URLSearchParams()

  for (const [key, value] of params.entries()) {
    if (
      ALLOWED_QUERY_PARAM_RE.test(key) &&
      ALLOWED_QUERY_PARAM_RE.test(value)
    ) {
      safe.append(key, value)
    }
  }

  const qs = safe.toString()

  return qs ? `?${qs}` : ''
}

export function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  )
}

export function forwardHeaders(
  request: NextRequest,
  path: string,
): HeadersInit {
  const headers: Record<string, string> = {}
  const contentType = request.headers.get('Content-Type')

  if (contentType) headers['Content-Type'] = contentType

  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)

    if (value) headers[name] = value
  }

  const accessToken = request.cookies.get(COOKIE_NAMES.access)?.value
  const refreshToken = request.cookies.get(COOKIE_NAMES.refresh)?.value

  if (path === 'auth/refresh') {
    if (refreshToken && !isTokenExpired(refreshToken)) {
      headers['Authorization'] = `Bearer ${refreshToken}`
    }

    return headers
  }

  if (accessToken && !isTokenExpired(accessToken)) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  if (path === 'auth/logout' && refreshToken) {
    headers['X-Refresh-Token'] = refreshToken
  }

  return headers
}

async function readBody(
  request: NextRequest,
): Promise<BodyInit | undefined | typeof REQUEST_BODY_TOO_LARGE> {
  const contentLength = request.headers.get('content-length')
  const declaredLength = contentLength ? Number(contentLength) : 0

  if (
    contentLength &&
    (!Number.isFinite(declaredLength) ||
      !Number.isInteger(declaredLength) ||
      declaredLength < 0 ||
      declaredLength > MAX_PROXY_BODY_BYTES)
  ) {
    return REQUEST_BODY_TOO_LARGE
  }

  try {
    if (!request.body) return undefined

    const reader = request.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      total += value.byteLength

      if (total > MAX_PROXY_BODY_BYTES) {
        await reader.cancel()

        return REQUEST_BODY_TOO_LARGE
      }

      chunks.push(value)
    }

    if (total === 0) return undefined

    const body = new Uint8Array(total)
    let offset = 0

    for (const chunk of chunks) {
      body.set(chunk, offset)
      offset += chunk.byteLength
    }

    return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)
  } catch {
    return undefined
  }
}

export async function readProxyBody(
  request: NextRequest,
  method: ProxyMethod,
  requestOrigin?: string,
): Promise<BodyInit | undefined | NextResponse> {
  if (method === 'GET') return undefined

  const body = await readBody(request)

  if (body === REQUEST_BODY_TOO_LARGE) {
    return createCorsResponse(
      { error: 'Request body too large' },
      413,
      requestOrigin,
    )
  }

  return body
}
