import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import type { FavStoreState } from '@/features/favorites/state/favoritesStore'
import * as favsApi from '@/features/favorites/favoritesApi'
import * as productsApi from '@/features/products/api'
import { useAuthStore } from '@/features/auth/store'
import type { AuthStore } from '@/features/auth/store'
import type { IProduct } from '@/features/products/types'

jest.mock('@/features/favorites/favoritesApi', () => ({
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
  'favouriteIds' | 'favourites' | 'status' | 'pendingIds' | 'isSync'
>

const PRODUCT_ID_ONE = '418499f3-d951-40bf-9414-5cb90ab21ecb'
const PRODUCT_ID_TWO = 'ad0ef2b7-816b-4a11-b361-dfcbe705fc96'

const mockedSyncFavourites = jest.mocked(favsApi.syncFavourites)
const mockedRemoveFavourite = jest.mocked(favsApi.removeFavourite)
const mockedFetchFavourites = jest.mocked(favsApi.fetchFavourites)
const mockedGetProductByIds = jest.mocked(productsApi.getProductByIds)

const mockedAuthStore = useAuthStore as unknown as {
  getState: jest.MockedFunction<() => AuthStateSnapshot>
}

const initialFavState: FavStateSnapshot = {
  favouriteIds: [],
  favourites: [],
  status: 'idle',
  pendingIds: new Set(),
  isSync: false,
}

function getFavState(): FavStoreState {
  return useFavouritesStore.getState()
}

function setFavState(overrides: Partial<FavStateSnapshot> = {}): void {
  useFavouritesStore.setState({
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
    mockedGetProductByIds.mockResolvedValue([makeProduct(PRODUCT_ID_ONE)])

    await getFavState().toggleFavourite(PRODUCT_ID_ONE)

    expect(getFavState().favouriteIds).toContain(PRODUCT_ID_ONE)
  })
})

describe('favourites store — toggleFavourite (authenticated add)', () => {
  beforeEach(() => setAuthStatus('authenticated'))

  it('calls syncFavourites and updates state', async () => {
    mockedSyncFavourites.mockResolvedValue({ products: [makeProduct(PRODUCT_ID_ONE)] })

    await getFavState().toggleFavourite(PRODUCT_ID_ONE)

    expect(mockedSyncFavourites).toHaveBeenCalledWith({ productIds: [PRODUCT_ID_ONE] })
    expect(getFavState().favouriteIds).toContain(PRODUCT_ID_ONE)
  })

  it('rolls back on error', async () => {
    mockedSyncFavourites.mockRejectedValue(new Error('fail'))

    await getFavState().toggleFavourite(PRODUCT_ID_ONE)

    expect(getFavState().favouriteIds).not.toContain(PRODUCT_ID_ONE)
  })

  it('ignores repeat clicks while pending', async () => {
    let resolve!: () => void

    mockedSyncFavourites.mockReturnValue(
      new Promise((r) => {
        resolve = () => r({ products: [makeProduct(PRODUCT_ID_ONE)] })
      }),
    )

    const pendingRequest = getFavState().toggleFavourite(PRODUCT_ID_ONE)

    await getFavState().toggleFavourite(PRODUCT_ID_ONE)

    resolve()
    await pendingRequest

    expect(mockedSyncFavourites).toHaveBeenCalledTimes(1)
  })
})

describe('favourites store — toggleFavourite (remove)', () => {
  it('removes product from state when authenticated', async () => {
    setAuthStatus('authenticated')
    setFavState({
      favouriteIds: [PRODUCT_ID_ONE],
      favourites: [makeProduct(PRODUCT_ID_ONE)],
      status: 'ready',
    })
    mockedRemoveFavourite.mockResolvedValue(undefined)

    await getFavState().toggleFavourite(PRODUCT_ID_ONE)

    expect(getFavState().favouriteIds).not.toContain(PRODUCT_ID_ONE)
  })

  it('removes product locally when guest', async () => {
    setFavState({
      favouriteIds: [PRODUCT_ID_ONE],
      favourites: [makeProduct(PRODUCT_ID_ONE)],
      status: 'ready',
    })

    await getFavState().toggleFavourite(PRODUCT_ID_ONE)

    expect(mockedRemoveFavourite).not.toHaveBeenCalled()
    expect(getFavState().favouriteIds).not.toContain(PRODUCT_ID_ONE)
  })
})

describe('favourites store — hydrate', () => {
  it('fetches from server when authenticated', async () => {
    setAuthStatus('authenticated')
    mockedFetchFavourites.mockResolvedValue([makeProduct(PRODUCT_ID_ONE)])

    await getFavState().hydrate()

    expect(getFavState().favourites).toHaveLength(1)
    expect(getFavState().status).toBe('ready')
  })

  it('fetches by ids when guest', async () => {
    setFavState({ favouriteIds: [PRODUCT_ID_ONE] })
    mockedGetProductByIds.mockResolvedValue([makeProduct(PRODUCT_ID_ONE)])

    await getFavState().hydrate()

    expect(getFavState().favourites).toHaveLength(1)
    expect(getFavState().status).toBe('ready')
  })

  it('sets status to error on failure', async () => {
    setAuthStatus('authenticated')
    mockedFetchFavourites.mockRejectedValue(new Error('fail'))

    await getFavState().hydrate()

    expect(getFavState().status).toBe('error')
  })
})

describe('favourites store — syncSession', () => {
  it('merges and updates state', async () => {
    setAuthStatus('authenticated')
    setFavState({ favouriteIds: [PRODUCT_ID_ONE] })
    mockedSyncFavourites.mockResolvedValue({ products: [makeProduct(PRODUCT_ID_ONE)] })

    await getFavState().syncSession()

    expect(getFavState().favouriteIds).toContain(PRODUCT_ID_ONE)
  })

  it('normalizes duplicate and invalid guest ids before login sync', async () => {
    setAuthStatus('authenticated')
    setFavState({
      favouriteIds: [
        PRODUCT_ID_ONE,
        'not-a-product-id',
        PRODUCT_ID_ONE,
        PRODUCT_ID_TWO,
        '',
      ],
    })
    mockedSyncFavourites.mockResolvedValue({
      products: [makeProduct(PRODUCT_ID_ONE), makeProduct(PRODUCT_ID_TWO)],
    })

    await getFavState().syncSession()

    expect(mockedSyncFavourites).toHaveBeenCalledWith({
      productIds: [PRODUCT_ID_ONE, PRODUCT_ID_TWO],
    })
    expect(getFavState().favouriteIds).toEqual([PRODUCT_ID_ONE, PRODUCT_ID_TWO])
    expect(getFavState().isSync).toBe(true)
  })

  it('drops invalid stale guest ids without calling sync api', async () => {
    setAuthStatus('authenticated')
    setFavState({ favouriteIds: ['not-a-product-id', ''] })

    await getFavState().syncSession()

    expect(mockedSyncFavourites).not.toHaveBeenCalled()
    expect(getFavState().favouriteIds).toEqual([])
    expect(getFavState().isSync).toBe(false)
    expect(getFavState().status).toBe('ready')
  })
})

describe('favourites store — resetFav', () => {
  it('clears all state', () => {
    setFavState({
      favouriteIds: [PRODUCT_ID_ONE],
      favourites: [makeProduct(PRODUCT_ID_ONE)],
      status: 'ready',
    })

    getFavState().resetFav()

    expect(getFavState().favouriteIds).toHaveLength(0)
    expect(getFavState().favourites).toHaveLength(0)
    expect(getFavState().status).toBe('idle')
  })
})
