import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterStore {
  selectedRating: number | null
  setSelectedRating: (rating: number | null) => void
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      selectedRating: null,
      setSelectedRating: (rating) => set({ selectedRating: rating }),
    }),
    {
      name: 'filterStore',
      getStorage: () => sessionStorage,
    },
  ),
)
