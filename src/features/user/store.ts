import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SessionStore {
  selectedRating: number | null
  previousRouteForAuth: string | null
  routingRelatedAuthCompleted: boolean
  expandedComments: Record<string, boolean>
  storedEmailSent: boolean
  resetSuccessful: boolean
  setResetSuccessful: (resetSuccessful: boolean) => void
  setStoredEmailSent: (storedEmailSent: boolean) => void
  setSelectedRating: (rating: number | null) => void
  addPreviousRouteForAuth: (route: string) => void
  setRoutingRelatedAuthCompleted: (completed: boolean) => void
  setExpandedComments: (update: (prevState: Record<string, boolean>) => Record<string, boolean>) => void
}

export const useLocalSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      selectedRating: null,
      previousRouteForAuth: null,
      routingRelatedAuthCompleted: false,
      expandedComments: {},
      storedEmailSent: false,
      resetSuccessful: false,
      setResetSuccessful: (resetSuccessful) => set({ resetSuccessful }),
      setStoredEmailSent: (storedEmailSent) => set({ storedEmailSent }),
      setSelectedRating: (rating) => set({ selectedRating: rating }),
      addPreviousRouteForAuth: (route) => {
        set((state) => {
          if (!state.routingRelatedAuthCompleted) return { previousRouteForAuth: route }
          return state
        })
      },
      setRoutingRelatedAuthCompleted: (completed) => set({ routingRelatedAuthCompleted: completed }),
      setExpandedComments: (update) =>
        set((state) => ({ expandedComments: update(state.expandedComments) })),
    }),
    { name: 'sessionStore', storage: createJSONStorage(() => sessionStorage) },
  ),
)
