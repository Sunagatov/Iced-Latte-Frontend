import { render, screen, act } from '@testing-library/react'
import FavouritesPage from '@/features/favorites/components/FavouritesPage/FavouritesPage'
import { useFavouritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'

jest.mock('@/features/favorites/components/FavouritesSkeleton/FavouritesSkeleton', () => ({ __esModule: true, default: () => <div>Loading</div> }))
jest.mock('@/features/favorites/components/FavouritesEmpty/FavouritesEmpty', () => ({ __esModule: true, default: () => <div>FavouritesEmpty</div> }))
jest.mock('@/features/favorites/components/FavouritesFull/FavouritesFull', () => ({ __esModule: true, default: () => <div>FavouritesFull</div> }))

const mockPersist = { hasHydrated: () => true, onFinishHydration: jest.fn(() => jest.fn()) }

;(useFavouritesStore as unknown as { persist: typeof mockPersist }).persist = mockPersist

beforeEach(() => {
  useFavouritesStore.setState({ favouriteIds: [], favourites: [], status: 'ready', pendingIds: new Set() })
  useAuthStore.setState({ status: 'anonymous', userData: null })
})

describe('FavouritesPage', () => {
  it('shows FavouritesEmpty when no favourites', () => {
    jest.spyOn(useFavouritesStore.getState(), 'getFavouriteProducts').mockResolvedValue(undefined)
    act(() => { render(<FavouritesPage />) })
    expect(screen.getByText('FavouritesEmpty')).toBeInTheDocument()
  })

  it('shows FavouritesFull when favourites exist', () => {
    useFavouritesStore.setState({
      favouriteIds: ['p1'],
      favourites: [{ id: 'p1', name: 'Coffee', description: '', price: 10, quantity: 1, active: true, productFileUrl: null, averageRating: 0, reviewsCount: 0, brandName: 'b', sellerName: 's' }],
      status: 'ready',
      pendingIds: new Set(),
    })
    jest.spyOn(useFavouritesStore.getState(), 'getFavouriteProducts').mockResolvedValue(undefined)
    act(() => { render(<FavouritesPage />) })
    expect(screen.getByText('FavouritesFull')).toBeInTheDocument()
  })

  it('shows loader before hydration completes', () => {
    const slowPersist = { hasHydrated: () => false, onFinishHydration: jest.fn(() => jest.fn()) }

    ;(useFavouritesStore as unknown as { persist: typeof slowPersist }).persist = slowPersist
    render(<FavouritesPage />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
    // restore
    ;(useFavouritesStore as unknown as { persist: typeof mockPersist }).persist = mockPersist
  })
})
