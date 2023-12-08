import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthData } from '@/services/authAndUserService'

interface AuthStore {
  authToken: string | null
  setAuthToken: () => Promise<void>
  loading: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_API_HOST_DOCKER

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authToken: null,
      loading: false,

      setAuthToken: async () => {
        try {
          set({ loading: true })
          const authResponse = await fetch(`${BASE_URL}/auth/authenticate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'john@example.com',
              password: 'pass12345',
            }),
          })

          if (!authResponse.ok) {
            throw new Error(authResponse.statusText)
          }

          const authData: AuthData = await authResponse.json()

          const authToken = authData?.token

          if (!authToken) {
            throw new Error(
              'Authentication failed. Token is null or undefined.',
            )
          }

          set({ authToken })
        } catch (error) {
          console.error('Authentication error:', error)
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'authTokenStore',
      getStorage: () => localStorage,
    },
  ),
)

export { useAuthStore }
