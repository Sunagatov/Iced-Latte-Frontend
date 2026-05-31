import { render, screen } from '@testing-library/react'
import FavoriteCartStepper from '@/features/favorites/components/FavoriteCartStepper'

describe('FavoriteCartStepper', () => {
  it('disables the add button when disabled with no cart quantity', () => {
    render(
      <FavoriteCartStepper
        disabled
        onAdd={jest.fn()}
        onRemove={jest.fn()}
        onRemoveAll={jest.fn()}
        quantity={0}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeDisabled()
  })

  it('disables quantity controls when disabled with existing cart quantity', () => {
    render(
      <FavoriteCartStepper
        disabled
        onAdd={jest.fn()}
        onRemove={jest.fn()}
        onRemoveAll={jest.fn()}
        quantity={2}
      />,
    )

    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled()
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled()
  })
})
