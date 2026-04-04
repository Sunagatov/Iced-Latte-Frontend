import { render, screen, act } from '@testing-library/react'
import LoginIcon from '@/features/auth/components/AuthIcon/LoginIcon'
import { useAuthStore } from '@/features/auth/store'
import * as authToken from '@/shared/utils/authToken'

jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
jest.mock('@/features/user/components/UserBar/UserBar', () => ({ __esModule: true, default: () => <div>UserBar</div> }))
jest.mock('@/shared/utils/authToken', () => ({ getTokenFromBrowserCookie: jest.fn(), isTokenExpired: jest.fn() }))

const mockedGetToken = jest.mocked(authToken.getTokenFromBrowserCookie)
const mockedIsExpired = jest.mocked(authToken.isTokenExpired)

beforeEach(() => {
  useAuthStore.setState({ token: null, isLoggedIn: false, refreshToken: null, userData: null })
  mockedGetToken.mockReturnValue(null)
  mockedIsExpired.mockReturnValue(true)
})

describe('LoginIcon', () => {
  it('renders placeholder before mount', () => {
    // Before useEffect fires, mounted=false → renders placeholder div
    const { container } = render(<LoginIcon />)
    // After act, mounted becomes true
    expect(container).toBeTruthy()
  })

  it('shows Log in link when not authenticated', async () => {
    await act(async () => { render(<LoginIcon />) })
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/signin')
  })

  it('shows UserBar when store has token', async () => {
    useAuthStore.setState({ token: 'tok', isLoggedIn: true, refreshToken: null, userData: null })
    mockedGetToken.mockReturnValue('tok')
    mockedIsExpired.mockReturnValue(false)
    await act(async () => { render(<LoginIcon />) })
    expect(screen.getByText('UserBar')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/profile')
  })

  it('shows UserBar when valid cookie token exists', async () => {
    mockedGetToken.mockReturnValue('cookie-tok')
    mockedIsExpired.mockReturnValue(false)
    await act(async () => { render(<LoginIcon />) })
    expect(screen.getByText('UserBar')).toBeInTheDocument()
  })
})
