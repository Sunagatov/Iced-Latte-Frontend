'use client'

import {
  defaultProductsFilters,
  useProductFiltersStore,
} from '@/store/productFiltersStore'
import FilterCheckboxGroup from '@/components/Product/FilterSidebar/FilterCheckboxGroup'
import PriceFilter from '@/components/Product/FilterSidebar/PriceFilter'
import ProductRatingFilter, {
  StarsType,
} from '@/components/Product/ProductRatingFilter/ProductRatingFilter'

interface IFilters {
  brands: string[]
  sellers: string[]
}
export default function Filters({ sellers, brands }: Readonly<IFilters>) {
  const {
    selectedBrandOptions,
    selectBrandOption,
    removeBrandOption,
    selectSellerOption,
    selectedSellerOptions,
    ratingFilter,
    removeSellerOption,
    updateProductFiltersStore,
  } = useProductFiltersStore()

  const handleBrandCheckboxChange = (value: string) => {
    if (selectedBrandOptions.includes(value)) {
      removeBrandOption(value)
    } else {
      selectBrandOption(value)
    }
  }

  const handleSellerCheckboxChange = (value: string) => {
    if (selectedSellerOptions.includes(value)) {
      removeSellerOption(value)
    } else {
      selectSellerOption(value)
    }
  }

  const resetSelectedBrandsHandler = () => {
    updateProductFiltersStore({
      selectedBrandOptions: defaultProductsFilters.selectedBrandOptions,
    })
  }

  const resetSelectedSellerHandler = () => {
    updateProductFiltersStore({
      selectedSellerOptions: defaultProductsFilters.selectedSellerOptions,
    })
  }

  const ratingFilterChangeHandler = (value: null | 'any' | StarsType) => {
    updateProductFiltersStore({
      ratingFilter: value,
    })
  }

  return (
    <div className={'flex flex-col gap-5'}>
      <PriceFilter />

      <ProductRatingFilter
        onChange={ratingFilterChangeHandler}
        selectedOption={ratingFilter}
      />

      <FilterCheckboxGroup
        selectedItems={selectedBrandOptions}
        items={brands}
        onFilterCheckboxClick={handleBrandCheckboxChange}
        title={'Brand'}
        onReset={resetSelectedBrandsHandler}
      />

      <FilterCheckboxGroup
        selectedItems={selectedSellerOptions}
        items={sellers}
        onFilterCheckboxClick={handleSellerCheckboxChange}
        title={'Seller'}
        onReset={resetSelectedSellerHandler}
      />
    </div>
  )
}
