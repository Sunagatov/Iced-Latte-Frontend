import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  authenticate: (token: string | null) => void
  setRefreshToken: (refreshToken: string) => void
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
      refreshToken: null,
      isLoggedIn: false,
      isRegistrationButtonDisabled: false,
      toggleModal: () => set((state) => ({ openModal: !state.openModal })),
      setModalState: (isOpen: boolean) => set({ openModal: isOpen }),
      resetOpenModal: () => set({ openModal: false }),
      authenticate: (token: string | null) =>
        set({ token: token, isLoggedIn: true }),
      setRefreshToken: (refreshToken: string | null) =>
        set({ refreshToken: refreshToken, isLoggedIn: true }),
      reset: () => set({ token: '', refreshToken: '', isLoggedIn: false }),
      setRegistrationButtonDisabled: (disabled: boolean) =>
        set({ isRegistrationButtonDisabled: disabled }),
    }),
    {
      name: 'token',
    },
  ),
)
