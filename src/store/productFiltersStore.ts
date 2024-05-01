import { create } from 'zustand'


interface IProductFiltersStore {
  selectedBrandOptions: string[],
  selectBrandOption: (value: string) => void,
  removeBrandOption: (value: string) => void,
}


export const useProductFiltersStore = create<IProductFiltersStore>()(
  (set) => ({
    selectedBrandOptions: [],
    selectBrandOption: (value: string) => set((state) => (
      { 
        selectedBrandOptions: [...state.selectedBrandOptions, value]
      }
    )),
    removeBrandOption: (value: string) => set((state) => (
      { 
        selectedBrandOptions: state.selectedBrandOptions.filter(option => option !== value)
      }
    )),
  }),
)