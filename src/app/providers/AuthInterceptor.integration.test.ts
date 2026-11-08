import { cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { AxiosError } from 'axios'
import AuthInterceptor from '@/app/providers/AuthInterceptor'
import { api } from '@/shared/api/client'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))
jest.mock('@/features/session/public', () => ({
  refreshAuthenticatedSession: jest.fn().mockResolvedValue({ id: 'user-1' }),
  clearClientSession: jest.fn(),
}))
jest.mock('@/features/auth/public', () => ({
  useAuthStore: { getState: () => ({ status: 'authenticated' }) },
}))

afterEach(cleanup)

it.each([401, 429])('retries HTTP %s through the real client without duplicating the proxy path', async (status) => {
  render(createElement(AuthInterceptor, null, null))
  const urls: string[] = []

  await api.get('/users', {
    cache: false,
    adapter: async (config) => {
      urls.push(config.url!)
      if (urls.length === 1) {
        throw new AxiosError('Retry required', 'ERR_BAD_REQUEST', config, {}, {
          data: {}, status, statusText: 'Retry required',
          headers: { 'retry-after': '0.001' }, config,
        })
      }

      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    },
  })

  expect(urls).toEqual(['/api/proxy/users', '/api/proxy/users'])
})
