import * as userApi from '@/features/user/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: { get: jest.fn(), put: jest.fn(), post: jest.fn(), patch: jest.fn() },
}))

const mockedApi = api as jest.Mocked<typeof api>

describe('user api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getUserData calls GET /users with cache disabled', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: { firstName: 'John' },
    })

    const result = await userApi.getUserData()

    expect(mockedApi.get).toHaveBeenCalledWith('/users', { cache: false })
    expect(result.firstName).toBe('John')
  })

  it('getUserData normalizes nullable backend address to an empty object', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        address: null,
      },
    })

    const result = await userApi.getUserData()

    expect(result.address).toEqual({})
  })

  it('editUserProfile calls PUT /users and normalizes empty address to null', async () => {
    ;(mockedApi.put as jest.Mock).mockResolvedValue({
      data: { firstName: 'Jane' },
    })
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: { firstName: 'Jane' },
    })

    const result = await userApi.editUserProfile({ firstName: 'Jane' })

    expect(mockedApi.put).toHaveBeenCalledWith('/users', {
      firstName: 'Jane',
      address: null,
    })
    expect(mockedApi.get).toHaveBeenCalledWith('/users', { cache: false })
    expect(result.firstName).toBe('Jane')
  })

  it('editUserProfile keeps non-empty address', async () => {
    ;(mockedApi.put as jest.Mock).mockResolvedValue({
      data: { firstName: 'Jane' },
    })
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: { firstName: 'Jane' },
    })

    await userApi.editUserProfile({
      firstName: 'Jane',
      address: {
        country: 'UK',
        city: 'London',
        line: '221B Baker Street',
        postcode: 'NW1',
      },
    })

    expect(mockedApi.put).toHaveBeenCalledWith('/users', {
      firstName: 'Jane',
      address: {
        country: 'UK',
        city: 'London',
        line: '221B Baker Street',
        postcode: 'NW1',
      },
    })
  })

  it('editUserProfile normalizes nullable backend address in the response', async () => {
    ;(mockedApi.put as jest.Mock).mockResolvedValue({
      data: { firstName: 'Jane' },
    })
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        address: null,
      },
    })

    const result = await userApi.editUserProfile({ firstName: 'Jane' })

    expect(result.address).toEqual({})
  })

  it('editUserProfile returns refreshed user data with avatarLink from GET /users', async () => {
    ;(mockedApi.put as jest.Mock).mockResolvedValue({
      data: {
        firstName: 'Jane',
        avatarLink: null,
      },
    })
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        address: null,
        avatarLink: 'https://cdn.example.com/avatar.jpg',
      },
    })

    const result = await userApi.editUserProfile({ firstName: 'Jane' })

    expect(result.avatarLink).toBe('https://cdn.example.com/avatar.jpg')
  })

  it('apiForgotPassword posts to /auth/password/forgot', async () => {
    ;(mockedApi.post as jest.Mock).mockResolvedValue({
      data: { message: 'ok' },
    })

    const result = await userApi.apiForgotPassword({ email: 'a@b.com' })

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/password/forgot', {
      email: 'a@b.com',
    })
    expect(result.message).toBe('ok')
  })

  it('apiGuestResetPassword posts to /auth/password/change', async () => {
    ;(mockedApi.post as jest.Mock).mockResolvedValue({
      data: { message: 'ok' },
    })

    await userApi.apiGuestResetPassword({ code: 'abc', password: 'newpass' })

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/password/change', {
      code: 'abc',
      password: 'newpass',
    })
  })

  it('apiAuthChangePassword patches /users', async () => {
    ;(mockedApi.patch as jest.Mock).mockResolvedValue({
      data: { message: 'ok' },
    })

    await userApi.apiAuthChangePassword({
      oldPassword: 'old',
      newPassword: 'new',
    })

    expect(mockedApi.patch).toHaveBeenCalledWith('/users', {
      oldPassword: 'old',
      newPassword: 'new',
    })
  })
})
