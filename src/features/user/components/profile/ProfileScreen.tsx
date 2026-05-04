'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AddressManager from '@/features/addresses/components/AddressManager'
import { useLogout } from '@/features/auth/hooks'
import { useAuthStore, type AuthStore } from '@/features/auth/store'
import { useFavouritesStore } from '@/features/favorites/state/favoritesStore'
import type { UserData } from '@/features/user/types'
import { api } from '@/shared/api/client'
import Loader from '@/shared/ui/Loader/Loader'
import ImageUpload from '../ImageUpload/ImageUpload'
import {
  ProfileNotificationsSection,
  ProfileReviewsSection,
  ProfileSecuritySection,
} from './ProfileAuxiliarySections'
import ProfileSidebarNavigation, {
  ProfileNavigation,
} from './ProfileNavigation'
import ProfileOverviewSection from './ProfileOverviewSection'
import ProfilePersonalDetailsSection from './ProfilePersonalDetailsSection'
import type { ProfileSection, ProfileSummary } from './profileTypes'

export default function ProfileScreen() {
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
        const response = await api.get<{ totalElements: number }>('/orders', {
          cache: false,
        })

        setOrderCount(response.data.totalElements)
      } catch {
        // non-critical
      }
    }

    void loadOrderCount()
  }, [status])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return null
  }

  const firstName = userData?.firstName ?? null
  const lastName = userData?.lastName ?? null
  const summary: ProfileSummary = {
    avatarLink: userData?.avatarLink ?? null,
    birthDate: userData?.birthDate ?? null,
    city: userData?.address?.city ?? null,
    email: userData?.email ?? null,
    firstName,
    fullName: firstName && lastName ? `${firstName} ${lastName}` : 'Your Account',
    hasCustomAvatar: Boolean(
      userData?.avatarLink && userData.avatarLink !== 'default file',
    ),
    initials: `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?',
    lastName,
    phoneNumber: userData?.phoneNumber ?? null,
  }

  const handleSectionChange = (section: typeof activeSection): void => {
    setActiveSection(section)
    setIsEditing(false)
  }

  const openProfileEditor = (): void => {
    setActiveSection('profile')
    setIsEditing(true)
  }

  const openAddresses = (): void => {
    setActiveSection('addresses')
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="bg-gradient-to-r from-[#1B4332] to-[#143728]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white/30">
                <ImageUpload />
              </div>

              {!summary.hasCustomAvatar && (
                <div className="pointer-events-none absolute inset-0 flex h-20 w-20 items-center justify-center rounded-full bg-[#143728] text-xl font-bold text-white ring-4 ring-white/30">
                  {summary.initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold text-white">
                  {summary.fullName}
                </h1>

                {summary.email && (
                  <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Member
                  </span>
                )}
              </div>

              {summary.email && (
                <p className="mt-0.5 truncate text-sm text-white/70">
                  {summary.email}
                </p>
              )}
            </div>

            <button
              className="hidden shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 sm:flex"
              id="logout-btn"
              onClick={logoutState.logout}
            >
              {logoutState.isLoading ? (
                <Loader />
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Log out
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <ProfileNavigation
          activeSection={activeSection}
          onSelectSection={handleSectionChange}
        />

        <div className="flex gap-6">
          <ProfileSidebarNavigation
            activeSection={activeSection}
            isLoggingOut={logoutState.isLoading}
            onLogout={logoutState.logout}
            onSelectSection={handleSectionChange}
          />

          <main className="min-w-0 flex-1 space-y-4">
            {activeSection === 'overview' && (
              <ProfileOverviewSection
                favCount={favCount}
                onOpenAddresses={openAddresses}
                onOpenProfileEditor={openProfileEditor}
                orderCount={orderCount}
                summary={summary}
              />
            )}

            {activeSection === 'profile' && (
              <ProfilePersonalDetailsSection
                isEditing={isEditing}
                onCancel={() => setIsEditing(false)}
                onSaveSuccess={() => setIsEditing(false)}
                onStartEditing={() => setIsEditing(true)}
                setUserData={setUserData}
                summary={summary}
                userData={userData}
              />
            )}

            {activeSection === 'addresses' && <AddressManager />}
            {activeSection === 'security' && <ProfileSecuritySection />}
            {activeSection === 'notifications' && (
              <ProfileNotificationsSection />
            )}
            {activeSection === 'reviews' && <ProfileReviewsSection />}
          </main>
        </div>
      </div>
    </div>
  )
}
