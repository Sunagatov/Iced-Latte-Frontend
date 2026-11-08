import { fireEvent, render, screen } from '@testing-library/react'
import ProductList from '@/features/products/components/ProductList'
import type { IProduct } from '@/features/products/types'

jest.mock('@/features/products/components/ProductCard/ProductCard', () => ({
  __esModule: true,
  default: ({ product }: { product: IProduct }) => (
    <li data-testid="product-card">{product.name}</li>
  ),
}))

const makeProduct = (
  id: string,
  productFileUrl: string | null,
): IProduct => ({
  id,
  name: `Product ${id}`,
  description: '',
  price: 10,
  quantity: 1,
  active: true,
  productFileUrl,
  averageRating: 0,
  reviewsCount: 0,
  brandName: 'Brand',
  sellerName: 'Seller',
})

describe('ProductList', () => {
  it('renders products without images alongside products with images', () => {
    render(
      <ProductList
        products={[makeProduct('1', '/coffee.jpg'), makeProduct('2', null)]}
        error={undefined}
        isLoading={false}
      />,
    )

    expect(screen.getAllByTestId('product-card')).toHaveLength(2)
    expect(screen.getByText('Product 2')).toBeInTheDocument()
  })
  it('uses a real price shortcut instead of searching for a price phrase', () => {
    const price = jest.fn(); const search = jest.fn()

    render(<ProductList products={[]} error={undefined} isLoading={false} searchQuery="missing" onPriceSuggestionClick={price} onSuggestionClick={search} />)
    fireEvent.click(screen.getByRole('button', { name: 'Under $20' }))
    expect(price).toHaveBeenCalledTimes(1)
    expect(search).not.toHaveBeenCalled()
  })

})
