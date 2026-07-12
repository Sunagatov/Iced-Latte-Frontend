import { fetchFavourites } from '@/features/favorites/favoritesApi'
import { api } from '@/shared/api/client'

jest.mock('@/shared/api/client', () => ({
  api: jest.fn(),
}))

const mockedApi = jest.mocked(api)

describe('favorites api', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetchFavourites disables cache for authenticated server data', async () => {
    const signal = new AbortController().signal

    mockedApi.mockResolvedValue({
      data: { products: [] },
    })

    await fetchFavourites(signal)

    expect(mockedApi).toHaveBeenCalledWith(expect.objectContaining({
      cache: false,
      method: 'GET',
      signal,
      url: '/favorites',
    }))
  })
})
