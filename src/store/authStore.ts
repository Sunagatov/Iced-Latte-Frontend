import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  token: string | null
  isLoggedIn: boolean
  authenticate: (token: string) => void
  reset: () => void
  openModal: boolean
  isRegistrationButtonDisabled: boolean
  toggleModal: () => void
  resetOpenModal: () => void
  setModalState: (isOpen: boolean) => void
  setRegistrationButtonDisabled: (disabled: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      openModal: false,
      token: null,
      isLoggedIn: false,
      isRegistrationButtonDisabled: false,
      toggleModal: () => set((state) => ({ openModal: !state.openModal })),
      setModalState: (isOpen: boolean) => set({ openModal: isOpen }),
      resetOpenModal: () => set({ openModal: false }),
      authenticate: (token: string) => set({ token: token, isLoggedIn: true }),
      reset: () => set({ token: '', isLoggedIn: false }),
      setRegistrationButtonDisabled: (disabled: boolean) =>
        set({ isRegistrationButtonDisabled: disabled }),
    }),
    {
      name: 'token',
    },
  ),
)
