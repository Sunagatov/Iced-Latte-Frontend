import { getAddresses } from '@/features/addresses/api'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: jest.fn(),
}))

const mockedApi = jest.mocked(api)

describe('addresses api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getAddresses disables cache for authenticated address data', async () => {
    mockedApi.mockResolvedValue({
      data: [],
    })

    await getAddresses()

    expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
      cache: false,
      method: 'GET',
      url: '/users/addresses',
    }))
  })
})
