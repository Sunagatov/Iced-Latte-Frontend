'use client'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { sortOptions } from '@/constants/productSortOptions'
import Loader from '@/components/UI/Loader/Loader'
import Dropdown from '@/components/UI/Dropdown/Dropdown'
import ScrollUpBtn from '@/components/UI/Buttons/ScrollUpBtn/ScrollUpBtn'
import ProductsFilterLabels from '@/components/Product/ProductsFilterLabels/ProductsFilterLabels'
import { twMerge } from 'tailwind-merge'
import FilterSidebar from '@/components/Product/FilterSidebar/FilterSidebar'
import MobileFilterSidebar from '@/components/Product/FilterSidebar/MobileFilterSidebar'
import Filters from '@/components/Product/FilterSidebar/Filters'
import { useProductFiltersStore } from '@/store/productFiltersStore'
import { ISortParams } from '@/types/ISortParams'
import { IOption } from '@/types/Dropdown'
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
      className={twMerge(
        'mx-4 mt-5 text-center min-[1124px]:mt-16',
        !isShowLoadMoreBtn ? 'mb-14' : '',
      )}
    >
      <div
        className={
          'mx-auto flex max-w-[716px] flex-col items-center text-left min-[1100px]:max-w-[1014px] min-[1440px]:max-w-[1384px]'
        }
      >
        <h1
          className={
            'mb-8 mr-auto text-5XL min-[1124px]:mb-10 min-[1124px]:text-6XL'
          }
        >
          All Coffee
        </h1>
        <div className="sticky top-[80px] z-[9]  mb-32  h-20 w-full items-center justify-between bg-primary">
          <div className=" flex w-full justify-between bg-primary   ">
            <ProductsFilterLabels className=" min-[1100px]:hidden" />
          </div>
          <div className=" mx-auto mb-6  flex w-full items-center justify-between gap-2 bg-primary">
            <ProductsFilterLabels className="hidden min-[1100px]:flex" />
            <button
              id="filter-btn"
              onClick={handleFilterClick}
              className="block cursor-pointer text-L font-medium text-brand min-[1100px]:hidden"
            >
              Filter
            </button>
            <Dropdown<ISortParams>
              id="productDropdown"
              className="ml-auto"
              headerClassName="-mr-6"
              options={sortOptions}
              onChange={handleSelectSortOption}
              selectedOption={selectedSortOption}
            />
          </div>
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
          />
        </div>
        {isShowLoadMoreBtn && (
          <button
            className={
              'm-3 mt-[24px] h-[54px] w-[145px] rounded-[46px] bg-secondary'
            }
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
