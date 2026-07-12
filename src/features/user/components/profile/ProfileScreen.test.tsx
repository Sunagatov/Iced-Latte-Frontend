import { render, screen } from '@testing-library/react'
import ProfileScreen from './ProfileScreen'
import { useAuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}))

jest.mock('@/features/auth/public', () => {
  const actual = jest.requireActual('@/features/auth/store')

  return {
    ...actual,
    useLogout: () => ({
      logout: jest.fn(),
      isLoading: false,
    }),
  }
})

jest.mock('@/features/user/components/ImageUpload', () => ({
  __esModule: true,
  default: () => <div>ImageUpload</div>,
}))

jest.mock('./ProfileAuxiliarySections', () => ({
  __esModule: true,
  ProfileReviewsSection: () => <div>ProfileReviewsSection</div>,
}))

jest.mock('./ProfileNavigation', () => ({
  __esModule: true,
  default: () => <div>ProfileSidebarNavigation</div>,
  ProfileNavigation: () => <div>ProfileNavigation</div>,
}))

jest.mock('./ProfileOverviewSection', () => ({
  __esModule: true,
  default: () => <div>ProfileOverviewSection</div>,
}))

jest.mock('./ProfilePersonalDetailsSection', () => ({
  __esModule: true,
  default: () => <div>ProfilePersonalDetailsSection</div>,
}))

jest.mock('./useProfileOrderCount', () => ({
  useProfileOrderCount: () => 0,
}))

jest.mock('@/features/addresses/public', () => ({
  AddressManager: () => <div>AddressManager</div>,
}))

beforeEach(() => {
  useAuthStore.setState({ status: 'loading', userData: null, isLoggedIn: false })
  useFavouritesStore.setState({
    favouriteIds: [],
    favourites: [],
    status: 'ready',
    pendingIds: new Set(),
  })
})

describe('ProfileScreen', () => {
  it('shows a profile loading state while auth bootstrap is still loading', () => {
    render(<ProfileScreen />)

    expect(screen.getByText('Loading your profile...')).toBeInTheDocument()
    expect(screen.queryByText('ProfileOverviewSection')).not.toBeInTheDocument()
  })
})
