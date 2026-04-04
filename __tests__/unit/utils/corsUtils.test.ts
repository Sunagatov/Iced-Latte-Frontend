/**
 * @jest-environment node
 */
import { createCorsResponse, handleOptions, corsHeaders } from '../../../src/shared/utils/corsUtils'
import { NextRequest } from 'next/server'

describe('corsUtils', () => {
  it('createCorsResponse returns 200 with data by default', async () => {
    const res = createCorsResponse({ ok: true })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(corsHeaders['Access-Control-Allow-Origin'])
  })

  it('createCorsResponse uses provided status', () => {
    const res = createCorsResponse({ error: 'bad' }, 400)
    expect(res.status).toBe(400)
  })

  it('createCorsResponse returns empty object when no data', async () => {
    const res = createCorsResponse()
    expect(await res.json()).toEqual({})
  })

  it('handleOptions returns 200 for matching origin', () => {
    const origin = corsHeaders['Access-Control-Allow-Origin'] || 'http://localhost:3000'
    const res = handleOptions(new NextRequest('http://localhost/', { method: 'OPTIONS', headers: { origin } }))
    expect(res.status).toBe(200)
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe(corsHeaders['Access-Control-Allow-Methods'])
  })

  it('handleOptions returns 403 for unknown origin when ALLOWED_ORIGIN is set', () => {
    // Only applies when ALLOWED_ORIGIN env var is configured
    if (!corsHeaders['Access-Control-Allow-Origin']) return
    const res = handleOptions(new NextRequest('http://localhost/', { method: 'OPTIONS', headers: { origin: 'https://evil.com' } }))
    expect(res.status).toBe(403)
  })
})
