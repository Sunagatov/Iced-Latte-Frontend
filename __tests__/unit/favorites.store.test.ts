import { useFavouritesStore } from '@/features/favorites/store'

jest.mock('src/features/favorites/api', () => ({
  mergeFavs: jest.fn(),
  removeFavItem: jest.fn(),
  getFavByIds: jest.fn(),
}))
jest.mock('src/features/products/api', () => ({
  getProductByIds: jest.fn(),
}))

const { mergeFavs, removeFavItem, getFavByIds } = require('src/features/favorites/api')
const { getProductByIds } = require('src/features/products/api')

function makeProduct(id: string) {
  return { id, name: 'p', description: '', price: 10, quantity: 0, active: true, productFileUrl: null, productQuantity: 0, averageRating: 0, reviewsCount: 0, brandName: '', sellerName: '', productImageUrls: [] }
}

beforeEach(() => {
  useFavouritesStore.setState({ favouriteIds: [], favourites: [], count: 0, loading: false, isSync: false })
  jest.clearAllMocks()
})

describe('favourites store — addFavourite (guest)', () => {
  it('adds product locally', async () => {
    getProductByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().addFavourite('p1', null)
    expect(useFavouritesStore.getState().favouriteIds).toContain('p1')
    expect(useFavouritesStore.getState().count).toBe(1)
  })
})

describe('favourites store — addFavourite (authenticated)', () => {
  it('calls mergeFavs and updates state', async () => {
    mergeFavs.mockResolvedValue({ products: [makeProduct('p1')] })
    await useFavouritesStore.getState().addFavourite('p1', 'token')
    expect(mergeFavs).toHaveBeenCalledWith({ productIds: ['p1'] })
    expect(useFavouritesStore.getState().count).toBe(1)
  })

  it('rolls back on error', async () => {
    mergeFavs.mockRejectedValue(new Error('fail'))
    await useFavouritesStore.getState().addFavourite('p1', 'token')
    expect(useFavouritesStore.getState().favouriteIds).not.toContain('p1')
  })
})

describe('favourites store — removeFavourite', () => {
  it('removes product from state', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [makeProduct('p1')], count: 1, loading: false, isSync: false })
    removeFavItem.mockResolvedValue(undefined)
    await useFavouritesStore.getState().removeFavourite('p1', 'token')
    expect(useFavouritesStore.getState().count).toBe(0)
    expect(useFavouritesStore.getState().favouriteIds).not.toContain('p1')
  })

  it('removes product locally without token', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [makeProduct('p1')], count: 1, loading: false, isSync: false })
    await useFavouritesStore.getState().removeFavourite('p1', null)
    expect(removeFavItem).not.toHaveBeenCalled()
    expect(useFavouritesStore.getState().count).toBe(0)
  })
})

describe('favourites store — getFavouriteProducts', () => {
  it('fetches from server when token provided', async () => {
    getFavByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().getFavouriteProducts('token')
    expect(useFavouritesStore.getState().favourites).toHaveLength(1)
  })

  it('fetches by ids when no token', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [], count: 0, loading: false, isSync: false })
    getProductByIds.mockResolvedValue([makeProduct('p1')])
    await useFavouritesStore.getState().getFavouriteProducts(null)
    expect(useFavouritesStore.getState().favourites).toHaveLength(1)
  })
})

describe('favourites store — syncBackendFav', () => {
  it('merges and updates state', async () => {
    useFavouritesStore.setState({ favouriteIds: ['p1'], favourites: [], count: 0, loading: false, isSync: false })
    mergeFavs.mockResolvedValue({ products: [makeProduct('p1')] })
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
