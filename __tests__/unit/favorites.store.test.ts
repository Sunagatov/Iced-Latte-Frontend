import { useFavouritesStore } from '@/features/favorites/store'
import * as favsApi from '@/features/favorites/api'
import * as productsApi from '@/features/products/api'

jest.mock('@/features/favorites/api', () => ({
  mergeFavs: jest.fn(),
  removeFavItem: jest.fn(),
  getFavByIds: jest.fn(),
}))
jest.mock('@/features/products/api', () => ({
  getProductByIds: jest.fn(),
}))

const mockedFavsApi = jest.mocked(favsApi)
const mockedProductsApi = jest.mocked(productsApi)

function makeProduct(id: string) {
  return { id, name: 'p', description: '', price: 10, quantity: 10, active: true, productFileUrl: null, averageRating: 0, reviewsCount: 0, brandName: 'b', sellerName: 's' }
}

beforeEach(() => {
  useFavouritesStore.setState({ favouriteIds: [], favourites: [], count: 0, loading: false, isSync: false })
  jest.clearAllMocks()
})

describe('favourites store — addFavourite (guest)', () => {
  it('adds product locally', async () => {
    mockedProductsApi.getProductByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().addFavourite('p1', null)
    expect(useFavouritesStore.getState().favouriteIds).toContain('p1')
    expect(useFavouritesStore.getState().count).toBe(1)
  })
})

describe('favourites store — addFavourite (authenticated)', () => {
  it('calls mergeFavs and updates state', async () => {
    mockedFavsApi.mergeFavs.mockResolvedValue({ products: [makeProduct('p1')] })
    await useFavouritesStore.getState().addFavourite('p1', 'token')
    expect(mockedFavsApi.mergeFavs).toHaveBeenCalledWith({ productIds: ['p1'] })
    expect(useFavouritesStore.getState().count).toBe(1)
  })

  it('rolls back on error', async () => {
    mockedFavsApi.mergeFavs.mockRejectedValue(new Error('fail'))
    await useFavouritesStore.getState().addFavourite('p1', 'token')
    expect(useFavouritesStore.getState().favouriteIds).not.toContain('p1')
  })
})

describe('favourites store — removeFavourite', () => {
  it('removes product from state', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [makeProduct('p1')], count: 1, loading: false, isSync: false })
    mockedFavsApi.removeFavItem.mockResolvedValue(null as never)
    await useFavouritesStore.getState().removeFavourite('p1', 'token')
    expect(useFavouritesStore.getState().count).toBe(0)
    expect(useFavouritesStore.getState().favouriteIds).not.toContain('p1')
  })

  it('removes product locally without token', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [makeProduct('p1')], count: 1, loading: false, isSync: false })
    await useFavouritesStore.getState().removeFavourite('p1', null)
    expect(mockedFavsApi.removeFavItem).not.toHaveBeenCalled()
    expect(useFavouritesStore.getState().count).toBe(0)
  })
})

describe('favourites store — getFavouriteProducts', () => {
  it('fetches from server when token provided', async () => {
    mockedFavsApi.getFavByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().getFavouriteProducts('token')
    expect(useFavouritesStore.getState().favourites).toHaveLength(1)
  })

  it('fetches by ids when no token', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [], count: 0, loading: false, isSync: false })
    mockedProductsApi.getProductByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().getFavouriteProducts(null)
    expect(useFavouritesStore.getState().favourites).toHaveLength(1)
  })
})

describe('favourites store — syncBackendFav', () => {
  it('merges and updates state', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [], count: 0, loading: false, isSync: false })
    mockedFavsApi.mergeFavs.mockResolvedValue({ products: [makeProduct('p1')] })
    await useFavouritesStore.getState().syncBackendFav()
    expect(useFavouritesStore.getState().count).toBe(1)
  })
})

describe('favourites store — resetFav', () => {
  it('clears all state', () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [makeProduct('p1')], count: 1, loading: false, isSync: false })
    useFavouritesStore.getState().resetFav()
    expect(useFavouritesStore.getState().count).toBe(0)
    expect(useFavouritesStore.getState().favourites).toHaveLength(0)
  })
})
