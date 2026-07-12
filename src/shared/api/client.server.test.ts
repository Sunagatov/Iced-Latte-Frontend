/**
 * @jest-environment node
 */
import axios, { type AxiosRequestConfig } from 'axios'
import { api } from '@/shared/api/client'

describe('api client on the server', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const env = process.env as Record<string, string | undefined>

  beforeEach(() => {
    process.env.INTERNAL_API_URL = 'http://iced-latte-backend:8083/api/v1'
    process.env.NEXT_PUBLIC_API_URL = 'https://api.iced-latte.uk/api/v1'
  })

  afterEach(() => {
    env.NODE_ENV = originalNodeEnv
    delete process.env.INTERNAL_API_URL
    delete process.env.NEXT_PUBLIC_API_URL
  })

  it('uses internal API URL when configured', async () => {
    let capturedConfig: AxiosRequestConfig | undefined

    await api({
      url: '/products',
      method: 'GET',
      adapter: async (config) => {
        capturedConfig = config

        return {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      },
    })

    expect(capturedConfig).toBeDefined()
    expect(axios.getUri(capturedConfig)).toBe(
      'http://iced-latte-backend:8083/api/v1/products',
    )
  })

  it('fails closed in production when INTERNAL_API_URL is missing', async () => {
    env.NODE_ENV = 'production'
    delete process.env.INTERNAL_API_URL

    await expect(
      api({
        url: '/products',
        method: 'GET',
        adapter: async (config) => ({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }),
      }),
    ).rejects.toThrow(
      'INTERNAL_API_URL is required in production server-side runtime',
    )
  })
})
