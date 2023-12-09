import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

type HeartState = {
  isHeartActive: boolean
  toggleHeart: () => void
}

export const useHeartStore = create<HeartState>()(
  devtools(
    persist(
      (set) => ({
        isHeartActive: false,
        toggleHeart: () =>
          set((state) => ({
            isHeartActive: !state.isHeartActive,
          })),
      }),
      {
        name: 'heart-store',
      },
    ),
  ),
)
