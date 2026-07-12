import type { UserData } from './types'
import {
  deleteUserAvatar,
  editUserProfile as editGeneratedUserProfile,
  getUserProfile,
  type UpdateUserAccountRequest,
  uploadUserAvatar,
} from '@/shared/api/generated/user'
import {
  isAvatarUploadAbortError,
  type AvatarUploadOptions,
  type AvatarUploadStage,
  uploadAvatarWithPresignedFlow,
} from './avatarUpload'
import { getAvatarUploadMode } from './config'

type UserRequestConfig = object & {
  skipAuthRetry?: boolean
}

function normalizeUserData(data: UserData): UserData {
  return {
    ...data,
    address: data.address ?? {},
  }
}

export type UpdateUserProfileInput = Omit<
  UpdateUserAccountRequest,
  'address'
> & {
  address?: UserData['address'] | null
}

export const getUserData = async (
  config?: UserRequestConfig,
): Promise<UserData> => {
  const data = (await getUserProfile({
    cache: false,
    ...config,
  } as object)) as UserData

  return normalizeUserData(data)
}

export const editUserProfile = async (
  updatedUserData: UpdateUserProfileInput,
): Promise<UserData> => {
  const address = updatedUserData.address
  const isEmptyAddress =
    !address ||
    (!address.country && !address.city && !address.line && !address.postcode)
  const payload = {
    ...updatedUserData,
    address: isEmptyAddress ? null : address,
  }

  await editGeneratedUserProfile(
    payload as unknown as Parameters<typeof editGeneratedUserProfile>[0],
  )

  return getUserData()
}

export const removeUserAvatar = async (): Promise<UserData> => {
  await deleteUserAvatar()

  return getUserData()
}

export async function uploadImage(
  file: File,
  turnstileToken?: string,
  options?: AvatarUploadOptions,
): Promise<void> {
  if (getAvatarUploadMode() === 'presigned') {
    await uploadAvatarWithPresignedFlow(file, turnstileToken, options)

    return
  }

  options?.onStageChange?.('uploading')
  options?.onUploadProgress?.(null)
  await uploadUserAvatar({
    file,
    ...(turnstileToken ? { turnstileToken } : {}),
  }, { signal: options?.signal })
}

export { isAvatarUploadAbortError }
export type { AvatarUploadOptions, AvatarUploadStage }
