import { IProductsList } from './types'
import { getAllProducts } from './api'
import useSWRInfinite from 'swr/infinite'
import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'
import { StarsType } from './store'
import { useMediaQuery } from 'usehooks-ts'
import { AxiosError } from 'axios'

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
    if (previousData && previousData.totalPages - 1 == previousData.page) return null
    const ratingQuery = ratingFilter !== null && ratingFilter !== 'any' ? ratingFilter : null
    const params = new URLSearchParams({
      page: String(pageIndex),
      size: String(productSize),
      sort_attribute: sortAttribute,
      sort_direction: sortDirection,
    })
    if (brandNames) params.set('brand_names', brandNames)
    if (ratingQuery) params.set('minimum_average_rating', String(ratingQuery))
    if (sellerNames) params.set('seller_names', sellerNames)
    if (fromPriceFilter) params.set('min_price', fromPriceFilter)
    if (toPriceFilter) params.set('max_price', toPriceFilter)
    if (searchQuery) params.set('keyword', searchQuery)
    return `products?${params}`
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<IProductsList, AxiosError>(
    getKey,
    (key: string) => getAllProducts(key),
    {
      initialSize: 1,
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        const status = err?.response?.status

        if (status && status >= 400) return
        if (retryCount >= 3) return
        setTimeout(() => { void revalidate({ retryCount }) }, 5000)
      },
    },
  )

  const totalPages = data?.[0]?.totalPages ?? 0
  const fetchNext = () => setSize((size) => size + 1)
  const flattenProducts = Array.from(
    new Map((data?.flatMap((page) => page.products ?? []) ?? []).map((p) => [p.id, p])).values(),
  )

  return {
    data: flattenProducts,
    fetchNext,
    hasNextPage: size < totalPages,
    isLoading,
    isFetchingNextPage: size > 0 && data && typeof data[size - 1] === 'undefined',
    error,
  }
}
