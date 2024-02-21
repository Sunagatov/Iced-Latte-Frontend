import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionStore {
  selectedRating: number | null
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  setSelectedRating: (rating: number | null) => void
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
}

export const useLocalSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      selectedRating: null,
      isReviewFormVisible: false,
      isReviewButtonVisible: true,
      setSelectedRating: (rating) => set({ selectedRating: rating }),
      setIsReviewFormVisible: (isVisible) =>
        set({ isReviewFormVisible: isVisible }),
      setIsReviewButtonVisible: (isVisible) =>
        set({ isReviewButtonVisible: isVisible }),
    }),
    {
      name: 'sessionStore',
      getStorage: () => sessionStorage,
    },
  ),
)
