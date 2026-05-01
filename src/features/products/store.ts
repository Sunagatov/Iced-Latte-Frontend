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
  ratingFilter: StarsType | null
  searchQuery: string
  resetFilters: () => void
  setFilters: (slice: Partial<ProductFiltersState>) => void
}

export type ProductFiltersState = Pick<
  IProductFiltersStore,
  | 'fromPriceFilter'
  | 'ratingFilter'
  | 'searchQuery'
  | 'selectedBrandOptions'
  | 'selectedSellerOptions'
  | 'selectedSortOption'
  | 'toPriceFilter'
>

export const defaultProductsFilters: Omit<
  ProductFiltersState,
  'selectedSortOption'
> = {
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
  selectedSortOption: getDefaultSortOption(sortOptions),
  resetFilters: () =>
    set((state) => ({
      ...state,
      ...defaultProductsFilters,
    })),
  setFilters: (slice) => set((state) => ({ ...state, ...slice })),
}))
