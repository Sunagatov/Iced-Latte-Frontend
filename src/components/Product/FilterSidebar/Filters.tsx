import {
  defaultProductsFilters,
  useProductFiltersStore,
} from '@/store/productFiltersStore'
import FilterCheckboxGroup from '@/components/Product/FilterSidebar/FilterCheckboxGroup'

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

  return (
    <div className={'flex flex-col gap-5'}>
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
