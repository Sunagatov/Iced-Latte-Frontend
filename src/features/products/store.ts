import { create } from 'zustand'
import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'
import { sortOptions } from './constants'
import { getDefaultSortOption } from '@/shared/utils/getDefaultSortOption'

export type StarsType = 1 | 2 | 3 | 4 | 5

interface IProductFiltersStore {
  fromPriceFilter: string
  toPriceFilter: string
  selectedBrandOptions: string[]
  selectedSellerOptions: string[]
  selectedSortOption: IOption<ISortParams>
  sortingOptions: Array<IOption<ISortParams>>
  ratingFilter: StarsType | null
  searchQuery: string
  selectBrandOption: (value: string) => void
  removeBrandOption: (value: string) => void
  selectSellerOption: (value: string) => void
  removeSellerOption: (value: string) => void
  updateProductFiltersStore: (
    slice: Partial<
      Omit<
        IProductFiltersStore,
        | 'selectBrandOption'
        | 'removeBrandOption'
        | 'selectSellerOption'
        | 'removeSellerOption'
        | 'updateProductFiltersStore'
        | 'sortingOptions'
      >
    >,
  ) => void
}

export const defaultProductsFilters = {
  selectedBrandOptions: [],
  selectedSellerOptions: [],
  ratingFilter: null,
  toPriceFilter: '',
  fromPriceFilter: '',
  searchQuery: '',
}

export const useProductFiltersStore = create<IProductFiltersStore>()((set) => ({
  toPriceFilter: '',
  fromPriceFilter: '',
  ratingFilter: null,
  searchQuery: '',
  selectedBrandOptions: [],
  selectedSellerOptions: [],
  sortingOptions: sortOptions,
  selectedSortOption: getDefaultSortOption(sortOptions),
  selectBrandOption: (value) =>
    set((state) => ({
      selectedBrandOptions: [...state.selectedBrandOptions, value],
    })),
  removeBrandOption: (value) =>
    set((state) => ({
      selectedBrandOptions: state.selectedBrandOptions.filter(
        (o) => o !== value,
      ),
    })),
  selectSellerOption: (value) =>
    set((state) => ({
      selectedSellerOptions: [...state.selectedSellerOptions, value],
    })),
  removeSellerOption: (value) =>
    set((state) => ({
      selectedSellerOptions: state.selectedSellerOptions.filter(
        (o) => o !== value,
      ),
    })),
  updateProductFiltersStore: (slice) =>
    set((state) => ({ ...state, ...slice })),
}))
