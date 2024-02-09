import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserData } from '@/types/services/UserServices'

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
  userData: UserData | null
  setUserData: (userData: UserData | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      openModal: false,
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      isRegistrationButtonDisabled: false,
      userData: null,
      toggleModal: () => set((state) => ({ openModal: !state.openModal })),
      setModalState: (isOpen: boolean) => set({ openModal: isOpen }),
      resetOpenModal: () => set({ openModal: false }),
      authenticate: (token: string | null) =>
        set({ token: token, isLoggedIn: true }),
      setRefreshToken: (refreshToken: string | null) =>
        set({ refreshToken: refreshToken, isLoggedIn: true }),
      reset: () =>
        set({
          token: null,
          refreshToken: null,
          userData: null,
          isLoggedIn: false,
        }),
      setRegistrationButtonDisabled: (disabled: boolean) =>
        set({ isRegistrationButtonDisabled: disabled }),
      setUserData: (userData: UserData | null) => set({ userData }),
    }),
    {
      name: 'token',
    },
  ),
)
