import { render, screen } from '@testing-library/react'
import Price from '../../src/components/UI/Price/Price'

describe('Price', () => {
  it('should render the total price in the correct format', () => {
    render(<Price amount={10} />)

    expect(screen.getByText('$10.00')).toBeInTheDocument()
  })
})
