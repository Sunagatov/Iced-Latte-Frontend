import { render, screen, act } from '@testing-library/react'
import SyncFav from '@/features/favorites/components/SyncFav/SyncFav'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'

jest.mock('@/shared/components/Loader/Loader', () => ({ __esModule: true, default: () => <div>Loading</div> }))
jest.mock('@/features/favorites/components/FavouritesEmpty/FavouritesEmpty', () => ({ __esModule: true, default: () => <div>FavouritesEmpty</div> }))
jest.mock('@/features/favorites/components/FavouritesFull/FavouritesFull', () => ({ __esModule: true, default: () => <div>FavouritesFull</div> }))

// Make persist.hasHydrated return true immediately so the component skips the subscription path
const mockPersist = { hasHydrated: () => true, onFinishHydration: jest.fn(() => jest.fn()) }
;(useFavouritesStore as unknown as { persist: typeof mockPersist }).persist = mockPersist
;(useAuthStore as unknown as { persist: typeof mockPersist }).persist = mockPersist

beforeEach(() => {
  useFavouritesStore.setState({ favouriteIds: [], favourites: [], count: 0, loading: false, isSync: false })
  useAuthStore.setState({ token: null, isLoggedIn: false, refreshToken: null, userData: null })
})

describe('SyncFav', () => {
  it('shows FavouritesEmpty when no favourites', async () => {
    jest.spyOn(useFavouritesStore.getState(), 'getFavouriteProducts').mockResolvedValue(undefined)
    await act(async () => { render(<SyncFav />) })
    expect(screen.getByText('FavouritesEmpty')).toBeInTheDocument()
  })

  it('shows FavouritesFull when favourites exist', async () => {
    useFavouritesStore.setState({
      favouriteIds: ['p1'],
      favourites: [{ id: 'p1', name: 'Coffee', description: '', price: 10, quantity: 1, active: true, productFileUrl: null, averageRating: 0, reviewsCount: 0, brandName: 'b', sellerName: 's' }],
      count: 1,
      loading: false,
      isSync: false,
    })
    jest.spyOn(useFavouritesStore.getState(), 'getFavouriteProducts').mockResolvedValue(undefined)
    await act(async () => { render(<SyncFav />) })
    expect(screen.getByText('FavouritesFull')).toBeInTheDocument()
  })

  it('shows loader before hydration completes', () => {
    const slowPersist = { hasHydrated: () => false, onFinishHydration: jest.fn(() => jest.fn()) }
    ;(useFavouritesStore as unknown as { persist: typeof slowPersist }).persist = slowPersist
    ;(useAuthStore as unknown as { persist: typeof slowPersist }).persist = slowPersist
    render(<SyncFav />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
    // restore
    ;(useFavouritesStore as unknown as { persist: typeof mockPersist }).persist = mockPersist
    ;(useAuthStore as unknown as { persist: typeof mockPersist }).persist = mockPersist
  })
})
