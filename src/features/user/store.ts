import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SessionStore {
  selectedRating: number | null
  expandedComments: Record<string, boolean>
  previousRouteForAuth: string | null
  setSelectedRating: (rating: number | null) => void
  setExpandedComments: (update: (prevState: Record<string, boolean>) => Record<string, boolean>) => void
  addPreviousRouteForAuth: (route: string) => void
}

export const useLocalSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      selectedRating: null,
      expandedComments: {},
      previousRouteForAuth: null,
      setSelectedRating: (rating) => set({ selectedRating: rating }),
      setExpandedComments: (update) =>
        set((state) => ({ expandedComments: update(state.expandedComments) })),
      addPreviousRouteForAuth: (route) => set({ previousRouteForAuth: route }),
    }),
    { name: 'sessionStore', storage: createJSONStorage(() => sessionStorage) },
  ),
)
