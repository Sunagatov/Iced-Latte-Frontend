import { render, screen, act } from '@testing-library/react'
import LoginIcon from '@/features/auth/components/AuthIcon/LoginIcon'

jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
jest.mock('@/features/user/components/UserBar/UserBar', () => ({ __esModule: true, default: () => <div>UserBar</div> }))

const mockUseAuthStore = jest.fn()

jest.mock('@/features/auth/store', () => ({
  useAuthStore: (selector: (_s: { isLoggedIn: boolean }) => unknown) => mockUseAuthStore(selector),
}))

beforeEach(() => {
  mockUseAuthStore.mockImplementation((_selector: (_s: { isLoggedIn: boolean }) => unknown) =>
    _selector({ isLoggedIn: false })
  )
})

describe('LoginIcon', () => {
  it('renders placeholder before mount', () => {
    const { container } = render(<LoginIcon />)

    expect(container).toBeTruthy()
  })

  it('shows Log in link when not authenticated', async () => {
    await act(async () => { render(<LoginIcon />) })
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/signin')
  })

  it('shows UserBar when authenticated', async () => {
    mockUseAuthStore.mockImplementation((_selector: (_s: { isLoggedIn: boolean }) => unknown) =>
      _selector({ isLoggedIn: true })
    )
    await act(async () => { render(<LoginIcon />) })
    expect(screen.getByText('UserBar')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/profile')
  })
})
