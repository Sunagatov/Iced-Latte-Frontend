'use client'

import { RiUserLine } from 'react-icons/ri'
import FormProfile from '@/features/user/components/FormProfile/FormProfile'
import type { UserData } from '@/features/user/types'
import type { AuthStore } from '@/features/auth/store'
import type { ProfileSummary } from './profileTypes'

type ProfilePersonalDetailsSectionProps = {
  isEditing: boolean
  onCancel: () => void
  onSaveSuccess: () => void
  onStartEditing: () => void
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
    <span className="text-secondary text-sm">{label}</span>
    <span
      className={`text-sm font-medium ${value ? 'text-primary' : 'text-disabled'}`}
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
  setUserData,
  summary,
  userData,
}: Readonly<ProfilePersonalDetailsSectionProps>) {
  return (
    <div className="bg-primary rounded-2xl shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <RiUserLine className="text-brand h-5 w-5" />
          <h2 className="text-primary font-semibold">Personal details</h2>
        </div>

        {!isEditing && (
          <button
            className="bg-brand hover:bg-brand-solid-hover rounded-lg px-4 py-1.5 text-sm font-medium text-white transition"
            id="edit-btn"
            onClick={onStartEditing}
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-secondary text-sm">
              Update your personal information below.
            </p>
            <button
              className="text-secondary hover:bg-secondary rounded-lg px-3 py-1.5 text-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>

          <FormProfile
            initialUserData={userData}
            onSuccessEdit={onSaveSuccess}
            updateUserData={setUserData}
          />
        </div>
      ) : (
        <div className="divide-y divide-black/5 px-5">
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
