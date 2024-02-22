import { create } from 'zustand'
import { persist /*, createJSONStorage */ } from 'zustand/middleware'

interface SessionStore {
  selectedRating: number | null
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  previousRoutes: string[]
  setSelectedRating: (rating: number | null) => void
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
  addPreviousRoute: (route: string) => void
}

export const useLocalSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      selectedRating: null,
      isReviewFormVisible: false,
      isReviewButtonVisible: true,
      previousRoutes: [],

      setSelectedRating: (rating) => set({ selectedRating: rating }),
      setIsReviewFormVisible: (isVisible) =>
        set({ isReviewFormVisible: isVisible }),
      setIsReviewButtonVisible: (isVisible) =>
        set({ isReviewButtonVisible: isVisible }),
      addPreviousRoute: (route) => {
        set((state) => ({
          previousRoutes: [...state.previousRoutes.slice(-3), route],
        }))
      },
    }),
    {
      name: 'sessionStore',
      getStorage: () => sessionStorage,
      // storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
