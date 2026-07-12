import type { UserData } from '@/features/user/public'
import { DEFAULT_AVATAR_LINK } from '@/features/user/constants'
import type { ProfileSummary } from './profileTypes'

export function buildProfileSummary(userData: UserData | null): ProfileSummary {
  const firstName = userData?.firstName ?? null
  const lastName = userData?.lastName ?? null

  return {
    avatarLink: userData?.avatarLink ?? null,
    birthDate: userData?.birthDate ?? null,
    city: userData?.address?.city ?? null,
    email: userData?.email ?? null,
    firstName,
    fullName:
      firstName && lastName ? `${firstName} ${lastName}` : 'Your Account',
    hasCustomAvatar: Boolean(
      userData?.avatarLink && userData.avatarLink !== DEFAULT_AVATAR_LINK,
    ),
    initials:
      `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?',
    lastName,
    phoneNumber: userData?.phoneNumber ?? null,
  }
}
