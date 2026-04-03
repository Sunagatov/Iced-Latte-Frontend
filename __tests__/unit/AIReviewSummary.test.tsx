import { render, screen, fireEvent } from '@testing-library/react'
import AIReviewSummary from '@/features/reviews/components/AIReviewSummary/AIReviewSummary'

describe('AIReviewSummary', () => {
  it('renders short summary without expand button', () => {
    render(<AIReviewSummary summary="Great coffee." reviewsCount={5} />)
    expect(screen.getByText('Great coffee.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /more/i })).not.toBeInTheDocument()
  })

  it('truncates long summary and shows more/less toggle', () => {
    const long = 'a'.repeat(200)
    render(<AIReviewSummary summary={long} reviewsCount={10} />)
    expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /more/i }))
    expect(screen.getByRole('button', { name: /less/i })).toBeInTheDocument()
  })

  it('shows correct review count', () => {
    render(<AIReviewSummary summary="Good." reviewsCount={1} />)
    expect(screen.getByText('1 review')).toBeInTheDocument()
  })

  it('pluralises reviews count', () => {
    render(<AIReviewSummary summary="Good." reviewsCount={3} />)
    expect(screen.getByText('3 reviews')).toBeInTheDocument()
  })
})
