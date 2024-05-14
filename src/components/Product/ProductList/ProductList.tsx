'use client'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { sortOptions } from '@/constants/productSortOptions'
import ProductCard from '@/components/Product/ProductCard/ProductCard'
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

interface IProductList {
  brands: string[]
  sellers: string[]
}

export default function ProductList({
  brands,
  sellers,
}: Readonly<IProductList>) {
  const {
    selectedBrandOptions,
    selectedSellerOptions,
    selectedSortOption,
    updateProductFiltersStore,
  } = useProductFiltersStore()

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const { data, fetchNext, hasNextPage, isLoading, isFetchingNextPage, error } =
    useProducts(selectedSortOption, selectedBrandOptions, selectedSellerOptions)

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

  if (error) {
    return (
      <h1 className={'grid h-screen  place-items-center text-4xl text-black'}>
        Something went wrong!
      </h1>
    )
  }

  if (isLoading) {
    return (
      <div className={'mt-14 flex h-[54px] items-center justify-center'}>
        <Loader />
      </div>
    )
  }

  return (
    <section
      className={twMerge(
        'mx-4 mt-5 text-center min-[1124px]:mt-16',
        !isShowLoadMoreBtn ? 'mb-14' : '',
      )}
    >
      <div className={'inline-flex flex-col items-center text-left '}>
        <h1
          className={
            'mb-8 mr-auto text-5XL min-[1124px]:mb-10 min-[1124px]:text-6XL'
          }
        >
          All Coffee
        </h1>
        <div className={'flex w-full justify-between'}>
          <ProductsFilterLabels className="min-[1100px]:hidden" />
        </div>
        <div
          className={
            'mb-6 mt-1.5 flex w-full items-center justify-between gap-2'
          }
        >
          <ProductsFilterLabels className="max-[1100px]:hidden" />
          <button
            id="filter-btn"
            onClick={handleFilterClick}
            className="hidden cursor-pointer text-L font-medium text-brand max-[1100px]:block"
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
        <div className="inline-flex w-full justify-center gap-x-8">
          <FilterSidebar className="mr-auto hidden min-[1100px]:block">
            <Filters brands={brands} sellers={sellers} />
          </FilterSidebar>
          {isMobileFilterOpen && (
            <MobileFilterSidebar
              onClose={handleCloseMobileFilter}
              className="min-[1100px]:hidden"
            >
              <Filters brands={brands} sellers={sellers} />
            </MobileFilterSidebar>
          )}
          <ul
            className={
              'grid grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-6 min-[1440px]:grid-cols-3 '
            }
          >
            {data.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
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
