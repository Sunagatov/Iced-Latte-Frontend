import { render, screen, act } from '@testing-library/react'
import type * as React from 'react'
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

jest.mock('@/features/auth/public', () => ({
  useAuthStore: (selector: (s: {
    status: 'loading' | 'anonymous' | 'authenticated'
    isLoggedIn: boolean
    userData: { firstName: string; lastName: string } | null
  }) => unknown) =>
    mockUseAuthStore(selector),
}))

beforeEach(() => {
  mockUseAuthStore.mockImplementation(
    (selector: (s: {
      status: 'loading' | 'anonymous' | 'authenticated'
      isLoggedIn: boolean
      userData: { firstName: string; lastName: string } | null
    }) => unknown) =>
      selector({ status: 'anonymous', isLoggedIn: false, userData: null }),
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
        status: 'loading' | 'anonymous' | 'authenticated'
        isLoggedIn: boolean
        userData: { firstName: string; lastName: string } | null
      }) => unknown) =>
        selector({
          status: 'authenticated',
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

  it('keeps the placeholder while auth bootstrap is still loading', async () => {
    mockUseAuthStore.mockImplementation(
      (selector: (s: {
        status: 'loading' | 'anonymous' | 'authenticated'
        isLoggedIn: boolean
        userData: { firstName: string; lastName: string } | null
      }) => unknown) =>
        selector({
          status: 'loading',
          isLoggedIn: false,
          userData: null,
        }),
    )

    const { container } = render(<LoginIcon />)

    await act(async () => {})

    expect(screen.queryByText('Log in')).not.toBeInTheDocument()
    expect(container.querySelector('a')).toBeNull()
  })
})
