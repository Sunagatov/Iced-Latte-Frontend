import { render, screen } from '@testing-library/react'
import Footer from '@/shared/components/Footer/Footer'

jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />)
    expect(screen.getAllByText(/Iced Latte/i).length).toBeGreaterThan(0)
  })

  it('renders copyright with current year', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument()
  })
})
