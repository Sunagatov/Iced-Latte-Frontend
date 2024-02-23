import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
        set((state) => {
          const lastRoute =
            state.previousRoutes[state.previousRoutes.length - 1]

          if (lastRoute !== route) {
            const updatedRoutes = [...state.previousRoutes.slice(-3), route]

            return { previousRoutes: updatedRoutes }
          }

          return state
        })
      },
    }),
    {
      name: 'sessionStore',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
