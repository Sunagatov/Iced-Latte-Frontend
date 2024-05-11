import { create } from 'zustand'

interface IProductFiltersStore {
  selectedBrandOptions: string[]
  selectedSellerOptions: string[]
  selectBrandOption: (value: string) => void
  removeBrandOption: (value: string) => void
  selectSellerOption: (value: string) => void
  removeSellerOption: (value: string) => void
}

export const useProductFiltersStore = create<IProductFiltersStore>()((set) => ({
  selectedBrandOptions: [],
  selectedSellerOptions: [],
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
}))
