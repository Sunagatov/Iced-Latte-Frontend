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
