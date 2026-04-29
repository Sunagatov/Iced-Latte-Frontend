import { getAddresses } from '@/features/addresses/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}))

const mockedApi = api as jest.Mocked<typeof api>

describe('addresses api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getAddresses disables cache for authenticated address data', async () => {
    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: [],
    })

    await getAddresses()

    expect(mockedApi.get).toHaveBeenCalledWith('/users/addresses', {
      cache: false,
    })
  })
})
