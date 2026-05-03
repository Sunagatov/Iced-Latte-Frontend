import { NextRequest, NextResponse } from 'next/server'
import { createCorsResponse, handleOptions } from '@/shared/utils/corsUtils'
import { isTokenExpired } from '@/shared/auth/token'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
const FETCH_TIMEOUT_MS = 30000

const ALLOWED_PATH_RE = /^[a-zA-Z0-9/_-]+$/
const ALLOWED_QUERY_PARAM_RE = /^[a-zA-Z0-9_.~:@!$&'()*+,;=%[\]-]*$/
const FORWARDED_HEADERS = ['X-Session-ID', 'X-Trace-ID', 'X-Correlation-ID', 'Idempotency-Key']
const PROXY_FORWARD_HEADERS: Array<[string, string]> = [
  ['x-forwarded-for', 'X-Forwarded-For'],
  ['x-forwarded-proto', 'X-Forwarded-Proto'],
  ['x-real-ip', 'X-Real-IP'],
]
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
}

type TokenPair = {
  token: string
  refreshToken: string
}

function sanitizePath(segments: string[]): string | null {
  const joined = segments.join('/')

  return ALLOWED_PATH_RE.test(joined) ? joined : null
}

function sanitizeQueryString(params: URLSearchParams): string {
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

function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  )
}

function forwardHeaders(request: NextRequest, path: string): HeadersInit {
  const headers: Record<string, string> = {}
  const contentType = request.headers.get('Content-Type')

  if (contentType) headers['Content-Type'] = contentType

  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)

    if (value) headers[name] = value
  }

  for (const [sourceName, targetName] of PROXY_FORWARD_HEADERS) {
    const value = request.headers.get(sourceName)

    if (value) headers[targetName] = value
  }

  const accessToken = request.cookies.get('token')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

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

async function readBody(request: NextRequest): Promise<BodyInit | undefined> {
  try {
    const arrayBuffer = await request.arrayBuffer()

    return arrayBuffer.byteLength > 0 ? arrayBuffer : undefined
  } catch {
    return undefined
  }
}

function isTokenPair(data: unknown): data is TokenPair {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>

  return typeof d['token'] === 'string' && typeof d['refreshToken'] === 'string'
}

function setAuthCookies(
  response: Response,
  nextResponse: NextResponse,
  data: unknown,
  path: string,
): void {
  if (path !== 'auth/refresh' || !isTokenPair(data)) {
    const setCookie = response.headers.get('set-cookie')

    if (setCookie) nextResponse.headers.set('set-cookie', setCookie)

    return
  }

  nextResponse.headers.append(
    'Set-Cookie',
    `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  )
  nextResponse.headers.append(
    'Set-Cookie',
    `refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  )

  nextResponse.cookies.set('token', data.token, AUTH_COOKIE_OPTIONS)
  nextResponse.cookies.set('refreshToken', data.refreshToken, AUTH_COOKIE_OPTIONS)
}

async function handleProxy(
  request: NextRequest,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string[],
) {
  const safePath = sanitizePath(path)

  if (!safePath) return createCorsResponse({ error: 'Invalid path' }, 400)

  const url = new URL(request.url)
  const apiUrl = `${API_BASE_URL}/${safePath}${sanitizeQueryString(url.searchParams)}`
  const body = method === 'GET' ? undefined : await readBody(request)

  try {
    const response = await fetchWithTimeout(apiUrl, {
      method,
      headers: forwardHeaders(request, safePath),
      body,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const rawBody = await response.text()

    const data: unknown =
      contentType.includes('application/json') && rawBody
        ? (JSON.parse(rawBody) as unknown)
        : rawBody

    if (!response.ok) return createCorsResponse(data, response.status)

    const nextResponse = createCorsResponse(data, response.status)

    setAuthCookies(response, nextResponse, data, safePath)

    return nextResponse
  } catch {
    return createCorsResponse({ error: 'API unavailable' }, 503)
  }
}

export function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params

  return handleProxy(request, 'GET', path)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params

  return handleProxy(request, 'POST', path)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params

  return handleProxy(request, 'PUT', path)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params

  return handleProxy(request, 'PATCH', path)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params

  return handleProxy(request, 'DELETE', path)
}
