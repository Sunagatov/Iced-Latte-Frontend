import { useProductFiltersStore } from '@/store/productFiltersStore'
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
  } = useProductFiltersStore()

  const handleBrandCheckboxChange = (value: string) => {
    if (selectedBrandOptions.includes(value)) {
      removeBrandOption(value)
    } else {
      selectBrandOption(value)
    }
  }

  const handleSellerCheckboxChange = (value: string) => {
    if (selectedBrandOptions.includes(value)) {
      removeSellerOption(value)
    } else {
      selectSellerOption(value)
    }
  }

  return (
    <div className={'flex flex-col gap-5'}>
      <FilterCheckboxGroup
        selectedItems={selectedBrandOptions}
        items={brands}
        onFilterCheckboxClick={handleBrandCheckboxChange}
        title={'Brand'}
      />

      <FilterCheckboxGroup
        selectedItems={selectedSellerOptions}
        items={sellers}
        onFilterCheckboxClick={handleSellerCheckboxChange}
        title={'Seller'}
      />
    </div>
  )
}
