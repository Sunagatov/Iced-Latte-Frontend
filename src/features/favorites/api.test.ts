import { fetchFavourites } from '@/features/favorites/public'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: { get: jest.fn() },
}))

const mockedApi = api as jest.Mocked<typeof api>

describe('favorites api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetchFavourites disables cache for authenticated server data', async () => {
    const signal = new AbortController().signal

    ;(mockedApi.get as jest.Mock).mockResolvedValue({
      data: { products: [] },
    })

    await fetchFavourites(signal)

    expect(mockedApi.get).toHaveBeenCalledWith('/favorites', {
      cache: false,
      signal,
    })
  })
})
