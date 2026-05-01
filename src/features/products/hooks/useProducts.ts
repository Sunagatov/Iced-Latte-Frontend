import { AxiosError } from 'axios'
import useSWRInfinite from 'swr/infinite'
import { useMediaQuery } from 'usehooks-ts'
import { getAllProducts } from '@/features/products/api'
import { type StarsType } from '@/features/products/store'
import type { IProductsList } from '@/features/products/types'
import type { IOption } from '@/shared/types/Dropdown'
import type { ISortParams } from '@/shared/types/ISortParams'

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
  const isWideScreen = useMediaQuery('(min-width: 1440px)')
  const productSize = isWideScreen ? 8 : 6

  const getKey = (pageIndex: number, previousData: IProductsList) => {
    if (previousData && previousData.totalPages - 1 === previousData.page) {
      return null
    }

    const params = new URLSearchParams({
      page: String(pageIndex),
      size: String(productSize),
      sort_attribute: String(sortAttribute),
      sort_direction: String(sortDirection),
    })

    if (brandNames) params.set('brand_names', brandNames)
    if (ratingFilter) {
      params.set('minimum_average_rating', String(ratingFilter))
    }
    if (sellerNames) params.set('seller_names', sellerNames)
    if (fromPriceFilter) params.set('min_price', fromPriceFilter)
    if (toPriceFilter) params.set('max_price', toPriceFilter)
    if (searchQuery) params.set('keyword', searchQuery)

    return `products?${params}`
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<
    IProductsList,
    AxiosError
  >(getKey, (key: string) => getAllProducts(key), {
    initialSize: 1,
    onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
      const status = err?.response?.status

      if (status && status >= 400) return
      if (retryCount >= 3) return

      setTimeout(() => {
        void revalidate({ retryCount })
      }, 5000)
    },
  })

  const totalPages = data?.[0]?.totalPages ?? 0
  const flattenProducts = Array.from(
    new Map(
      (data?.flatMap((page) => page.products ?? []) ?? []).map((product) => [
        product.id,
        product,
      ]),
    ).values(),
  )

  return {
    data: flattenProducts,
    error,
    fetchNext: () => setSize((currentSize) => currentSize + 1),
    hasNextPage: size < totalPages,
    isFetchingNextPage: Boolean(
      size > 0 && data && typeof data[size - 1] === 'undefined',
    ),
    isLoading,
  }
}
