import '@testing-library/jest-dom'
import { useFavouritesStore } from '../../../src/features/favorites/store'
import { getProductByIds } from '../../../src/features/products/api'
import { mergeFavs, removeFavItem } from '../../../src/features/favorites/api'
import type { IProduct } from '../../../src/features/products/types'

jest.mock('../../../src/features/products/api', () => ({
  getProductByIds: jest.fn(),
}))

jest.mock('../../../src/features/favorites/api', () => ({
  mergeFavs: jest.fn(),
  removeFavItem: jest.fn(),
  getFavByIds: jest.fn(),
}))

const mockedGetProductByIds = jest.mocked(getProductByIds)
const mockedMergeFavs = jest.mocked(mergeFavs)
const mockedRemoveFavItem = jest.mocked(removeFavItem)

const product: IProduct = {
  id: 'product-1',
  name: 'Test Coffee',
  description: 'Test description',
  price: 9.99,
  quantity: 10,
  active: true,
  productFileUrl: null,
  averageRating: 5,
  reviewsCount: 3,
  brandName: 'Test Brand',
  sellerName: 'Test Seller',
}

describe('favourites store', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    useFavouritesStore.setState({
      favouriteIds: [],
      favourites: [],
      count: 0,
      loading: false,
      isSync: false,
    })
  })

  it('deduplicates guest favourites before updating local state', async () => {
    mockedGetProductByIds.mockResolvedValue([product])

    await useFavouritesStore.getState().addFavourite(product.id, null)
    await useFavouritesStore.getState().addFavourite(product.id, null)

    expect(mockedGetProductByIds).toHaveBeenLastCalledWith([product.id])
    expect(useFavouritesStore.getState().favouriteIds).toEqual([product.id])
    expect(useFavouritesStore.getState().count).toBe(1)
  })

  it('normalizes authenticated favourites after a successful merge', async () => {
    mockedMergeFavs.mockResolvedValue({ products: [product] })

    useFavouritesStore.setState({
      favouriteIds: [product.id],
      favourites: [],
      count: 1,
      loading: false,
      isSync: false,
    })

    await useFavouritesStore.getState().addFavourite(product.id, 'token')

    expect(mockedMergeFavs).toHaveBeenCalledWith({ productIds: [product.id] })
    expect(useFavouritesStore.getState().favouriteIds).toEqual([product.id])
    expect(useFavouritesStore.getState().count).toBe(1)
  })

  it('rolls back favourite ids when authenticated merge fails', async () => {
    mockedMergeFavs.mockRejectedValue(new Error('merge failed'))

    await useFavouritesStore.getState().addFavourite(product.id, 'token')

    expect(useFavouritesStore.getState().favouriteIds).toEqual([])
    expect(useFavouritesStore.getState().count).toBe(0)
  })

  it('updates the count when a favourite is removed', async () => {
    mockedRemoveFavItem.mockResolvedValue({ products: [] })

    useFavouritesStore.setState({
      favouriteIds: [product.id],
      favourites: [product],
      count: 1,
      loading: false,
      isSync: false,
    })

    await useFavouritesStore.getState().removeFavourite(product.id, 'token')

    expect(mockedRemoveFavItem).toHaveBeenCalledWith(product.id)
    expect(useFavouritesStore.getState().favouriteIds).toEqual([])
    expect(useFavouritesStore.getState().count).toBe(0)
  })

  it('normalizes duplicated ids after backend sync', async () => {
    mockedMergeFavs.mockResolvedValue({ products: [product] })

    useFavouritesStore.setState({
      favouriteIds: [product.id, product.id],
      favourites: [],
      count: 2,
      loading: false,
      isSync: false,
    })

    await useFavouritesStore.getState().syncBackendFav()

    expect(mockedMergeFavs).toHaveBeenCalledWith({ productIds: [product.id] })
    expect(useFavouritesStore.getState().favouriteIds).toEqual([product.id])
    expect(useFavouritesStore.getState().count).toBe(1)
  })
})
