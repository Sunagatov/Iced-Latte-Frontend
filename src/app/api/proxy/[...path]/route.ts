import type { NextRequest } from 'next/server'
import { COOKIE_NAMES } from '@/shared/auth/cookieNames'
import { isTokenExpired } from '@/shared/auth/token'
import { NextResponse } from 'next/server'
import { createCorsResponse, handleOptions } from '@/shared/utils/corsUtils'
import { getAllowedFrontendOrigins } from '@/shared/config/frontendOrigins'
import {
  getApiBaseUrl,
  type ProxyMethod,
} from './proxyConstants'
import {
  fetchWithTimeout,
  forwardHeaders,
  readProxyBody,
  sanitizePath,
  sanitizeQueryString,
} from './proxyRequest'
import { refreshAuthHeaderIfNeeded, rotateRefreshToken } from './proxyAuth'
import { createProxyResponse } from './proxyResponse'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

const MUTATING_METHODS = new Set<ProxyMethod>(['POST', 'PUT', 'PATCH', 'DELETE'])

function extractRequestOrigin(request: NextRequest): string | undefined {
  const rawOrigin =
    request.headers.get('origin') || request.headers.get('referer')

  if (!rawOrigin) return undefined

  try {
    return new URL(rawOrigin).origin
  } catch {
    return undefined
  }
}

function hasAllowedOrigin(request: NextRequest, method: ProxyMethod): boolean {
  if (!MUTATING_METHODS.has(method)) {
    return true
  }

  const requestOrigin = extractRequestOrigin(request)

  if (!requestOrigin) {
    return false
  }

  return getAllowedFrontendOrigins().includes(requestOrigin)
}

async function handleProxy(
  request: NextRequest,
  method: ProxyMethod,
  path: string[],
) {
  const requestOrigin = extractRequestOrigin(request)
  const safePath = sanitizePath(path)

  if (!safePath) {
    return createCorsResponse({ error: 'Invalid path' }, 400, requestOrigin)
  }

  const apiBaseUrl = getApiBaseUrl()

  if (!apiBaseUrl) {
    return createCorsResponse({ error: 'API unavailable' }, 503, requestOrigin)
  }

  if (!hasAllowedOrigin(request, method)) {
    return createCorsResponse(
      { error: 'Invalid request origin' },
      403,
      requestOrigin,
    )
  }

  if (safePath === 'auth/refresh') {
    const refreshToken = request.cookies.get(COOKIE_NAMES.refresh)?.value

    if (refreshToken && !isTokenExpired(refreshToken)) {
      const refreshedTokens = await rotateRefreshToken(refreshToken)

      if (refreshedTokens) {
        return createProxyResponse(
          new Response(JSON.stringify(refreshedTokens), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
          safePath,
          null,
        )
      }
    }
  }

  const url = new URL(request.url)
  const apiUrl = `${apiBaseUrl}/${safePath}${sanitizeQueryString(url.searchParams)}`
  const body = await readProxyBody(request, method, requestOrigin)

  if (body instanceof NextResponse) return body

  const headers = forwardHeaders(request, safePath) as Record<string, string>
  const refreshedTokens = await refreshAuthHeaderIfNeeded(
    request,
    safePath,
    headers,
  )

  try {
    const response = await fetchWithTimeout(apiUrl, { method, headers, body })

    return createProxyResponse(
      response,
      safePath,
      refreshedTokens,
      requestOrigin,
    )
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503, requestOrigin)
  }
}

export function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params

  return handleProxy(request, 'GET', path)
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { path } = await params

  return handleProxy(request, 'POST', path)
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { path } = await params

  return handleProxy(request, 'PUT', path)
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { path } = await params

  return handleProxy(request, 'PATCH', path)
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { path } = await params

  return handleProxy(request, 'DELETE', path)
}
