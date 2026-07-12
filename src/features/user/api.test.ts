import * as userApi from '@/features/user/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: jest.fn(),
}))

const mockedApi = jest.mocked(api)
const originalCrypto = global.crypto
const originalXmlHttpRequest = global.XMLHttpRequest

type MockXhrBehavior = {
  status?: number
  progressEvents?: number[]
  fail?: boolean
  defer?: boolean
}

let xhrBehaviors: MockXhrBehavior[] = []
const xhrInstances: MockXMLHttpRequest[] = []

class MockXMLHttpRequest {
  static reset() {
    xhrBehaviors = []
    xhrInstances.length = 0
  }

  method?: string
  url?: string
  body?: File | FormData
  status = 200
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null
  private progressListener?: (event: {
    lengthComputable: boolean
    loaded: number
    total: number
  }) => void

  readonly headers: Record<string, string> = {}

  readonly upload = {
    addEventListener: (
      event: string,
      listener: (event: {
        lengthComputable: boolean
        loaded: number
        total: number
      }) => void,
    ) => {
      if (event === 'progress') {
        this.progressListener = listener
      }
    },
  }

  constructor() {
    xhrInstances.push(this)
  }

  open(method: string, url: string) {
    this.method = method
    this.url = url
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value
  }

  send(body: File | FormData) {
    this.body = body
    const behavior = xhrBehaviors.shift() ?? {}

    this.status = behavior.status ?? 200

    for (const progress of behavior.progressEvents ?? []) {
      this.progressListener?.({
        lengthComputable: true,
        loaded: progress,
        total: 100,
      })
    }

    if (behavior.fail) {
      this.onerror?.()

      return
    }

    if (behavior.defer) {
      return
    }

    this.onload?.()
  }

  abort() {
    this.onabort?.()
  }
}

describe('user api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_AVATAR_UPLOAD_MODE = 'backend'
    Object.defineProperty(global, 'crypto', {
      configurable: true,
      value: {
        randomUUID: jest.fn(() => 'upload-key-123'),
      },
    })
    Object.defineProperty(global, 'XMLHttpRequest', {
      configurable: true,
      value: MockXMLHttpRequest,
    })
    MockXMLHttpRequest.reset()
  })

  afterAll(() => {
    Object.defineProperty(global, 'crypto', {
      configurable: true,
      value: originalCrypto,
    })
    Object.defineProperty(global, 'XMLHttpRequest', {
      configurable: true,
      value: originalXmlHttpRequest,
    })
  })

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

  it('removeUserAvatar deletes the avatar and returns refreshed user data', async () => {
    mockedApi.mockResolvedValueOnce({ data: undefined })
    mockedApi.mockResolvedValueOnce({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        address: null,
        avatarLink: null,
      },
    })

    const result = await userApi.removeUserAvatar()

    expect(mockedApi).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'DELETE',
        url: '/users/avatar',
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
    expect(result.avatarLink).toBeNull()
  })

  it('uploadImage reports uploading stage in backend mode', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const onStageChange = jest.fn()

    mockedApi.mockResolvedValue({ data: undefined })

    await userApi.uploadImage(file, undefined, { onStageChange })

    expect(onStageChange).toHaveBeenCalledWith('uploading')
  })

  it('uploadImage uses presigned flow when avatar upload mode is presigned', async () => {
    process.env.NEXT_PUBLIC_AVATAR_UPLOAD_MODE = 'presigned'
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const onStageChange = jest.fn()
    const onUploadProgress = jest.fn()

    mockedApi
      .mockResolvedValueOnce({
        data: {
          uploadId: 'upload-1',
          status: 'PENDING_UPLOAD',
          expiresAt: '2026-06-28T12:00:00Z',
          upload: {
            method: 'PUT',
            url: 'https://uploads.example.com/avatar.png',
            headers: { 'x-amz-meta-user-id': 'u1' },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          uploadId: 'upload-1',
          status: 'READY',
          expiresAt: '2026-06-28T12:00:00Z',
        },
      })
    xhrBehaviors.push({ progressEvents: [25, 100], status: 200 })

    await userApi.uploadImage(file, 'turnstile-token', {
      onStageChange,
      onUploadProgress,
    })

    expect(mockedApi).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: {
          contentType: 'image/png',
          sizeBytes: file.size,
          turnstileToken: 'turnstile-token',
        },
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Idempotency-Key': 'upload-key-123',
        }),
        method: 'POST',
        url: '/users/avatar/uploads',
      }),
    )
    expect(xhrInstances).toHaveLength(1)
    expect(xhrInstances[0]).toMatchObject({
      body: file,
      method: 'PUT',
      url: 'https://uploads.example.com/avatar.png',
    })
    expect(xhrInstances[0].headers).toEqual({
      'Content-Type': 'image/png',
      'x-amz-meta-user-id': 'u1',
    })
    expect(mockedApi).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        cache: false,
        method: 'GET',
        url: '/users/avatar/uploads/upload-1',
      }),
    )
    expect(onStageChange).toHaveBeenNthCalledWith(
      1,
      'requesting-upload-intent',
    )
    expect(onStageChange).toHaveBeenNthCalledWith(2, 'uploading')
    expect(onStageChange).toHaveBeenNthCalledWith(3, 'processing')
    expect(onUploadProgress).toHaveBeenNthCalledWith(1, null)
    expect(onUploadProgress).toHaveBeenNthCalledWith(2, 0)
    expect(onUploadProgress).toHaveBeenNthCalledWith(3, 25)
    expect(onUploadProgress).toHaveBeenNthCalledWith(4, 100)
    expect(onUploadProgress).toHaveBeenLastCalledWith(null)
  })

  it('uploadImage surfaces a mapped error when presigned processing fails', async () => {
    process.env.NEXT_PUBLIC_AVATAR_UPLOAD_MODE = 'presigned'
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    mockedApi
      .mockResolvedValueOnce({
        data: {
          uploadId: 'upload-1',
          status: 'PENDING_UPLOAD',
          expiresAt: '2026-06-28T12:00:00Z',
          upload: {
            method: 'PUT',
            url: 'https://uploads.example.com/avatar.png',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          uploadId: 'upload-1',
          status: 'FAILED',
          failureCode: 'DECODE_FAILED',
          expiresAt: '2026-06-28T12:00:00Z',
        },
      })
    xhrBehaviors.push({ status: 200 })

    await expect(userApi.uploadImage(file)).rejects.toMatchObject({
      isAxiosError: true,
      response: {
        data: expect.objectContaining({
          type: 'https://iced-latte.local/errors/avatar-upload-failed',
        }),
      },
    })
  })

  it('uploadImage surfaces a mapped error when storage upload fails before completion', async () => {
    process.env.NEXT_PUBLIC_AVATAR_UPLOAD_MODE = 'presigned'
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    mockedApi.mockResolvedValueOnce({
      data: {
        uploadId: 'upload-1',
        status: 'PENDING_UPLOAD',
        expiresAt: '2026-06-28T12:00:00Z',
        upload: {
          method: 'PUT',
          url: 'https://uploads.example.com/avatar.png',
        },
      },
    })
    xhrBehaviors.push({ fail: true })

    await expect(userApi.uploadImage(file)).rejects.toMatchObject({
      isAxiosError: true,
      response: {
        data: expect.objectContaining({
          type: 'https://iced-latte.local/errors/file-upload-failed',
        }),
      },
    })
  })

  it('uploadImage can be aborted before the presigned flow completes', async () => {
    process.env.NEXT_PUBLIC_AVATAR_UPLOAD_MODE = 'presigned'
    const controller = new AbortController()
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    mockedApi
      .mockResolvedValueOnce({
        data: {
          uploadId: 'upload-1',
          status: 'PENDING_UPLOAD',
          expiresAt: '2026-06-28T12:00:00Z',
          upload: {
            method: 'PUT',
            url: 'https://uploads.example.com/avatar.png',
          },
        },
      })
      .mockResolvedValueOnce({ data: undefined })
    xhrBehaviors.push({ defer: true })

    const uploadPromise = userApi.uploadImage(file, undefined, {
      signal: controller.signal,
    })

    await Promise.resolve()
    controller.abort()

    await expect(uploadPromise).rejects.toMatchObject({ name: 'AbortError' })
    expect(mockedApi).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'POST',
        url: '/users/avatar/uploads',
      }),
    )
    expect(mockedApi).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'DELETE',
        url: '/users/avatar/uploads/upload-1',
      }),
    )
  })
})
