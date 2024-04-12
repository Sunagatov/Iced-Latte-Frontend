import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SessionStore {
  selectedRating: number | null
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  previousRouteForAuth: string | null
  routingRelatedAuthCompleted: boolean
  expandedComments: Record<string, boolean>
  storedEmailSent: boolean
  resetSuccessful: boolean
  isRaitingFormVisible: boolean

  setResetSuccessful: (resetSuccessful: boolean) => void
  setStoredEmailSent: (storedEmailSent: boolean) => void
  setSelectedRating: (rating: number | null) => void
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
  addPreviousRouteForAuth: (route: string) => void
  setRoutingRelatedAuthCompleted: (completed: boolean) => void
  setExpandedComments: (
    update: (prevState: Record<string, boolean>) => Record<string, boolean>,
  ) => void
  setIsRaitingFormVisible: (isVisible: boolean) => void
}

export const useLocalSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      selectedRating: null,
      isReviewFormVisible: false,
      isReviewButtonVisible: true,
      previousRouteForAuth: null,
      routingRelatedAuthCompleted: false,
      expandedComments: {},
      storedEmailSent: false,
      resetSuccessful: false,

      isRaitingFormVisible: true,
      setIsRaitingFormVisible: (isVisible: boolean) =>
        set({ isRaitingFormVisible: isVisible }),

      setResetSuccessful: (resetSuccessful) => {
        set({ resetSuccessful })
      },
      setStoredEmailSent: (storedEmailSent) => {
        set({ storedEmailSent })
      },

      setSelectedRating: (rating) => set({ selectedRating: rating }),
      setIsReviewFormVisible: (isVisible) =>
        set({ isReviewFormVisible: isVisible }),
      setIsReviewButtonVisible: (isVisible) =>
        set({ isReviewButtonVisible: isVisible }),
      addPreviousRouteForAuth: (route) => {
        set((state) => {
          if (!state.routingRelatedAuthCompleted) {
            return { previousRouteForAuth: route }
          }

          return state
        })
      },
      setRoutingRelatedAuthCompleted: (completed) =>
        set({ routingRelatedAuthCompleted: completed }),
      setExpandedComments: (update) =>
        set((state) => ({ expandedComments: update(state.expandedComments) })),
    }),

    {
      name: 'sessionStore',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
