'use client'

import {
  RiCupLine,
  RiLogoutBoxLine,
} from 'react-icons/ri'
import AddressManager from '@/features/addresses/components/AddressManager'
import { useProfileViewModel } from '@/features/user/hooks/useProfileViewModel'
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

export default function ProfileScreen() {
  const {
    activeSection,
    favCount,
    isEditing,
    logoutState,
    orderCount,
    setActiveSection,
    setIsEditing,
    setUserData,
    status,
    summary,
    userData,
  } = useProfileViewModel()

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
    <div className="bg-secondary min-h-screen">
      <div className="from-brand to-brand-solid-hover bg-gradient-to-r">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white/30">
                <ImageUpload />
              </div>

              {!summary.hasCustomAvatar && (
                <div className="bg-brand-solid-hover pointer-events-none absolute inset-0 flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white ring-4 ring-white/30">
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
                    <RiCupLine className="h-3 w-3" />
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
                  <RiLogoutBoxLine className="h-4 w-4" />
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
