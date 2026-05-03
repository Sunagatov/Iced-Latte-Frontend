'use client'

import { useState } from 'react'
import { AxiosError } from 'axios'
import useSWRInfinite from 'swr/infinite'
import { twMerge } from 'tailwind-merge'
import { useMediaQuery } from 'usehooks-ts'
import FilterSidebar from '@/features/products/components/FilterSidebar/FilterSidebar'
import Filters from '@/features/products/components/FilterSidebar/Filters'
import MobileFilterSidebar from '@/features/products/components/FilterSidebar/MobileFilterSidebar'
import { getAllProducts } from '@/features/products/api'
import {
  buildCatalogProductsPath,
  flattenProductPages,
} from '@/features/products/catalogQuery'
import {
  useProductFiltersStore,
} from '@/features/products/store'
import type { IProductsList } from '@/features/products/types'
import ScrollUpBtn from '@/shared/ui/Buttons/ScrollUpBtn/ScrollUpBtn'
import ActiveFilterChips from './ActiveFilterChips'
import CatalogToolbar from './CatalogToolbar'
import LoadMoreControl from './LoadMoreControl'
import ProductList from '../ProductList/ProductList'

interface IProductCatalogProps {
  brands: string[]
  sellers: string[]
}

export default function ProductCatalog({
  brands,
  sellers,
}: Readonly<IProductCatalogProps>) {
  const toPriceFilter = useProductFiltersStore((state) => state.toPriceFilter)
  const fromPriceFilter = useProductFiltersStore((state) => state.fromPriceFilter)
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
  const setFilters = useProductFiltersStore((state) => state.setFilters)
  const resetFilters = useProductFiltersStore((state) => state.resetFilters)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const isWideScreen = useMediaQuery('(min-width: 1440px)')
  const productSize = isWideScreen ? 8 : 6

  const { data, error, isLoading, size, setSize } = useSWRInfinite<
    IProductsList,
    AxiosError
  >(
    (pageIndex: number, previousData: IProductsList) => {
      if (previousData && previousData.totalPages - 1 === previousData.page) {
        return null
      }

      return buildCatalogProductsPath({
        brandOptions: selectedBrandOptions,
        fromPriceFilter,
        pageIndex,
        productSize,
        ratingFilter,
        searchQuery,
        sellerOptions: selectedSellerOptions,
        sortOption: selectedSortOption,
        toPriceFilter,
      })
    },
    (key: string) => getAllProducts(key),
    {
      initialSize: 1,
      onErrorRetry: (retryError, _key, _config, revalidate, { retryCount }) => {
        const status = retryError?.response?.status

        if (status && status >= 400) return
        if (retryCount >= 3) return

        setTimeout(() => {
          void revalidate({ retryCount })
        }, 5000)
      },
    },
  )

  const totalPages = data?.[0]?.totalPages ?? 0
  const products = flattenProductPages(data)
  const hasNextPage = size < totalPages
  const isFetchingNextPage = Boolean(
    size > 0 && data && typeof data[size - 1] === 'undefined',
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

  const handleLoadMore = (): void => {
    setLoadMoreError(false)
    setSize((currentSize) => currentSize + 1).then(
      undefined,
      () => setLoadMoreError(true),
    )
  }

  return (
    <section
      id="catalog"
      className={twMerge(
        'mx-4 mb-4 mt-2 scroll-mt-[120px] text-center min-[1124px]:mt-4',
      )}
    >
      <div
        className={
          'mx-auto flex max-w-[716px] flex-col items-center text-left min-[1100px]:max-w-[1014px] min-[1440px]:max-w-[1384px]'
        }
      >
        <div className="sticky top-[56px] z-20 mb-6 w-full bg-[#F8F7F4] py-3 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <CatalogToolbar
            isMobileFilterOpen={isMobileFilterOpen}
            onSelectSortOption={(selectedOption) =>
              setFilters({ selectedSortOption: selectedOption })
            }
            onToggleMobileFilter={() =>
              setIsMobileFilterOpen((previous) => !previous)
            }
            searchQuery={searchQuery}
            selectedSortOption={selectedSortOption}
            totalProducts={data?.[0]?.totalElements}
          />

          {hasActiveChips && (
            <ActiveFilterChips
              hasPriceFilter={hasPriceFilter}
              priceChipLabel={priceChipLabel}
              ratingFilter={ratingFilter}
              searchQuery={searchQuery}
              selectedBrandOptions={selectedBrandOptions}
              selectedSellerOptions={selectedSellerOptions}
              updateFilters={setFilters}
            />
          )}
        </div>

        <div className="flex w-full justify-center gap-x-8">
          <FilterSidebar className="sticky top-[180px] hidden max-h-[calc(100vh-150px)] overflow-y-auto min-[1100px]:block">
            <Filters brands={brands} sellers={sellers} />
          </FilterSidebar>
          {isMobileFilterOpen && (
            <MobileFilterSidebar
              id="mobile-filter-sidebar"
              onClose={() => setIsMobileFilterOpen(false)}
              className="overflow-y-auto min-[1100px]:hidden"
            >
              <Filters brands={brands} sellers={sellers} />
            </MobileFilterSidebar>
          )}
          <ProductList
            products={products}
            error={error}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onResetFilters={resetFilters}
            onSuggestionClick={(query) => setFilters({ searchQuery: query })}
          />
        </div>

        <LoadMoreControl
          isFetchingNextPage={isFetchingNextPage}
          isVisible={hasNextPage && !isFetchingNextPage}
          loadMoreError={loadMoreError}
          onLoadMore={handleLoadMore}
        />
        <ScrollUpBtn />
      </div>
    </section>
  )
}
