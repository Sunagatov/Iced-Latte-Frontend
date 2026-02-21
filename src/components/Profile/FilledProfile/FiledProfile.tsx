'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import FormProfile from '../FormProfile/FormProfile'
import ProfileInfo from '../ProfileInfo/ProfileInfo'
import ImageUpload from '@/components/UI/ImageUpload/ImageUpload'
import Link from 'next/link'
import useLogout from '@/hooks/useLogout'
import Loader from '@/components/UI/Loader/Loader'
import { RiLogoutBoxLine, RiLockPasswordLine, RiUserLine, RiMapPinLine } from 'react-icons/ri'

const FiledProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const { setUserData, userData } = useAuthStore()
  const { isLoading, logout } = useLogout()

  const initials = userData
    ? `${userData.firstName?.[0] ?? ''}${userData.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-secondary pb-20 pt-8">
      <div className="mx-auto max-w-3xl px-4">

        {/* Hero card */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
          {/* Purple banner */}
          <div className="h-24 bg-gradient-to-r from-brand to-brand-solid-hover" />

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-primary">
                  <ImageUpload />
                </div>
                {!userData?.avatarLink || userData.avatarLink === 'default file' ? (
                  <div className="absolute inset-0 flex h-24 w-24 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white ring-4 ring-primary pointer-events-none">
                    {initials}
                  </div>
                ) : null}
              </div>

              <button
                id="logout-btn"
                onClick={logout}
                className="flex items-center gap-2 rounded-xl border border-black/10 bg-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-secondary"
              >
                {isLoading ? <Loader /> : (
                  <>
                    <RiLogoutBoxLine className="h-4 w-4 text-negative" />
                    <span>Log out</span>
                  </>
                )}
              </button>
            </div>

            {/* Name + email */}
            <div>
              <h1 className="text-xl font-semibold text-primary">
                {userData?.firstName && userData?.lastName
                  ? `${userData.firstName} ${userData.lastName}`
                  : 'Your Account'}
              </h1>
              {userData?.email && (
                <p className="mt-0.5 text-sm text-secondary">{userData.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        {isEditing ? (
          <div className="rounded-2xl bg-primary p-6 shadow-sm ring-1 ring-black/5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-secondary hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
            <FormProfile
              onSuccessEdit={() => setIsEditing(false)}
              updateUserData={setUserData}
              initialUserData={userData ?? {}}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Personal details card */}
            <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
                <div className="flex items-center gap-2">
                  <RiUserLine className="h-5 w-5 text-brand" />
                  <h2 className="font-semibold text-primary">Personal details</h2>
                </div>
                <button
                  id="edit-btn"
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-solid-hover"
                >
                  Edit
                </button>
              </div>
              <div className="divide-y divide-black/5 px-6">
                <InfoRow label="First name" value={userData?.firstName} />
                <InfoRow label="Last name" value={userData?.lastName} />
                <InfoRow label="Date of birth" value={userData?.birthDate} />
                <InfoRow label="Email" value={userData?.email} />
                <InfoRow label="Phone" value={userData?.phoneNumber} />
              </div>
            </div>

            {/* Delivery address card */}
            <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-2 border-b border-black/5 px-6 py-4">
                <RiMapPinLine className="h-5 w-5 text-brand" />
                <h2 className="font-semibold text-primary">Delivery address</h2>
              </div>
              <div className="divide-y divide-black/5 px-6">
                <InfoRow label="Country" value={userData?.address?.country} />
                <InfoRow label="City" value={userData?.address?.city} />
                <InfoRow label="Address" value={userData?.address?.line} />
                <InfoRow label="Postcode" value={userData?.address?.postcode} />
              </div>
            </div>

            {/* Security card */}
            <div className="rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-2 border-b border-black/5 px-6 py-4">
                <RiLockPasswordLine className="h-5 w-5 text-brand" />
                <h2 className="font-semibold text-primary">Security</h2>
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-primary">Password</p>
                  <p className="text-xs text-secondary">Change your account password</p>
                </div>
                <Link href="/resetpass">
                  <button
                    id="change-btn"
                    className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-secondary"
                  >
                    Change password
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-center justify-between py-3.5">
    <span className="text-sm text-secondary">{label}</span>
    <span className={`text-sm font-medium ${value ? 'text-primary' : 'text-disabled'}`}>
      {value || '—'}
    </span>
  </div>
)

export default FiledProfile
