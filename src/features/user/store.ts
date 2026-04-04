import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SessionStore {
  selectedRating: number | null
  expandedComments: Record<string, boolean>
  setSelectedRating: (rating: number | null) => void
  setExpandedComments: (
    update: (prevState: Record<string, boolean>) => Record<string, boolean>,
  ) => void
}

export const useLocalSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      selectedRating: null,
      expandedComments: {},
      setSelectedRating: (rating) => set({ selectedRating: rating }),
      setExpandedComments: (update) =>
        set((state) => ({ expandedComments: update(state.expandedComments) })),
    }),
    { name: 'sessionStore', storage: createJSONStorage(() => sessionStorage) },
  ),
)
