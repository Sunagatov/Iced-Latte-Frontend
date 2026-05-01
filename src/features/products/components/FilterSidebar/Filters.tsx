'use client'

import {
  defaultProductsFilters,
  useProductFiltersStore,
} from '@/features/products/store'
import FilterCheckboxGroup from '@/features/products/components/FilterSidebar/FilterCheckboxGroup'
import PriceFilter from '@/features/products/components/FilterSidebar/PriceFilter'
import ProductRatingFilter, {
  StarsType,
} from '@/features/products/components/ProductRatingFilter/ProductRatingFilter'

interface IFilters {
  brands: string[]
  sellers: string[]
}
export default function Filters({ sellers, brands }: Readonly<IFilters>) {
  const {
    selectedBrandOptions,
    selectedSellerOptions,
    ratingFilter,
    setFilters,
    resetFilters,
    fromPriceFilter,
    toPriceFilter,
  } = useProductFiltersStore()

  const handleBrandCheckboxChange = (value: string) => {
    setFilters({
      selectedBrandOptions: selectedBrandOptions.includes(value)
        ? selectedBrandOptions.filter((option) => option !== value)
        : [...selectedBrandOptions, value],
    })
  }

  const handleSellerCheckboxChange = (value: string) => {
    setFilters({
      selectedSellerOptions: selectedSellerOptions.includes(value)
        ? selectedSellerOptions.filter((option) => option !== value)
        : [...selectedSellerOptions, value],
    })
  }

  const resetSelectedBrandsHandler = () => {
    setFilters({
      selectedBrandOptions: defaultProductsFilters.selectedBrandOptions,
    })
  }

  const resetSelectedSellerHandler = () => {
    setFilters({
      selectedSellerOptions: defaultProductsFilters.selectedSellerOptions,
    })
  }

  const ratingFilterChangeHandler = (value: null | StarsType) => {
    setFilters({ ratingFilter: value })
  }

  const hasActiveFilters =
    selectedBrandOptions.length > 0 ||
    selectedSellerOptions.length > 0 ||
    ratingFilter !== null ||
    fromPriceFilter !== '' ||
    toPriceFilter !== ''

  return (
    <div className={'flex flex-col divide-y divide-black/6'}>
      {hasActiveFilters && (
        <div className="pb-3">
          <button
            onClick={resetFilters}
            className="text-brand-solid text-xs font-medium hover:opacity-70"
          >
            ✕ Reset all filters
          </button>
        </div>
      )}
      <div className="py-4">
        <PriceFilter />
      </div>
      <div className="py-4">
        <ProductRatingFilter
          onChange={ratingFilterChangeHandler}
          selectedOption={ratingFilter}
        />
      </div>
      <div className="py-4">
        <FilterCheckboxGroup
          selectedItems={selectedBrandOptions}
          items={brands}
          onFilterCheckboxClick={handleBrandCheckboxChange}
          title={'Brand'}
          onReset={resetSelectedBrandsHandler}
        />
      </div>
      <div className="py-4">
        <FilterCheckboxGroup
          selectedItems={selectedSellerOptions}
          items={sellers}
          onFilterCheckboxClick={handleSellerCheckboxChange}
          title={'Seller'}
          onReset={resetSelectedSellerHandler}
        />
      </div>
    </div>
  )
}
