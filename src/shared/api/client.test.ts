import axios, { type AxiosRequestConfig } from 'axios'
import { api } from '@/shared/api/client'

describe('api client', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://backend/api/v1'
  })

  it('serializes array query params as repeated keys for Spring request params', async () => {
    let capturedConfig: AxiosRequestConfig | undefined

    await api({
      url: '/orders',
      method: 'GET',
      params: {
        status: ['PAID', 'DELIVERED'],
      },
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
      '/api/proxy/orders?status=PAID&status=DELIVERED',
    )
  })
})
