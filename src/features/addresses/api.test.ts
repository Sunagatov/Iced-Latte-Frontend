import { createAddress, getAddresses } from '@/features/addresses/api'
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

  it('normalizes optional generated address fields at the feature boundary', async () => {
    mockedApi.mockResolvedValue({
      data: [{ id: 'addr-1', label: 'Home' }],
    })

    await expect(getAddresses()).resolves.toEqual([
      {
        city: '',
        country: '',
        id: 'addr-1',
        isDefault: false,
        label: 'Home',
        line: '',
        postcode: '',
      },
    ])
  })

  it('normalizes created addresses before returning them', async () => {
    mockedApi.mockResolvedValue({
      data: { id: 'addr-2', city: 'London', isDefault: true },
    })

    await expect(createAddress({
      city: 'London',
      country: 'United Kingdom',
      label: 'Home',
      line: '1 Main St',
      postcode: 'SW1A 1AA',
    })).resolves.toEqual({
      city: 'London',
      country: '',
      id: 'addr-2',
      isDefault: true,
      label: '',
      line: '',
      postcode: '',
    })
  })
})
