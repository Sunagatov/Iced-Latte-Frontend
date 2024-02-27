import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SessionStore {
  selectedRating: number | null
  isReviewFormVisible: boolean
  isReviewButtonVisible: boolean
  previousRoutes: string[]
  previousRouteForLogin: string | null
  routingRelatedRegistrationCompleted: boolean
  routingRelatedLoginCompleted: boolean
  expandedComments: Record<string, boolean>
  setSelectedRating: (rating: number | null) => void
  setIsReviewFormVisible: (isVisible: boolean) => void
  setIsReviewButtonVisible: (isVisible: boolean) => void
  addPreviousRoute: (route: string) => void
  addPreviousRouteForLogin: (route: string) => void
  setRoutingRelatedRegistrationCompleted: (completed: boolean) => void
  setRoutingRelatedLoginCompleted: (completed: boolean) => void
  setExpandedComments: (
    update: (prevState: Record<string, boolean>) => Record<string, boolean>,
  ) => void
}

export const useLocalSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      selectedRating: null,
      isReviewFormVisible: false,
      isReviewButtonVisible: true,
      previousRoutes: [],
      previousRouteForLogin: null,
      routingRelatedRegistrationCompleted: false,
      routingRelatedLoginCompleted: false,
      expandedComments: {},
      setSelectedRating: (rating) => set({ selectedRating: rating }),
      setIsReviewFormVisible: (isVisible) =>
        set({ isReviewFormVisible: isVisible }),
      setIsReviewButtonVisible: (isVisible) =>
        set({ isReviewButtonVisible: isVisible }),
      addPreviousRoute: (route) => {
        set((state) => {
          if (!state.routingRelatedRegistrationCompleted) {
            const lastRoute =
              state.previousRoutes[state.previousRoutes.length - 1]

            if (lastRoute !== route) {
              const updatedRoutes = [...state.previousRoutes.slice(-3), route]

              return { previousRoutes: updatedRoutes }
            }
          }

          return state
        })
      },
      addPreviousRouteForLogin: (route) => {
        set((state) => {
          if (!state.routingRelatedLoginCompleted) {
            const lastRoute = state.previousRouteForLogin

            if (lastRoute !== route) {
              return { previousRouteForLogin: route }
            }
          }

          return state
        })
      },

      setRoutingRelatedRegistrationCompleted: (completed) =>
        set({ routingRelatedRegistrationCompleted: completed }),
      setRoutingRelatedLoginCompleted: (completed) =>
        set({ routingRelatedLoginCompleted: completed }),
      setExpandedComments: (update) =>
        set((state) => ({ expandedComments: update(state.expandedComments) })),
    }),
    {
      name: 'sessionStore',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
