'use client'

import { useState } from 'react'
import { useProducts } from '@/features/products/hooks/useProducts'
import {
  defaultProductsFilters,
  type StarsType,
  useProductFiltersStore,
} from '@/features/products/store'
import type { IOption } from '@/shared/types/Dropdown'
import type { ISortParams } from '@/shared/types/ISortParams'

type ProductFiltersSlice = {
  fromPriceFilter?: string
  ratingFilter?: StarsType | null
  searchQuery?: string
  selectedBrandOptions?: string[]
  selectedSellerOptions?: string[]
  selectedSortOption?: IOption<ISortParams>
  toPriceFilter?: string
}

type ProductCatalogViewModel = {
  filters: {
    fromPriceFilter: string
    ratingFilter: StarsType | null
    searchQuery: string
    selectedBrandOptions: string[]
    selectedSellerOptions: string[]
    toPriceFilter: string
  }
  handleCloseMobileFilter: () => void
  handleLoadMore: () => void
  handleSelectSortOption: (selectedOption: IOption<ISortParams>) => void
  hasActiveChips: boolean
  hasPriceFilter: boolean
  isMobileFilterOpen: boolean
  isShowLoadMoreButton: boolean
  loadMoreError: boolean
  priceChipLabel: string
  productsQuery: ReturnType<typeof useProducts>
  resetAllFilters: () => void
  selectedSortOption: IOption<ISortParams>
  setSearchQuery: (query: string) => void
  toggleMobileFilter: () => void
  updateFilters: (slice: Partial<ProductFiltersSlice>) => void
}

export function useProductCatalogViewModel(): ProductCatalogViewModel {
  const toPriceFilter = useProductFiltersStore((state) => state.toPriceFilter)
  const fromPriceFilter = useProductFiltersStore(
    (state) => state.fromPriceFilter,
  )
  const selectedBrandOptions = useProductFiltersStore(
    (state) => state.selectedBrandOptions,
  )
  const selectedSellerOptions = useProductFiltersStore(
    (state) => state.selectedSellerOptions,
  )
  const selectedSortOption = useProductFiltersStore(
    (state) => state.selectedSortOption,
  )
  const ratingFilter = useProductFiltersStore((state) => state.ratingFilter)
  const searchQuery = useProductFiltersStore((state) => state.searchQuery)
  const updateFilters = useProductFiltersStore(
    (state) => state.updateProductFiltersStore,
  )

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)

  const productsQuery = useProducts(
    selectedSortOption,
    selectedBrandOptions,
    selectedSellerOptions,
    toPriceFilter,
    fromPriceFilter,
    ratingFilter,
    searchQuery,
  )

  const hasPriceFilter = fromPriceFilter !== '' || toPriceFilter !== ''
  const priceChipLabel =
    fromPriceFilter && toPriceFilter
      ? `$${fromPriceFilter} – $${toPriceFilter}`
      : fromPriceFilter
        ? `From $${fromPriceFilter}`
        : `Up to $${toPriceFilter}`
  const hasActiveChips =
    Boolean(searchQuery) ||
    selectedBrandOptions.length > 0 ||
    selectedSellerOptions.length > 0 ||
    hasPriceFilter ||
    Boolean(ratingFilter)

  return {
    filters: {
      fromPriceFilter,
      ratingFilter,
      searchQuery,
      selectedBrandOptions,
      selectedSellerOptions,
      toPriceFilter,
    },
    handleCloseMobileFilter: () => setIsMobileFilterOpen(false),
    handleLoadMore: () => {
      setLoadMoreError(false)
      productsQuery.fetchNext().then(undefined, () => setLoadMoreError(true))
    },
    handleSelectSortOption: (selectedOption: IOption<ISortParams>) => {
      updateFilters({ selectedSortOption: selectedOption })
    },
    hasActiveChips,
    hasPriceFilter,
    isMobileFilterOpen,
    isShowLoadMoreButton:
      productsQuery.hasNextPage && !productsQuery.isFetchingNextPage,
    loadMoreError,
    priceChipLabel,
    productsQuery,
    resetAllFilters: () => updateFilters(defaultProductsFilters),
    selectedSortOption,
    setSearchQuery: (query: string) => updateFilters({ searchQuery: query }),
    toggleMobileFilter: () => setIsMobileFilterOpen((previous) => !previous),
    updateFilters,
  }
}
