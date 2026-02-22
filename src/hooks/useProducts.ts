import { IProductsList } from '@/types/Products'
import { getAllProducts } from '@/services/apiService'
import useSWRInfinite from 'swr/infinite'
import { ISortParams } from '@/types/ISortParams'
import { IOption } from '@/types/Dropdown'
import { StarsType } from '@/components/Product/ProductRatingFilter/ProductRatingFilter'
import { useMediaQuery } from 'usehooks-ts'

export function useProducts(
  sortOption: IOption<ISortParams>,
  brandOptions: string[],
  sellerOptions: string[],
  toPriceFilter: string,
  fromPriceFilter: string,
  ratingFilter: null | 'any' | StarsType,
  searchQuery: string,
) {
  const { sortAttribute, sortDirection } = sortOption.value
  const brandNames = brandOptions.join(',') || ''
  const sellerNames = sellerOptions.join(',') || ''

  const isMediaQuery = useMediaQuery('(min-width: 1440px)')

  const productSize = isMediaQuery ? 8 : 6

  const getKey = (pageIndex: number, previousData: IProductsList) => {
    if (previousData && previousData.totalPages - 1 == previousData.page)
      return null

    const ratingQuery =
      ratingFilter !== null && ratingFilter !== 'any' ? ratingFilter : null

    return `products?page=${pageIndex}&size=${productSize}&sort_attribute=${sortAttribute}&sort_direction=${sortDirection}${brandNames && '&brand_names=' + brandNames}${ratingQuery ? '&minimum_average_rating=' + ratingQuery : ''}${sellerNames && '&seller_names=' + sellerNames}${fromPriceFilter && '&min_price=' + fromPriceFilter}${toPriceFilter && '&max_price=' + toPriceFilter}${searchQuery ? '&keyword=' + encodeURIComponent(searchQuery) : ''}`
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<
    IProductsList,
    Error
  >(getKey, getAllProducts, {
    initialSize: 1,
  })

  const totalPages = data?.[0]?.totalPages ?? 0

  const fetchNext = () => setSize((size) => size + 1)
  const flattenProducts = Array.from(
    new Map(
      (data?.flatMap((page) => page.products!) ?? []).map((p) => [p.id, p])
    ).values()
  )
  const hasNextPage = size < totalPages

  const isFetchingNextPage =
    size > 0 && data && typeof data[size - 1] === 'undefined'

  return {
    data: flattenProducts,
    fetchNext,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  }
}
