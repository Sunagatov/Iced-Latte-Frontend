import { render, screen } from '@testing-library/react'
import Hero from '@/features/home/components/Hero'

jest.mock('@/features/products/components/search/SearchBar', () => ({
  __esModule: true,
  default: () => <div data-testid="hero-search" />,
}))

describe('Hero', () => {
  it('links to the catalog section without requiring imperative scroll code', () => {
    render(<Hero />)

    expect(screen.getByTestId('hero-search')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse collection/i }))
      .toHaveAttribute('href', '/#catalog')
  })
})
