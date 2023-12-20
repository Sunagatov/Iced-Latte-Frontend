// DollarPrice.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import DollarPrice from '../utility/DollarPrice'

describe('DollarPrice', () => {
  it('should render the total price in the correct format', () => {
    render(<DollarPrice />)

    const formattedTotalPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(0) // Assuming initial total price is 0 in your case

    expect(screen.getByText(formattedTotalPrice)).toBeInTheDocument()
  })
})
