/**
 * @jest-environment node
 */
process.env.NEXT_PUBLIC_API_URL = 'http://backend'
process.env.NEXT_PUBLIC_FRONTEND_URL = 'http://localhost'

import { NextRequest } from 'next/server'

const originalEnv = process.env

function makeJwt(expOffsetSeconds = 3600): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expOffsetSeconds }),
  ).toString('base64url')

  return `header.${payload}.signature`
}

function makeRequest(): NextRequest {
  return new NextRequest('http://localhost/api/user/avatar', {
    headers: {
      cookie: `token=${makeJwt()}`,
    },
  })
}

describe('avatar image route', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_URL: 'http://backend',
      NEXT_PUBLIC_FRONTEND_URL: 'http://localhost',
      NODE_ENV: 'test',
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    process.env = originalEnv
  })

  it('fetches the authenticated avatar link and streams the image same-origin', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response('https://storage.example.com/avatar.png'))
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), {
        headers: { 'content-type': 'image/png' },
      }))

    const { GET } = await import('@/app/api/user/avatar/route')
    const response = await GET(makeRequest())

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.arrayBuffer()).toEqual(new Uint8Array([1, 2, 3]).buffer)
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'http://backend/users/avatar',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer '),
        }),
      }),
    )
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://storage.example.com/avatar.png',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('returns the backend status when the user has no avatar', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(new Response(null, { status: 404 }))

    const { GET } = await import('@/app/api/user/avatar/route')
    const response = await GET(makeRequest())

    expect(response.status).toBe(404)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('rejects non-image storage responses', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response('https://storage.example.com/avatar.png'))
      .mockResolvedValueOnce(new Response('not image', {
        headers: { 'content-type': 'text/plain' },
      }))

    const { GET } = await import('@/app/api/user/avatar/route')
    const response = await GET(makeRequest())

    expect(response.status).toBe(502)
  })

  it('rejects non-HTTPS avatar URLs', async () => {
    process.env = { ...process.env, NODE_ENV: 'production' }
    global.fetch = jest.fn().mockResolvedValueOnce(new Response('http://storage.example.com/avatar.png'))

    const { GET } = await import('@/app/api/user/avatar/route')
    const response = await GET(makeRequest())

    expect(response.status).toBe(502)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('allows localhost HTTP avatar URLs outside production', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response('http://localhost:9000/avatar.png'))
      .mockResolvedValueOnce(new Response(new Uint8Array([1]), {
        headers: { 'content-type': 'image/png' },
      }))

    const { GET } = await import('@/app/api/user/avatar/route')
    const response = await GET(makeRequest())

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:9000/avatar.png',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('returns service unavailable when the backend URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_API_URL
    global.fetch = jest.fn()

    const { GET } = await import('@/app/api/user/avatar/route')
    const response = await GET(makeRequest())

    expect(response.status).toBe(503)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
