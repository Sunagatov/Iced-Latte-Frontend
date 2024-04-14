import { IProductsList } from '@/types/Products'
import { getAllProducts } from '@/services/apiService'
import useSWRInfinite from 'swr/infinite'
import { IOption } from '@/types/Dropdown'
import { IProductSortParams } from '@/types/ProductSortParams'

export function useProducts(sortOption: IOption<IProductSortParams>) {
  const { sortAttribute, sortDirection } = sortOption.value

  const getKey = (pageIndex: number, previousData: IProductsList) => {
    if (previousData && previousData.totalPages - 1 == previousData.page)
      return null

    return `products?page=${pageIndex}&size=6&sort_attribute=${sortAttribute}&sort_direction=${sortDirection}`
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<
    IProductsList,
    Error
  >(getKey, getAllProducts, {
    initialSize: 1,
  })

  const totalPages = data?.[0]?.totalPages ?? 0

  const fetchNext = () => setSize((size) => size + 1)
  const flattenProducts = data?.flatMap((page) => page.products!) ?? []
  const hasNextPage = size < totalPages

  const isFetchingNextPage =
    (isLoading && !error) || // initial loading
    (size > 0 && data && typeof data[size - 1] === 'undefined')

  return {
    data: flattenProducts,
    fetchNext,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  }
}
