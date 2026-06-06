import { act, fireEvent, render, screen } from '@testing-library/react'
import type * as React from 'react'
import Header from '@/app/layout/Header'

let pathname = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

jest.mock('@/features/products/components/search/SearchBar', () => ({
  __esModule: true,
  default: ({ autoFocus }: { autoFocus?: boolean }) => (
    <input
      aria-label={autoFocus ? 'Mobile search products' : 'Search products'}
    />
  ),
}))

jest.mock('@/features/favorites/components/HeaderHeart', () => ({
  __esModule: true,
  default: () => <a href="/favourites">Favourites</a>,
}))

jest.mock('@/features/cart/components/CartButton', () => ({
  __esModule: true,
  default: () => <a href="/cart">Cart</a>,
}))

jest.mock('@/features/auth/components/AuthIcon/LoginIcon', () => ({
  __esModule: true,
  default: () => <a href="/signin">Log in</a>,
}))

function setHeroIntersection(isIntersecting: boolean): void {
  const callback = jest.mocked(IntersectionObserver).mock.calls[0][0]

  act(() => {
    callback(
      [{ isIntersecting }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    )
  })
}

describe('Header', () => {
  beforeEach(() => {
    pathname = '/'
    document.body.innerHTML = '<section id="hero"></section>'
    global.IntersectionObserver = jest.fn((_callback) => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      takeRecords: jest.fn(),
      unobserve: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    })) as unknown as typeof IntersectionObserver
  })

  it('shows desktop search after the home hero leaves the viewport', () => {
    render(<Header />)

    setHeroIntersection(false)

    expect(screen.getByLabelText('Search products')).toBeInTheDocument()
  })

  it('opens and closes mobile search', () => {
    render(<Header />)
    setHeroIntersection(false)

    fireEvent.click(screen.getByRole('button', { name: 'Open search' }))

    expect(screen.getByLabelText('Mobile search products')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(
      screen.queryByLabelText('Mobile search products'),
    ).not.toBeInTheDocument()
  })

  it('closes mobile search after navigation', () => {
    const { rerender } = render(<Header />)

    setHeroIntersection(false)
    fireEvent.click(screen.getByRole('button', { name: 'Open search' }))
    expect(screen.getByLabelText('Mobile search products')).toBeInTheDocument()

    pathname = '/cart'
    rerender(<Header />)

    expect(
      screen.queryByLabelText('Mobile search products'),
    ).not.toBeInTheDocument()
  })
})
