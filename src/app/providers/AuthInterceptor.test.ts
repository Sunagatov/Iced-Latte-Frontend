import { isAuthRefreshExcludedRequest } from '@/app/providers/AuthInterceptor'

describe('AuthInterceptor URL guards', () => {
  it('matches auth endpoints that should never trigger refresh recursion', () => {
    expect(isAuthRefreshExcludedRequest('/api/proxy/auth/authenticate')).toBe(true)
    expect(isAuthRefreshExcludedRequest('/api/proxy/auth/refresh')).toBe(true)
    expect(isAuthRefreshExcludedRequest('/auth/logout')).toBe(true)
    expect(isAuthRefreshExcludedRequest('/api/v1/auth/refresh')).toBe(true)
  })

  it('does not exclude regular application endpoints from refresh handling', () => {
    expect(isAuthRefreshExcludedRequest('/api/proxy/users')).toBe(false)
    expect(isAuthRefreshExcludedRequest('/api/proxy/users/addresses')).toBe(false)
    expect(isAuthRefreshExcludedRequest('/api/proxy/products')).toBe(false)
  })
})
