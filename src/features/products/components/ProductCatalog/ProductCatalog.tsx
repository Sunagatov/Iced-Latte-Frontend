'use client'
import ScrollUpBtn from '@/shared/ui/Buttons/ScrollUpBtn/ScrollUpBtn'
import { twMerge } from 'tailwind-merge'
import FilterSidebar from '@/features/products/components/FilterSidebar/FilterSidebar'
import MobileFilterSidebar from '@/features/products/components/FilterSidebar/MobileFilterSidebar'
import Filters from '@/features/products/components/FilterSidebar/Filters'
import { useProductCatalogViewModel } from '@/features/products/hooks/useProductCatalogViewModel'
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
  const {
    filters,
    handleCloseMobileFilter,
    handleLoadMore,
    handleSelectSortOption,
    hasActiveChips,
    hasPriceFilter,
    isMobileFilterOpen,
    isShowLoadMoreButton,
    loadMoreError,
    priceChipLabel,
    productsQuery,
    resetAllFilters,
    selectedSortOption,
    setSearchQuery,
    toggleMobileFilter,
    updateFilters,
  } = useProductCatalogViewModel()

  return (
    <section
      id="catalog"
      className={twMerge(
        'mx-4 mt-2 text-center min-[1124px]:mt-4',
        !isShowLoadMoreButton ? 'mb-14' : '',
      )}
    >
      <div
        className={
          'mx-auto flex max-w-[716px] flex-col items-center text-left min-[1100px]:max-w-[1014px] min-[1440px]:max-w-[1384px]'
        }
      >
        <div className="sticky top-[64px] z-[9] mb-6 w-full bg-white/80 py-3 backdrop-blur-md">
          <CatalogToolbar
            isMobileFilterOpen={isMobileFilterOpen}
            onSelectSortOption={handleSelectSortOption}
            onToggleMobileFilter={toggleMobileFilter}
            searchQuery={filters.searchQuery}
            selectedSortOption={selectedSortOption}
          />

          {hasActiveChips && (
            <ActiveFilterChips
              hasPriceFilter={hasPriceFilter}
              priceChipLabel={priceChipLabel}
              ratingFilter={filters.ratingFilter}
              searchQuery={filters.searchQuery}
              selectedBrandOptions={filters.selectedBrandOptions}
              selectedSellerOptions={filters.selectedSellerOptions}
              updateFilters={updateFilters}
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
              onClose={handleCloseMobileFilter}
              className="overflow-y-auto min-[1100px]:hidden"
            >
              <Filters brands={brands} sellers={sellers} />
            </MobileFilterSidebar>
          )}
          <ProductList
            products={productsQuery.data}
            error={productsQuery.error}
            isLoading={productsQuery.isLoading}
            searchQuery={filters.searchQuery}
            onResetFilters={resetAllFilters}
            onSuggestionClick={setSearchQuery}
          />
        </div>

        <LoadMoreControl
          isFetchingNextPage={productsQuery.isFetchingNextPage}
          isVisible={isShowLoadMoreButton}
          loadMoreError={loadMoreError}
          onLoadMore={handleLoadMore}
        />
        <ScrollUpBtn />
      </div>
    </section>
  )
}
