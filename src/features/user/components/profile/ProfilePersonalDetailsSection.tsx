'use client'

import FormProfile from '@/features/user/components/FormProfile'
import { useAccountScopeKey } from '@/features/auth/accountScope'
import type { UserData } from '@/features/user/types'
import type { AuthStore } from '@/features/auth/public'
import type { ProfileSummary } from './profileTypes'

type ProfilePersonalDetailsSectionProps = {
  isEditing: boolean
  onCancel: () => void
  onSaveSuccess: () => void
  onStartEditing: () => void
  onManageAddresses?: () => void
  setUserData: AuthStore['setUserData']
  summary: ProfileSummary
  userData: UserData | null
}

type InfoRowProps = {
  label: string
  value?: string | null
}

const InfoRow = ({ label, value }: Readonly<InfoRowProps>) => (
  <div className="flex items-center justify-between py-3.5">
    <span className="text-sm text-black/40">{label}</span>
    <span
      className={`text-sm font-medium ${value ? 'text-black/80' : 'text-black/20'}`}
    >
      {value || '—'}
    </span>
  </div>
)

export default function ProfilePersonalDetailsSection({
  isEditing,
  onCancel,
  onSaveSuccess,
  onStartEditing,
  onManageAddresses,
  setUserData,
  summary,
  userData,
}: Readonly<ProfilePersonalDetailsSectionProps>) {
  const accountKey = useAccountScopeKey()

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <svg
            className="text-brand h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <h2 className="font-semibold text-black/80">Personal details</h2>
        </div>

        {!isEditing && (
          <button
            className="bg-brand-solid hover:bg-brand-solid-hover rounded-lg px-4 py-1.5 text-sm font-medium text-white transition"
            id="edit-btn"
            onClick={onStartEditing}
            type="button"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-black/40">
              Update your personal information below.
            </p>
            <button
              className="rounded-lg px-3 py-1.5 text-sm text-black/40 hover:bg-black/[0.03]"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          </div>

          <FormProfile
            key={accountKey}
            initialUserData={userData}
            onSuccessEdit={onSaveSuccess}
            updateUserData={setUserData}
            onManageAddresses={onManageAddresses}
          />
        </div>
      ) : (
        <div className="divide-y divide-black/[0.06] px-5">
          <InfoRow label="First name" value={summary.firstName} />
          <InfoRow label="Last name" value={summary.lastName} />
          <InfoRow label="Date of birth" value={summary.birthDate} />
          <InfoRow label="Email" value={summary.email} />
          <InfoRow label="Phone" value={summary.phoneNumber} />
        </div>
      )}
    </div>
  )
}
