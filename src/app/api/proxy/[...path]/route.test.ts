/**
 * @jest-environment node
 */
process.env.NEXT_PUBLIC_API_URL = 'http://backend'
process.env.NEXT_PUBLIC_FRONTEND_URL = 'http://localhost'

import {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  OPTIONS,
} from '@/app/api/proxy/[...path]/route'
import { NextRequest } from 'next/server'

function makeJwt(expOffsetSeconds = 3600): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expOffsetSeconds }),
  ).toString('base64url')

  return `header.${payload}.signature`
}

function makeRequest(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): NextRequest {
  const url = `http://localhost/api/proxy/${path}`

  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers ?? {}),
    },
  })
}

function mockFetch(
  status: number,
  body: unknown,
  contentType = 'application/json',
  extraHeaders?: Record<string, string>,
) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status < 400,
    status,
    headers: {
      get: (h: string) => {
        const normalized = h.toLowerCase()

        if (normalized === 'content-type') return contentType

        return extraHeaders?.[normalized] ?? null
      },
    },
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

describe('proxy route', () => {
  afterEach(() => jest.restoreAllMocks())

  it('OPTIONS returns 200', async () => {
    const res = await OPTIONS(
      new NextRequest('http://localhost/api/proxy/test', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost' },
      }),
    )

    expect(res.status).toBe(200)
  })

  it('GET proxies request and returns data', async () => {
    mockFetch(200, { products: [] })

    const res = await GET(makeRequest('GET', 'products'), {
      params: Promise.resolve({ path: ['products'] }),
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ products: [] })
  })

  it('returns 400 for invalid path characters', async () => {
    const res = await GET(makeRequest('GET', 'bad path!'), {
      params: Promise.resolve({ path: ['bad path!'] }),
    })

    expect(res.status).toBe(400)
  })

  it('returns 503 when fetch throws', async () => {
    ;(global as { fetch: unknown }).fetch = jest
      .fn()
      .mockRejectedValue(new Error('network'))

    const res = await GET(makeRequest('GET', 'products'), {
      params: Promise.resolve({ path: ['products'] }),
    })

    expect(res.status).toBe(503)
  })

  it('returns error status from backend', async () => {
    mockFetch(404, { message: 'Not found' })

    const res = await GET(makeRequest('GET', 'products'), {
      params: Promise.resolve({ path: ['products'] }),
    })

    expect(res.status).toBe(404)
  })

  it('parses application/problem+json as JSON', async () => {
    mockFetch(
      400,
      { type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Validation failed' },
      'application/problem+json',
    )

    const res = await GET(makeRequest('GET', 'products'), {
      params: Promise.resolve({ path: ['products'] }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()

    expect(body.detail).toBe('Validation failed')
    expect(body.type).toBe('about:blank')
  })

  it('POST proxies request', async () => {
    mockFetch(200, { ok: true })

    const res = await POST(
      makeRequest('POST', 'telemetry', { event: 'view' }),
      {
        params: Promise.resolve({ path: ['telemetry'] }),
      },
    )

    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('returns 413 for oversized request bodies before proxying', async () => {
    global.fetch = jest.fn()

    const res = await POST(
      makeRequest('POST', 'telemetry', { event: 'view' }, {
        'content-length': String(5 * 1024 * 1024 + 1),
      }),
      {
        params: Promise.resolve({ path: ['telemetry'] }),
      },
    )

    expect(res.status).toBe(413)
    expect(await res.json()).toEqual({ error: 'Request body too large' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns 413 for invalid declared content lengths', async () => {
    global.fetch = jest.fn()

    const res = await POST(
      makeRequest('POST', 'telemetry', { event: 'view' }, {
        'content-length': '-1',
      }),
      {
        params: Promise.resolve({ path: ['telemetry'] }),
      },
    )

    expect(res.status).toBe(413)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('does not forward browser-supplied proxy identity headers', async () => {
    mockFetch(200, { ok: true })

    const res = await POST(
      makeRequest('POST', 'telemetry', { event: 'view' }, {
        'x-forwarded-for': '203.0.113.10',
        'x-forwarded-proto': 'https',
        'x-real-ip': '203.0.113.11',
      }),
      {
        params: Promise.resolve({ path: ['telemetry'] }),
      },
    )

    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          'X-Forwarded-For': expect.any(String),
          'X-Forwarded-Proto': expect.any(String),
          'X-Real-IP': expect.any(String),
        }),
      }),
    )
  })

  it('does not forward backend Set-Cookie from non-auth-token paths', async () => {
    mockFetch(200, { ok: true }, 'application/json', {
      'set-cookie': 'backendSession=abc; Path=/; HttpOnly',
    })

    const res = await POST(
      makeRequest('POST', 'telemetry', { event: 'view' }),
      {
        params: Promise.resolve({ path: ['telemetry'] }),
      },
    )

    expect(res.status).toBe(200)
    expect(res.headers.getSetCookie()).toEqual([])
  })

  it('preserves backend 201 created responses', async () => {
    mockFetch(201, { id: 'created-id' })

    const res = await POST(
      makeRequest('POST', 'users/addresses', { city: 'London' }),
      {
        params: Promise.resolve({ path: ['users', 'addresses'] }),
      },
    )

    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ id: 'created-id' })
  })

  it('refresh persists rotated auth cookies and redacts token body', async () => {
    mockFetch(200, { token: 'new-access', refreshToken: 'new-refresh' })

    const res = await POST(makeRequest('POST', 'auth/refresh'), {
      params: Promise.resolve({ path: ['auth', 'refresh'] }),
    })

    const setCookie = res.headers.getSetCookie()

    expect(res.status).toBe(200)
    expect(setCookie.some((value) => value.includes('token=new-access'))).toBe(
      true,
    )
    expect(
      setCookie.some((value) => value.includes('refreshToken=new-refresh')),
    ).toBe(true)
    expect(await res.json()).toEqual({ authenticated: true })
  })

  it('oauth token handoff persists auth cookies and does not expose tokens to client', async () => {
    mockFetch(200, { token: 'oauth-access', refreshToken: 'oauth-refresh' })

    const res = await POST(
      makeRequest('POST', 'auth/oauth/token?code=handoff-code'),
      {
        params: Promise.resolve({ path: ['auth', 'oauth', 'token'] }),
      },
    )

    const setCookie = res.headers.getSetCookie()

    expect(res.status).toBe(200)
    expect(setCookie.some((value) => value.includes('token=oauth-access'))).toBe(
      true,
    )
    expect(
      setCookie.some((value) => value.includes('refreshToken=oauth-refresh')),
    ).toBe(true)
    expect(await res.json()).toEqual({ authenticated: true })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/oauth/token?code=handoff-code'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('authenticate persists auth cookies and does not expose tokens to client', async () => {
    mockFetch(200, { token: 'access-token', refreshToken: 'refresh-token' })

    const res = await POST(
      makeRequest('POST', 'auth/authenticate', {
        email: 'olivia@example.com',
        password: 'p@ss1logic11',
      }),
      {
        params: Promise.resolve({ path: ['auth', 'authenticate'] }),
      },
    )

    const setCookie = res.headers.getSetCookie()

    expect(res.status).toBe(200)
    expect(setCookie.some((value) => value.includes('token=access-token'))).toBe(true)
    expect(setCookie.some((value) => value.includes('refreshToken=refresh-token'))).toBe(true)
    expect(await res.json()).toEqual({ authenticated: true })
  })

  it('register persists auth cookies and does not expose tokens to client', async () => {
    mockFetch(200, { token: 'access-token', refreshToken: 'refresh-token' })

    const res = await POST(
      makeRequest('POST', 'auth/register', {
        firstName: 'Olivia',
        lastName: 'Example',
        email: 'olivia@example.com',
        password: 'p@ss1logic11',
      }),
      {
        params: Promise.resolve({ path: ['auth', 'register'] }),
      },
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ authenticated: true })
  })

  it('logout forwards access token as bearer auth and refresh token in X-Refresh-Token', async () => {
    mockFetch(200, {})
    const accessToken = makeJwt()

    const res = await POST(
      makeRequest('POST', 'auth/logout', undefined, {
        cookie: `token=${accessToken}; refreshToken=refresh.jwt.value`,
      }),
      {
        params: Promise.resolve({ path: ['auth', 'logout'] }),
      },
    )

    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'X-Refresh-Token': 'refresh.jwt.value',
        }),
      }),
    )
  })

  it('PUT proxies request', async () => {
    mockFetch(200, { ok: true })

    const res = await PUT(makeRequest('PUT', 'users'), {
      params: Promise.resolve({ path: ['users'] }),
    })

    expect(res.status).toBe(200)
  })

  it('PATCH proxies request', async () => {
    mockFetch(200, { ok: true })

    const res = await PATCH(makeRequest('PATCH', 'users'), {
      params: Promise.resolve({ path: ['users'] }),
    })

    expect(res.status).toBe(200)
  })

  it('DELETE proxies request', async () => {
    mockFetch(200, {})

    const res = await DELETE(makeRequest('DELETE', 'cart/1'), {
      params: Promise.resolve({ path: ['cart', '1'] }),
    })

    expect(res.status).toBe(200)
  })

  it('preserves backend 204 no-content responses without forcing JSON', async () => {
    ;(global as { fetch: unknown }).fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: {
        get: () => null,
      },
      text: () => Promise.resolve(''),
    })

    const res = await DELETE(makeRequest('DELETE', 'users/addresses/123'), {
      params: Promise.resolve({ path: ['users', 'addresses', '123'] }),
    })

    expect(res.status).toBe(204)
    expect(await res.text()).toBe('')
  })

  it('handles plain text response', async () => {
    ;(global as { fetch: unknown }).fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (h: string) => (h === 'content-type' ? 'text/plain' : null),
      },
      text: () => Promise.resolve('ok'),
    })

    const res = await GET(makeRequest('GET', 'health'), {
      params: Promise.resolve({ path: ['health'] }),
    })

    expect(res.status).toBe(200)
  })
})
