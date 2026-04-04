import * as userApi from '@/features/user/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({ api: { get: jest.fn(), put: jest.fn(), post: jest.fn(), patch: jest.fn() } }))

const mockedApi = jest.mocked(api) as jest.Mocked<typeof api>

describe('user api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getUserData calls GET /users', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({ data: { firstName: 'John' } })
    const result = await userApi.getUserData()
    expect(mockedApi.get).toHaveBeenCalledWith('/users')
    expect(result.firstName).toBe('John')
  })

  it('editUserProfile calls PUT /users', async () => {
    ;(mockedApi.put as jest.Mock).mockResolvedValue({ data: { firstName: 'Jane' } })
    const result = await userApi.editUserProfile({ firstName: 'Jane' })
    expect(mockedApi.put).toHaveBeenCalledWith('/users', { firstName: 'Jane' })
    expect(result.firstName).toBe('Jane')
  })

  it('apiForgotPassword posts to /auth/password/forgot', async () => {
    ;(mockedApi.post as jest.Mock).mockResolvedValue({ data: { message: 'ok' } })
    const result = await userApi.apiForgotPassword({ email: 'a@b.com' })
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/password/forgot', { email: 'a@b.com' })
    expect(result.message).toBe('ok')
  })

  it('apiGuestResetPassword posts to /auth/password/change', async () => {
    ;(mockedApi.post as jest.Mock).mockResolvedValue({ data: { message: 'ok' } })
    await userApi.apiGuestResetPassword({ code: 'abc', password: 'newpass' })
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/password/change', { code: 'abc', password: 'newpass' })
  })

  it('apiAuthChangePassword patches /users', async () => {
    ;(mockedApi.patch as jest.Mock).mockResolvedValue({ data: { message: 'ok' } })
    await userApi.apiAuthChangePassword({ oldPassword: 'old', newPassword: 'new' })
    expect(mockedApi.patch).toHaveBeenCalledWith('/users', { oldPassword: 'old', newPassword: 'new' })
  })
})
