'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AxiosCacheInstance } from 'axios-cache-interceptor'
import { useLogout } from '@/features/auth/hooks'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/store'
import type { UserData } from '@/features/user/types'
import { api } from '@/shared/api/client'

export type ProfileSection =
  | 'overview'
  | 'profile'
  | 'addresses'
  | 'security'
  | 'notifications'
  | 'reviews'

export type ProfileSummary = {
  avatarLink: string | null
  birthDate: string | null
  city: string | null
  email: string | null
  firstName: string | null
  fullName: string
  hasCustomAvatar: boolean
  initials: string
  lastName: string | null
  phoneNumber: string | null
}

type LogoutHookResult = {
  isLoading: boolean
  logout: () => Promise<void>
}

type ProfileViewModel = {
  activeSection: ProfileSection
  favCount: number
  isEditing: boolean
  logoutState: LogoutHookResult
  orderCount: number | null
  setActiveSection: (section: ProfileSection) => void
  setIsEditing: (isEditing: boolean) => void
  setUserData: AuthStore['setUserData']
  status: AuthStore['status']
  summary: ProfileSummary
  userData: UserData | null
}

const typedApi: AxiosCacheInstance = api

export function useProfileViewModel(): ProfileViewModel {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<ProfileSection>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [orderCount, setOrderCount] = useState<number | null>(null)

  const setUserData = useAuthStore(
    (state: AuthStore): AuthStore['setUserData'] => state.setUserData,
  )
  const userData = useAuthStore(
    (state: AuthStore): UserData | null => state.userData,
  )
  const status = useAuthStore(
    (state: AuthStore): AuthStore['status'] => state.status,
  )
  const favCount = useFavouritesStore((state) => state.favouriteIds.length)
  const logoutState = useLogout()

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/signin')
    }
  }, [router, status])

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    const loadOrderCount = async (): Promise<void> => {
      try {
        const response = await typedApi.get<{ id: string }[]>('/orders', {
          cache: false,
        })

        setOrderCount(response.data.length)
      } catch {
        // non-critical
      }
    }

    void loadOrderCount()
  }, [status])

  const firstName = userData?.firstName ?? null
  const lastName = userData?.lastName ?? null
  const email = userData?.email ?? null
  const phoneNumber = userData?.phoneNumber ?? null
  const birthDate = userData?.birthDate ?? null
  const city = userData?.address?.city ?? null
  const avatarLink = userData?.avatarLink ?? null
  const fullName =
    firstName && lastName ? `${firstName} ${lastName}` : 'Your Account'
  const initials =
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?'

  return {
    activeSection,
    favCount,
    isEditing,
    logoutState,
    orderCount,
    setActiveSection,
    setIsEditing,
    setUserData,
    status,
    summary: {
      avatarLink,
      birthDate,
      city,
      email,
      firstName,
      fullName,
      hasCustomAvatar: Boolean(avatarLink && avatarLink !== 'default file'),
      initials,
      lastName,
      phoneNumber,
    },
    userData,
  }
}
