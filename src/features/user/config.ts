import { FEATURES } from '@/shared/config/features'

export const avatarTurnstileEnabled = FEATURES.avatarTurnstile

export type AvatarUploadMode = 'backend' | 'presigned'

function readAvatarUploadMode(value: string | undefined): AvatarUploadMode {
  return value === 'presigned' ? 'presigned' : 'backend'
}

export function getAvatarUploadMode(): AvatarUploadMode {
  return readAvatarUploadMode(process.env.NEXT_PUBLIC_AVATAR_UPLOAD_MODE)
}

export const avatarUploadMode = readAvatarUploadMode(
  process.env.NEXT_PUBLIC_AVATAR_UPLOAD_MODE,
)
