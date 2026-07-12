import type { IProduct, IProductsList } from '@/features/products/types'
import type { IOption } from '@/shared/types/Dropdown'
import type { ISortParams } from '@/shared/types/ISortParams'
import type { StarsType } from './store'

type CatalogFilters = {
  brandOptions: string[]
  fromPriceFilter: string
  pageIndex: number
  productSize: number
  ratingFilter: null | 'any' | StarsType
  searchQuery: string
  sellerOptions: string[]
  sortOption: IOption<ISortParams>
  toPriceFilter: string
}

export function buildCatalogProductsPath({
  brandOptions,
  fromPriceFilter,
  pageIndex,
  productSize,
  ratingFilter,
  searchQuery,
  sellerOptions,
  sortOption,
  toPriceFilter,
}: CatalogFilters): string {
  const { sortAttribute, sortDirection } = sortOption.value
  const params = new URLSearchParams({
    page: String(pageIndex),
    size: String(productSize),
    sort_attribute: String(sortAttribute),
    sort_direction: String(sortDirection),
  })

  const brandNames = brandOptions.join(',')
  const sellerNames = sellerOptions.join(',')

  if (brandNames) params.set('brand_names', brandNames)
  if (ratingFilter) params.set('minimum_average_rating', String(ratingFilter))
  if (sellerNames) params.set('seller_names', sellerNames)
  if (fromPriceFilter) params.set('min_price', fromPriceFilter)
  if (toPriceFilter) params.set('max_price', toPriceFilter)
  if (searchQuery) params.set('keyword', searchQuery)

  return `products?${params}`
}

export function buildAutocompleteProductsPath(
  keyword: string,
  size: number,
): string {
  return `products?page=0&size=${size}&sort_attribute=name&sort_direction=asc&keyword=${encodeURIComponent(keyword)}`
}

export function flattenProductPages(
  pages: IProductsList[] | undefined,
): IProduct[] {
  return Array.from(
    new Map(
      (pages?.flatMap((page) => page.products ?? []) ?? []).map((product) => [
        product.id,
        product,
      ]),
    ).values(),
  )
}
