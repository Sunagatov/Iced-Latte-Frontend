import { orvalMutator } from '@/shared/api/orvalMutator'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: jest.fn((config) => Promise.resolve({ data: config })),
}))

const mockedApi = jest.mocked(api)

describe('orvalMutator', () => {
  it('removes the backend API prefix from generated OpenAPI paths', async () => {
    await orvalMutator({
      url: '/api/v1/payment/checkout',
      method: 'POST',
    })

    expect(mockedApi).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/payment/checkout',
      }),
    )
  })

  it('keeps non-generated paths unchanged and merges option headers', async () => {
    await orvalMutator(
      {
        url: '/products',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        headers: { 'Idempotency-Key': 'key-123' },
      },
    )

    expect(mockedApi).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/products',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'key-123',
        },
      }),
    )
  })
})
