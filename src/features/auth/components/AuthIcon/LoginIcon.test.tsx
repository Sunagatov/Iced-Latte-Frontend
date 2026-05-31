import { render, screen, act } from '@testing-library/react'
import LoginIcon from '@/features/auth/components/AuthIcon/LoginIcon'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={href}>{children}</a>,
}))
const mockUseAuthStore = jest.fn()

jest.mock('@/features/auth/store', () => ({
  useAuthStore: (selector: (s: {
    isLoggedIn: boolean
    userData: { firstName: string; lastName: string } | null
  }) => unknown) =>
    mockUseAuthStore(selector),
}))

beforeEach(() => {
  mockUseAuthStore.mockImplementation(
    (selector: (s: {
      isLoggedIn: boolean
      userData: { firstName: string; lastName: string } | null
    }) => unknown) =>
      selector({ isLoggedIn: false, userData: null }),
  )
})

describe('LoginIcon', () => {
  it('renders placeholder before mount', () => {
    const { container } = render(<LoginIcon />)

    expect(container).toBeTruthy()
  })

  it('shows Log in link when not authenticated', async () => {
    await act(async () => {
      render(<LoginIcon />)
    })
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute(
      'href',
      '/signin',
    )
  })

  it('shows user initials when authenticated', async () => {
    mockUseAuthStore.mockImplementation(
      (selector: (s: {
        isLoggedIn: boolean
        userData: { firstName: string; lastName: string } | null
      }) => unknown) =>
        selector({
          isLoggedIn: true,
          userData: { firstName: 'Jane', lastName: 'Latte' },
        }),
    )
    await act(async () => {
      render(<LoginIcon />)
    })
    expect(screen.getByText('JL')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/profile')
  })
})
