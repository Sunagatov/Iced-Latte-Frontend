'use client'
import { useState } from 'react'
import { useProducts } from '@/features/products/hooks'
import { sortOptions } from '@/features/products/constants'
import Loader from '@/shared/components/Loader/Loader'
import Dropdown from '@/shared/components/Dropdown/Dropdown'
import ScrollUpBtn from '@/shared/components/Buttons/ScrollUpBtn/ScrollUpBtn'
import { twMerge } from 'tailwind-merge'
import FilterSidebar from '@/features/products/components/FilterSidebar/FilterSidebar'
import MobileFilterSidebar from '@/features/products/components/FilterSidebar/MobileFilterSidebar'
import Filters from '@/features/products/components/FilterSidebar/Filters'
import { defaultProductsFilters, useProductFiltersStore } from '@/features/products/store'
import { ISortParams } from '@/shared/types/ISortParams'
import { IOption } from '@/shared/types/Dropdown'
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
    toPriceFilter,
    fromPriceFilter,
    selectedBrandOptions,
    selectedSellerOptions,
    selectedSortOption,
    ratingFilter,
    searchQuery,
    updateProductFiltersStore,
  } = useProductFiltersStore()

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const {
    data: products,
    fetchNext,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  } = useProducts(
    selectedSortOption,
    selectedBrandOptions,
    selectedSellerOptions,
    toPriceFilter,
    fromPriceFilter,
    ratingFilter,
    searchQuery,
  )

  function handleSelectSortOption(selectedOption: IOption<ISortParams>) {
    updateProductFiltersStore({
      selectedSortOption: selectedOption,
    })
  }

  const handleFilterClick = () => {
    setIsMobileFilterOpen((prev) => !prev)
  }

  const handleCloseMobileFilter = () => {
    setIsMobileFilterOpen(false)
  }

  const isShowLoadMoreBtn = hasNextPage && !isFetchingNextPage

  return (
    <section
      id="catalog"
      className={twMerge(
        'mx-4 mt-2 text-center min-[1124px]:mt-4',
        !isShowLoadMoreBtn ? 'mb-14' : '',
      )}
    >
      <div
        className={
          'mx-auto flex max-w-[716px] flex-col items-center text-left min-[1100px]:max-w-[1014px] min-[1440px]:max-w-[1384px]'
        }
      >
        <div className="sticky top-[64px] z-[9] mb-6 w-full bg-white/80 py-3 backdrop-blur-md">
          {/* Row 1: title + filter btn + sort */}
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 flex-col">
              <p className="text-xs font-medium text-brand">Our Collection</p>
              <h1 className="text-2XL font-bold tracking-tight text-primary min-[1124px]:text-3XL">
                {searchQuery ? `"${searchQuery}"` : 'All Coffee'}
              </h1>
            </div>
            <button
              id="filter-btn"
              onClick={handleFilterClick}
              className="ml-auto block shrink-0 cursor-pointer text-L font-medium text-brand min-[1100px]:hidden"
            >
              Filter
            </button>
            {/* Mobile: compact icon-only sort */}
            <Dropdown<ISortParams>
              id="productDropdownMobile"
              className="shrink-0 min-[1100px]:hidden"
              options={sortOptions}
              onChange={handleSelectSortOption}
              selectedOption={selectedSortOption}
              compact
            />
            {/* Desktop: full sort label */}
            <Dropdown<ISortParams>
              id="productDropdown"
              className="hidden shrink-0 min-[1100px]:ml-auto min-[1100px]:block"
              options={sortOptions}
              onChange={handleSelectSortOption}
              selectedOption={selectedSortOption}
            />
          </div>
          {/* Row 2: active filter chips (only when present) */}
          {(searchQuery || selectedBrandOptions.length > 0 || (ratingFilter && ratingFilter !== 'any')) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {searchQuery && (
                <span className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                  🔍 {searchQuery}
                  <button onClick={() => updateProductFiltersStore({ searchQuery: '' })} className="ml-1 hover:opacity-70">✕</button>
                </span>
              )}
              {selectedBrandOptions.map((b) => (
                <span key={b} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                  {b}
                  <button onClick={() => updateProductFiltersStore({ selectedBrandOptions: selectedBrandOptions.filter((x) => x !== b) })} className="hover:opacity-70">✕</button>
                </span>
              ))}
              {ratingFilter && ratingFilter !== 'any' && (
                <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                  {'⭐'.repeat(Number(ratingFilter))}+
                  <button onClick={() => updateProductFiltersStore({ ratingFilter: null })} className="hover:opacity-70">✕</button>
                </span>
              )}
            </div>
          )}
        </div>
        <div className=" flex w-full justify-center gap-x-8 ">
          <FilterSidebar className=" sticky top-[180px] hidden max-h-[calc(100vh-150px)] overflow-y-auto min-[1100px]:block ">
            <Filters brands={brands} sellers={sellers} />
          </FilterSidebar>
          {isMobileFilterOpen && (
            <MobileFilterSidebar
              onClose={handleCloseMobileFilter}
              className="overflow-y-auto  min-[1100px]:hidden"
            >
              <Filters brands={brands} sellers={sellers} />
            </MobileFilterSidebar>
          )}
          <ProductList
            products={products}
            error={error}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onResetFilters={() => updateProductFiltersStore(defaultProductsFilters)}
            onSuggestionClick={(q) => updateProductFiltersStore({ searchQuery: q })}
          />
        </div>
        {isShowLoadMoreBtn && (
          <button
            className={'m-3 mt-[24px] h-[54px] w-[160px] rounded-[46px] border-2 border-brand-solid text-L font-semibold text-brand-solid shadow-sm transition-all duration-200 hover:bg-brand-solid hover:text-white hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid focus-visible:ring-offset-2'}
            onClick={() => {
              fetchNext().catch((e) => console.log(e))
            }}
          >
            Show more
          </button>
        )}
        {isFetchingNextPage && (
          <div className={'mt-[24px] flex h-[54px] items-center'}>
            <Loader />
          </div>
        )}
        <ScrollUpBtn />
      </div>
    </section>
  )
}
