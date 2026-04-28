import { isBootstrapUserProfileRequest } from '@/shared/providers/AuthInterceptor'

describe('AuthInterceptor URL guards', () => {
  it('matches only the exact user profile bootstrap endpoint', () => {
    expect(isBootstrapUserProfileRequest('/api/proxy/users')).toBe(true)
    expect(isBootstrapUserProfileRequest('/api/proxy/users?cache=false')).toBe(true)
    expect(isBootstrapUserProfileRequest('/users')).toBe(true)
    expect(isBootstrapUserProfileRequest('/api/v1/users')).toBe(true)
  })

  it('does not treat nested user endpoints as bootstrap-only requests', () => {
    expect(isBootstrapUserProfileRequest('/api/proxy/users/addresses')).toBe(false)
    expect(isBootstrapUserProfileRequest('/api/proxy/users/reviews')).toBe(false)
    expect(isBootstrapUserProfileRequest('/api/proxy/users/avatar')).toBe(false)
  })
})
