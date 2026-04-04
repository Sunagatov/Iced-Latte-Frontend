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
  useFavouritesStore.setState({ favouriteIds: [], favourites: [], status: 'idle', pendingIds: new Set() })
  jest.clearAllMocks()
})

describe('favourites store — toggleFavourite (guest add)', () => {
  it('adds product locally', async () => {
    mockedProductsApi.getProductByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().toggleFavourite('p1', null)
    expect(useFavouritesStore.getState().favouriteIds).toContain('p1')
  })
})

describe('favourites store — toggleFavourite (authenticated add)', () => {
  it('calls mergeFavs and updates state', async () => {
    mockedFavsApi.mergeFavs.mockResolvedValue({ products: [makeProduct('p1')] })
    await useFavouritesStore.getState().toggleFavourite('p1', 'token')
    expect(mockedFavsApi.mergeFavs).toHaveBeenCalledWith({ productIds: ['p1'] })
    expect(useFavouritesStore.getState().favouriteIds).toContain('p1')
  })

  it('rolls back on error', async () => {
    mockedFavsApi.mergeFavs.mockRejectedValue(new Error('fail'))
    await useFavouritesStore.getState().toggleFavourite('p1', 'token')
    expect(useFavouritesStore.getState().favouriteIds).not.toContain('p1')
  })

  it('ignores repeat clicks while pending', async () => {
    let resolve!: () => void
    mockedFavsApi.mergeFavs.mockReturnValue(new Promise((r) => { resolve = () => r({ products: [makeProduct('p1')] }) }))
    const p = useFavouritesStore.getState().toggleFavourite('p1', 'token')
    // second click while first is in flight — should be ignored
    await useFavouritesStore.getState().toggleFavourite('p1', 'token')
    resolve()
    await p
    expect(mockedFavsApi.mergeFavs).toHaveBeenCalledTimes(1)
  })
})

describe('favourites store — toggleFavourite (remove)', () => {
  it('removes product from state', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [makeProduct('p1')], status: 'ready', pendingIds: new Set() })
    mockedFavsApi.removeFavItem.mockResolvedValue(null as never)
    await useFavouritesStore.getState().toggleFavourite('p1', 'token')
    expect(useFavouritesStore.getState().favouriteIds).not.toContain('p1')
  })

  it('removes product locally without token', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [makeProduct('p1')], status: 'ready', pendingIds: new Set() })
    await useFavouritesStore.getState().toggleFavourite('p1', null)
    expect(mockedFavsApi.removeFavItem).not.toHaveBeenCalled()
    expect(useFavouritesStore.getState().favouriteIds).not.toContain('p1')
  })
})

describe('favourites store — getFavouriteProducts', () => {
  it('fetches from server when token provided', async () => {
    mockedFavsApi.getFavByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().getFavouriteProducts('token')
    expect(useFavouritesStore.getState().favourites).toHaveLength(1)
    expect(useFavouritesStore.getState().status).toBe('ready')
  })

  it('fetches by ids when no token', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [], status: 'idle', pendingIds: new Set() })
    mockedProductsApi.getProductByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().getFavouriteProducts(null)
    expect(useFavouritesStore.getState().favourites).toHaveLength(1)
    expect(useFavouritesStore.getState().status).toBe('ready')
  })

  it('sets status to error on failure', async () => {
    mockedFavsApi.getFavByIds.mockRejectedValue(new Error('fail'))
    await useFavouritesStore.getState().getFavouriteProducts('token')
    expect(useFavouritesStore.getState().status).toBe('error')
  })
})

describe('favourites store — syncBackendFav', () => {
  it('merges and updates state', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [], status: 'idle', pendingIds: new Set() })
    mockedFavsApi.mergeFavs.mockResolvedValue({ products: [makeProduct('p1')] })
    await useFavouritesStore.getState().syncBackendFav()
    expect(useFavouritesStore.getState().favouriteIds).toContain('p1')
  })
})

describe('favourites store — resetFav', () => {
  it('clears all state', () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [makeProduct('p1')], status: 'ready', pendingIds: new Set() })
    useFavouritesStore.getState().resetFav()
    expect(useFavouritesStore.getState().favouriteIds).toHaveLength(0)
    expect(useFavouritesStore.getState().favourites).toHaveLength(0)
    expect(useFavouritesStore.getState().status).toBe('idle')
  })
})
