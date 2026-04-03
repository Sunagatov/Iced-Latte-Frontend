/**
 * @jest-environment node
 */
import { createCorsResponse, handleOptions, corsHeaders } from '../../../src/shared/utils/corsUtils'

describe('corsUtils', () => {
  it('createCorsResponse returns 200 with data by default', async () => {
    const res = createCorsResponse({ ok: true })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('createCorsResponse uses provided status', () => {
    const res = createCorsResponse({ error: 'bad' }, 400)
    expect(res.status).toBe(400)
  })

  it('createCorsResponse returns empty object when no data', async () => {
    const res = createCorsResponse()
    expect(await res.json()).toEqual({})
  })

  it('handleOptions returns 200 with cors headers', () => {
    const res = handleOptions()
    expect(res.status).toBe(200)
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe(corsHeaders['Access-Control-Allow-Methods'])
  })
})
