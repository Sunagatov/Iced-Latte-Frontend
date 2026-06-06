import * as userApi from '@/features/user/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: jest.fn(),
}))

const mockedApi = jest.mocked(api)

describe('user api', () => {
  beforeEach(() => jest.clearAllMocks())

  const completeProfileUpdate = {
    firstName: 'Jane',
    lastName: 'Doe',
  }

  it('getUserData calls GET /users with cache disabled', async () => {
    mockedApi.mockResolvedValue({
      data: { firstName: 'John' },
    })

    const result = await userApi.getUserData()

    expect(mockedApi).toHaveBeenCalledWith(
      expect.objectContaining({
        cache: false,
        method: 'GET',
        url: '/users',
      }),
    )
    expect(result.firstName).toBe('John')
  })

  it('getUserData normalizes nullable backend address to an empty object', async () => {
    mockedApi.mockResolvedValue({
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
    mockedApi.mockResolvedValueOnce({
      data: { firstName: 'Jane' },
    })
    mockedApi.mockResolvedValueOnce({
      data: { firstName: 'Jane' },
    })

    const result = await userApi.editUserProfile(completeProfileUpdate)

    expect(mockedApi).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          address: null,
        },
        method: 'PUT',
        url: '/users',
      }),
    )
    expect(mockedApi).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        cache: false,
        method: 'GET',
        url: '/users',
      }),
    )
    expect(result.firstName).toBe('Jane')
  })

  it('editUserProfile keeps non-empty address', async () => {
    mockedApi.mockResolvedValueOnce({
      data: { firstName: 'Jane' },
    })
    mockedApi.mockResolvedValueOnce({
      data: { firstName: 'Jane' },
    })

    await userApi.editUserProfile({
      firstName: 'Jane',
      lastName: 'Doe',
      address: {
        country: 'UK',
        city: 'London',
        line: '221B Baker Street',
        postcode: 'NW1',
      },
    })

    expect(mockedApi).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          address: {
            country: 'UK',
            city: 'London',
            line: '221B Baker Street',
            postcode: 'NW1',
          },
        },
        method: 'PUT',
        url: '/users',
      }),
    )
  })

  it('editUserProfile normalizes nullable backend address in the response', async () => {
    mockedApi.mockResolvedValueOnce({
      data: { firstName: 'Jane' },
    })
    mockedApi.mockResolvedValueOnce({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        address: null,
      },
    })

    const result = await userApi.editUserProfile(completeProfileUpdate)

    expect(result.address).toEqual({})
  })

  it('editUserProfile returns refreshed user data with avatarLink from GET /users', async () => {
    mockedApi.mockResolvedValueOnce({
      data: {
        firstName: 'Jane',
        avatarLink: null,
      },
    })
    mockedApi.mockResolvedValueOnce({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        address: null,
        avatarLink: 'https://cdn.example.com/avatar.jpg',
      },
    })

    const result = await userApi.editUserProfile(completeProfileUpdate)

    expect(result.avatarLink).toBe('https://cdn.example.com/avatar.jpg')
  })

  it('uploadImage sends the file and optional Turnstile token', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    mockedApi.mockResolvedValue({ data: undefined })

    await userApi.uploadImage(file, 'turnstile-token')

    expect(mockedApi).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(FormData),
        method: 'POST',
        url: '/users/avatar',
      }),
    )

    const request = mockedApi.mock.calls[0][0] as unknown as { data: FormData }
    const formData = request.data

    expect(formData.get('file')).toBe(file)
    expect(formData.get('turnstileToken')).toBe('turnstile-token')
  })
})
