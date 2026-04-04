/**
 * @jest-environment node
 */
import { GET, POST, PUT, PATCH, DELETE, OPTIONS } from '../../../src/app/api/proxy/[...path]/route'
import { NextRequest } from 'next/server'

process.env.NEXT_PUBLIC_API_URL = 'http://backend'

function makeRequest(method: string, path: string, body?: unknown): NextRequest {
  const url = `http://localhost/api/proxy/${path}`
  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : {},
  })
}

function mockFetch(status: number, body: unknown, contentType = 'application/json') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status < 400,
    status,
    headers: { get: (h: string) => (h === 'content-type' ? contentType : null) },
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

describe('proxy route', () => {
  afterEach(() => jest.restoreAllMocks())

  it('OPTIONS returns 200', async () => {
    const res = await OPTIONS(new NextRequest('http://localhost/api/proxy/test', { method: 'OPTIONS' }))
    expect(res.status).toBe(200)
  })

  it('GET proxies request and returns data', async () => {
    mockFetch(200, { products: [] })
    const res = await GET(makeRequest('GET', 'products'), { params: Promise.resolve({ path: ['products'] }) })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ products: [] })
  })

  it('returns 400 for invalid path characters', async () => {
    const res = await GET(makeRequest('GET', 'bad path!'), { params: Promise.resolve({ path: ['bad path!'] }) })
    expect(res.status).toBe(400)
  })

  it('returns 503 when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network'))
    const res = await GET(makeRequest('GET', 'products'), { params: Promise.resolve({ path: ['products'] }) })
    expect(res.status).toBe(503)
  })

  it('returns error status from backend', async () => {
    mockFetch(404, { message: 'Not found' })
    const res = await GET(makeRequest('GET', 'products'), { params: Promise.resolve({ path: ['products'] }) })
    expect(res.status).toBe(404)
  })

  it('POST telemetry returns 202 without forwarding', async () => {
    global.fetch = jest.fn()
    const res = await POST(makeRequest('POST', 'telemetry'), { params: Promise.resolve({ path: ['telemetry'] }) })
    expect(res.status).toBe(202)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('PUT proxies request', async () => {
    mockFetch(200, { ok: true })
    const res = await PUT(makeRequest('PUT', 'users'), { params: Promise.resolve({ path: ['users'] }) })
    expect(res.status).toBe(200)
  })

  it('PATCH proxies request', async () => {
    mockFetch(200, { ok: true })
    const res = await PATCH(makeRequest('PATCH', 'users'), { params: Promise.resolve({ path: ['users'] }) })
    expect(res.status).toBe(200)
  })

  it('DELETE proxies request', async () => {
    mockFetch(200, {})
    const res = await DELETE(makeRequest('DELETE', 'cart/1'), { params: Promise.resolve({ path: ['cart', '1'] }) })
    expect(res.status).toBe(200)
  })

  it('handles plain text response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (h: string) => (h === 'content-type' ? 'text/plain' : null) },
      text: () => Promise.resolve('ok'),
    })
    const res = await GET(makeRequest('GET', 'health'), { params: Promise.resolve({ path: ['health'] }) })
    expect(res.status).toBe(200)
  })
})
