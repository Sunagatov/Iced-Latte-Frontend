import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createCorsResponse, handleOptions } from '@/shared/utils/corsUtils'
import { getApiBaseUrl, type ProxyMethod } from './proxyConstants'
import {
  fetchWithTimeout,
  forwardHeaders,
  readProxyBody,
  sanitizePath,
  sanitizeQueryString,
} from './proxyRequest'
import { refreshAuthHeaderIfNeeded } from './proxyAuth'
import { createProxyResponse } from './proxyResponse'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

async function handleProxy(
  request: NextRequest,
  method: ProxyMethod,
  path: string[],
) {
  const safePath = sanitizePath(path)

  if (!safePath) return createCorsResponse({ error: 'Invalid path' }, 400)

  const apiBaseUrl = getApiBaseUrl()

  if (!apiBaseUrl) {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }

  const url = new URL(request.url)
  const apiUrl = `${apiBaseUrl}/${safePath}${sanitizeQueryString(url.searchParams)}`
  const body = await readProxyBody(request, method)

  if (body instanceof NextResponse) return body

  const headers = forwardHeaders(request, safePath) as Record<string, string>
  const refreshedTokens = await refreshAuthHeaderIfNeeded(
    request,
    safePath,
    headers,
  )

  try {
    const response = await fetchWithTimeout(apiUrl, { method, headers, body })

    return createProxyResponse(response, safePath, refreshedTokens)
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
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
