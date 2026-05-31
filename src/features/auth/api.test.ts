import * as authApi from '@/features/auth/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: jest.fn(),
}))

const mockedApi = jest.mocked(api)

describe('auth api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('apiForgotPassword posts to /auth/password/forgot', async () => {
    mockedApi.mockResolvedValue({
      data: { message: 'ok' },
    })

    await authApi.apiForgotPassword({ email: 'a@b.com' })

    expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
      data: { email: 'a@b.com' },
      method: 'POST',
      url: '/auth/password/forgot',
    }))
  })

  it('apiGuestResetPassword posts to /auth/password/change', async () => {
    mockedApi.mockResolvedValue({
      data: { message: 'ok' },
    })

    await authApi.apiGuestResetPassword({ code: 'abc', password: 'newpass' })

    expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
      data: { code: 'abc', password: 'newpass' },
      method: 'POST',
      url: '/auth/password/change',
    }))
  })

  it('apiAuthChangePassword patches /users', async () => {
    mockedApi.mockResolvedValue({
      data: { message: 'ok' },
    })

    await authApi.apiAuthChangePassword({
      oldPassword: 'old',
      newPassword: 'new',
    })

    expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
      data: { newPassword: 'new', oldPassword: 'old' },
      method: 'PATCH',
      url: '/users',
    }))
  })
})
