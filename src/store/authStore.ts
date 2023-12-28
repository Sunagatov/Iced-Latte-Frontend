import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  token: string | null
  isLoggedIn: boolean
  authenticate: (token: string) => void
  reset: () => void
  openModal: boolean
  toggleModal: () => void
  resetOpenModal: () => void
  setModalState: (isOpen: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      openModal: false,
      token: null,
      isLoggedIn: false,
      toggleModal: () => set((state) => ({ openModal: !state.openModal })),
      setModalState: (isOpen: boolean) => set({ openModal: isOpen }),
      resetOpenModal: () => set({ openModal: false }),
      authenticate: (token: string) => set({ token: token, isLoggedIn: true }),
      reset: () => set({ token: '', isLoggedIn: false }),
    }),
    {
      name: 'token',
    },
  ),
)
