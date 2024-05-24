import { create } from 'zustand'
import { ISortParams } from '@/types/ISortParams'
import { sortOptions } from '@/constants/productSortOptions'
import { IOption } from '@/types/Dropdown'
import { getDefaultSortOption } from '@/utils/getDefaultSortOption'
import { StarsType } from '@/components/Product/ProductRatingFilter/ProductRatingFilter'

interface IProductFiltersStore {
  fromPriceFilter: string
  toPriceFilter: string
  selectedBrandOptions: string[]
  selectedSellerOptions: string[]
  selectBrandOption: (value: string) => void
  removeBrandOption: (value: string) => void
  selectSellerOption: (value: string) => void
  removeSellerOption: (value: string) => void
  selectedSortOption: IOption<ISortParams>
  sortingOptions: Array<IOption<ISortParams>>
  ratingFilter: StarsType | null | 'any'
  updateProductFiltersStore: (slice: UpdateProductFiltersStoreSliceType) => void
}

type UpdateProductFiltersStoreSliceType = {
  selectedBrandOptions?: IProductFiltersStore['selectedBrandOptions']
  selectedSellerOptions?: IProductFiltersStore['selectedSellerOptions']
  selectedSortOption?: IProductFiltersStore['selectedSortOption']
  fromPriceFilter?: IProductFiltersStore['fromPriceFilter']
  toPriceFilter?: IProductFiltersStore['toPriceFilter']
  ratingFilter?: IProductFiltersStore['ratingFilter']
}

export const defaultProductsFilters = {
  selectedBrandOptions: [],
  selectedSellerOptions: [],
  ratingFilter: null,
  toPriceFilter: '',
  fromPriceFilter: '',
}

export const useProductFiltersStore = create<IProductFiltersStore>()((set) => ({
  toPriceFilter: '',
  fromPriceFilter: '',
  ratingFilter: null,
  selectedBrandOptions: defaultProductsFilters.selectedBrandOptions,
  selectedSellerOptions: defaultProductsFilters.selectedSellerOptions,
  sortingOptions: sortOptions,
  selectedSortOption: getDefaultSortOption(sortOptions),
  selectBrandOption: (value: string) =>
    set((state) => ({
      ...state,
      selectedBrandOptions: [...state.selectedBrandOptions, value],
    })),
  removeBrandOption: (value: string) =>
    set((state) => ({
      ...state,
      selectedBrandOptions: state.selectedBrandOptions.filter(
        (option) => option !== value,
      ),
    })),
  selectSellerOption: (value: string) =>
    set((state) => ({
      ...state,
      selectedSellerOptions: [...state.selectedSellerOptions, value],
    })),
  removeSellerOption: (value: string) =>
    set((state) => ({
      ...state,
      selectedSellerOptions: state.selectedSellerOptions.filter(
        (option) => option !== value,
      ),
    })),
  updateProductFiltersStore: (
    updatedStateSlice: UpdateProductFiltersStoreSliceType,
  ) => {
    set((state) => ({
      ...state,
      ...updatedStateSlice,
    }))
  },
}))
