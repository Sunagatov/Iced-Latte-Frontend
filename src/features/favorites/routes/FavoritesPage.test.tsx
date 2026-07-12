import { render, screen, act } from '@testing-library/react'
import FavouritesPage from '@/features/favorites/components/FavouritesPage'
import { useFavouritesStore } from '@/features/favorites/public'
import { useAuthStore } from '@/features/auth/public'

jest.mock(
  '@/features/favorites/components/FavouritesSkeleton',
  () => ({ __esModule: true, default: () => <div>Loading</div> }),
)
jest.mock(
  '@/features/favorites/components/FavouritesEmpty',
  () => ({ __esModule: true, default: () => <div>FavouritesEmpty</div> }),
)
jest.mock(
  '@/features/favorites/components/FavouritesFull',
  () => ({ __esModule: true, default: () => <div>FavouritesFull</div> }),
)

const mockPersist = {
  hasHydrated: () => true,
  onFinishHydration: jest.fn(() => jest.fn()),
}

;(useFavouritesStore as unknown as { persist: typeof mockPersist }).persist =
  mockPersist

beforeEach(() => {
  useFavouritesStore.setState({
    favouriteIds: [],
    favourites: [],
    status: 'ready',
    pendingIds: new Set(),
  })
  useAuthStore.setState({ status: 'anonymous', userData: null })
})

describe('FavouritesPage', () => {
  it('shows FavouritesEmpty when no favourites', () => {
    jest
      .spyOn(useFavouritesStore.getState(), 'hydrate')
      .mockResolvedValue(undefined)
    act(() => {
      render(<FavouritesPage />)
    })
    expect(screen.getByText('FavouritesEmpty')).toBeInTheDocument()
  })

  it('shows FavouritesFull when favourites exist', () => {
    useFavouritesStore.setState({
      favouriteIds: ['p1'],
      favourites: [
        {
          id: 'p1',
          name: 'Coffee',
          description: '',
          price: 10,
          quantity: 1,
          active: true,
          productFileUrl: null,
          averageRating: 0,
          reviewsCount: 0,
          brandName: 'b',
          sellerName: 's',
        },
      ],
      status: 'ready',
      pendingIds: new Set(),
    })
    jest
      .spyOn(useFavouritesStore.getState(), 'hydrate')
      .mockResolvedValue(undefined)
    act(() => {
      render(<FavouritesPage />)
    })
    expect(screen.getByText('FavouritesFull')).toBeInTheDocument()
  })

  it('shows loader before hydration completes', () => {
    const slowPersist = {
      hasHydrated: () => false,
      onFinishHydration: jest.fn(() => jest.fn()),
    }

    ;(
      useFavouritesStore as unknown as { persist: typeof slowPersist }
    ).persist = slowPersist
    render(<FavouritesPage />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
    // restore
    ;(
      useFavouritesStore as unknown as { persist: typeof mockPersist }
    ).persist = mockPersist
  })

  it('does not crash when persist API is unavailable during prerender', () => {
    ;(
      useFavouritesStore as unknown as { persist?: typeof mockPersist }
    ).persist = undefined

    jest
      .spyOn(useFavouritesStore.getState(), 'hydrate')
      .mockResolvedValue(undefined)

    expect(() => render(<FavouritesPage />)).not.toThrow()
    expect(screen.getByText('FavouritesEmpty')).toBeInTheDocument()

    ;(
      useFavouritesStore as unknown as { persist: typeof mockPersist }
    ).persist = mockPersist
  })

  it('keeps showing the loader while auth bootstrap is still loading', () => {
    useAuthStore.setState({ status: 'loading', userData: null })
    jest
      .spyOn(useFavouritesStore.getState(), 'hydrate')
      .mockResolvedValue(undefined)

    render(<FavouritesPage />)

    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.queryByText('FavouritesEmpty')).not.toBeInTheDocument()
  })
})
