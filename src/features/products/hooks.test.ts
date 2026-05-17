import type { IProductsList } from '@/features/products/types'
import {
  buildAutocompleteProductsPath,
  buildCatalogProductsPath,
  flattenProductPages,
} from '@/features/products/catalogQuery'

const sortOption = {
  isDefault: true,
  label: 'Default',
  value: { sortAttribute: 'name', sortDirection: 'asc' as const },
}

function makeProduct(id: string) {
  return {
    id,
    name: 'p',
    description: '',
    price: 10,
    quantity: 1,
    active: true,
    productFileUrl: null,
    averageRating: 0,
    reviewsCount: 0,
    brandName: 'b',
    sellerName: 's',
  }
}

describe('catalogQuery', () => {
  it('deduplicates products across pages', () => {
    const p = makeProduct('p1')
    const pages: IProductsList[] = [
      { products: [p], page: 0, totalPages: 2, totalElements: 1, size: 6 },
      { products: [p], page: 1, totalPages: 2, totalElements: 1, size: 6 },
    ]

    expect(flattenProductPages(pages)).toHaveLength(1)
  })

  it('includes brand and seller in catalog query', () => {
    const key = buildCatalogProductsPath({
      brandOptions: ['BrandA'],
      fromPriceFilter: '',
      pageIndex: 0,
      productSize: 6,
      ratingFilter: null,
      searchQuery: '',
      sellerOptions: ['SellerX'],
      sortOption,
      toPriceFilter: '',
    })

    expect(key).toContain('brand_names=BrandA')
    expect(key).toContain('seller_names=SellerX')
  })

  it('includes size and sort in catalog query', () => {
    const key = buildCatalogProductsPath({
      brandOptions: [],
      fromPriceFilter: '',
      pageIndex: 0,
      productSize: 8,
      ratingFilter: null,
      searchQuery: '',
      sellerOptions: [],
      sortOption,
      toPriceFilter: '',
    })

    expect(key).toContain('size=8')
    expect(key).toContain('sort_attribute=name')
    expect(key).toContain('sort_direction=asc')
  })

  it('includes price, rating, and keyword in catalog query', () => {
    const key = buildCatalogProductsPath({
      brandOptions: [],
      fromPriceFilter: '10',
      pageIndex: 0,
      productSize: 6,
      ratingFilter: 4,
      searchQuery: 'latte',
      sellerOptions: [],
      sortOption,
      toPriceFilter: '40',
    })

    expect(key).toContain('min_price=10')
    expect(key).toContain('max_price=40')
    expect(key).toContain('minimum_average_rating=4')
    expect(key).toContain('keyword=latte')
  })

  it('builds autocomplete query with encoded keyword', () => {
    expect(buildAutocompleteProductsPath('ice latte', 6)).toBe(
      'products?page=0&size=6&sort_attribute=name&sort_direction=asc&keyword=ice%20latte',
    )
  })
})
