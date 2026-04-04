import { useFavouritesStore } from '@/features/favorites/store'
import type { FavStoreState } from '@/features/favorites/store'
import * as favsApi from '@/features/favorites/api'
import * as productsApi from '@/features/products/api'
import { useAuthStore } from '@/features/auth/store'
import type { AuthStore } from '@/features/auth/store'
import type { IProduct } from '@/features/products/types'
import type { StoreApi } from 'zustand'

jest.mock('@/features/favorites/api', () => ({
  syncFavourites: jest.fn(),
  removeFavourite: jest.fn(),
  fetchFavourites: jest.fn(),
}))

jest.mock('@/features/products/api', () => ({
  getProductByIds: jest.fn(),
}))

jest.mock('@/features/auth/store', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}))

type AuthStateSnapshot = Pick<AuthStore, 'status'>
type FavStateSnapshot = Pick<
  FavStoreState,
  'favouriteIds' | 'favourites' | 'status' | 'pendingIds'
>

const mockedSyncFavourites = favsApi.syncFavourites as jest.MockedFunction<
  typeof favsApi.syncFavourites
>
const mockedRemoveFavourite = favsApi.removeFavourite as jest.MockedFunction<
  typeof favsApi.removeFavourite
>
const mockedFetchFavourites = favsApi.fetchFavourites as jest.MockedFunction<
  typeof favsApi.fetchFavourites
>
const mockedGetProductByIds =
  productsApi.getProductByIds as jest.MockedFunction<
    typeof productsApi.getProductByIds
  >

const mockedAuthStore = useAuthStore as unknown as {
  getState: jest.MockedFunction<() => AuthStateSnapshot>
}

const favouritesStore = useFavouritesStore as unknown as Pick<
  StoreApi<FavStoreState>,
  'getState' | 'setState'
>

const initialFavState: FavStateSnapshot = {
  favouriteIds: [],
  favourites: [],
  status: 'idle',
  pendingIds: new Set(),
}

function getFavState(): FavStoreState {
  return favouritesStore.getState()
}

function setFavState(overrides: Partial<FavStateSnapshot> = {}): void {
  favouritesStore.setState({
    ...initialFavState,
    ...overrides,
  })
}

function makeProduct(id: string): IProduct {
  return {
    id,
    name: 'p',
    description: '',
    price: 10,
    quantity: 10,
    active: true,
    productFileUrl: null,
    averageRating: 0,
    reviewsCount: 0,
    brandName: 'b',
    sellerName: 's',
  }
}

function setAuthStatus(status: AuthStore['status']): void {
  mockedAuthStore.getState.mockReturnValue({ status })
}

beforeEach(() => {
  jest.clearAllMocks()
  setFavState()
  setAuthStatus('anonymous')
})

describe('favourites store — toggleFavourite (guest add)', () => {
  it('adds product locally', async () => {
    mockedGetProductByIds.mockResolvedValue([makeProduct('p1')])

    await getFavState().toggleFavourite('p1')

    expect(getFavState().favouriteIds).toContain('p1')
  })
})

describe('favourites store — toggleFavourite (authenticated add)', () => {
  beforeEach(() => setAuthStatus('authenticated'))

  it('calls syncFavourites and updates state', async () => {
    mockedSyncFavourites.mockResolvedValue({ products: [makeProduct('p1')] })

    await getFavState().toggleFavourite('p1')

    expect(mockedSyncFavourites).toHaveBeenCalledWith({ productIds: ['p1'] })
    expect(getFavState().favouriteIds).toContain('p1')
  })

  it('rolls back on error', async () => {
    mockedSyncFavourites.mockRejectedValue(new Error('fail'))

    await getFavState().toggleFavourite('p1')

    expect(getFavState().favouriteIds).not.toContain('p1')
  })

  it('ignores repeat clicks while pending', async () => {
    let resolve!: () => void

    mockedSyncFavourites.mockReturnValue(
      new Promise((r) => {
        resolve = () => r({ products: [makeProduct('p1')] })
      }),
    )

    const pendingRequest = getFavState().toggleFavourite('p1')

    await getFavState().toggleFavourite('p1')

    resolve()
    await pendingRequest

    expect(mockedSyncFavourites).toHaveBeenCalledTimes(1)
  })
})

describe('favourites store — toggleFavourite (remove)', () => {
  it('removes product from state when authenticated', async () => {
    setAuthStatus('authenticated')
    setFavState({
      favouriteIds: ['p1'],
      favourites: [makeProduct('p1')],
      status: 'ready',
    })
    mockedRemoveFavourite.mockResolvedValue({ products: [] })

    await getFavState().toggleFavourite('p1')

    expect(getFavState().favouriteIds).not.toContain('p1')
  })

  it('removes product locally when guest', async () => {
    setFavState({
      favouriteIds: ['p1'],
      favourites: [makeProduct('p1')],
      status: 'ready',
    })

    await getFavState().toggleFavourite('p1')

    expect(mockedRemoveFavourite).not.toHaveBeenCalled()
    expect(getFavState().favouriteIds).not.toContain('p1')
  })
})

describe('favourites store — getFavouriteProducts', () => {
  it('fetches from server when authenticated', async () => {
    setAuthStatus('authenticated')
    mockedFetchFavourites.mockResolvedValue([makeProduct('p1')])

    await getFavState().getFavouriteProducts()

    expect(getFavState().favourites).toHaveLength(1)
    expect(getFavState().status).toBe('ready')
  })

  it('fetches by ids when guest', async () => {
    setFavState({ favouriteIds: ['p1'] })
    mockedGetProductByIds.mockResolvedValue([makeProduct('p1')])

    await getFavState().getFavouriteProducts()

    expect(getFavState().favourites).toHaveLength(1)
    expect(getFavState().status).toBe('ready')
  })

  it('sets status to error on failure', async () => {
    setAuthStatus('authenticated')
    mockedFetchFavourites.mockRejectedValue(new Error('fail'))

    await getFavState().getFavouriteProducts()

    expect(getFavState().status).toBe('error')
  })
})

describe('favourites store — syncBackendFav', () => {
  it('merges and updates state', async () => {
    setFavState({ favouriteIds: ['p1'] })
    mockedSyncFavourites.mockResolvedValue({ products: [makeProduct('p1')] })

    await getFavState().syncBackendFav()

    expect(getFavState().favouriteIds).toContain('p1')
  })
})

describe('favourites store — resetFav', () => {
  it('clears all state', () => {
    setFavState({
      favouriteIds: ['p1'],
      favourites: [makeProduct('p1')],
      status: 'ready',
    })

    getFavState().resetFav()

    expect(getFavState().favouriteIds).toHaveLength(0)
    expect(getFavState().favourites).toHaveLength(0)
    expect(getFavState().status).toBe('idle')
  })
})
