import type { UserData } from './types'
import { useAuthStore } from '@/features/auth/store'
import { captureAccountScope } from '@/features/auth/accountScope'
import { executeCommand } from '@/features/session/syncCommands'
import { acceptSnapshot, onSnapshot } from '@/features/session/resourceState'
import {
  deleteUserAvatar,
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
  const generation = useAuthStore.getState().profileGeneration
  const scope = captureAccountScope()
  const data = (await getUserProfile({
    cache: false,
    ...config,
  } as object)) as UserData

  const current = useAuthStore.getState()

  if (
    scope.isCurrent() &&
    current.userData?.email === data.email &&
    (generation !== current.profileGeneration ||
      (current.userData?.profileRevision ?? 0) > (data.profileRevision ?? 0))
  )
    return current.userData

  const normalized = normalizeUserData(data)

  if (
    scope.isCurrent() &&
    normalized.id &&
    Number.isSafeInteger(normalized.profileRevision)
  ) {
    return acceptSnapshot('profile', {
      userId: normalized.id,
      revision: normalized.profileRevision!,
      data: normalized as unknown as Record<string, unknown>,
    }).data as unknown as UserData
  }

  return normalized
}

export const editUserProfile = async (
  updatedUserData: UpdateUserProfileInput,
  expectedRevision?: number,
): Promise<UserData> => {
  const address = updatedUserData.address
  const isEmptyAddress =
    !address ||
    (!address.country && !address.city && !address.line && !address.postcode)
  const payload = {
    firstName: updatedUserData.firstName,
    lastName: updatedUserData.lastName,
    birthDate: updatedUserData.birthDate,
    phoneNumber: updatedUserData.phoneNumber,
    // The backend treats null as unchanged and an empty object as clear.
    address: address && isEmptyAddress ? {} : address,
  }

  const end = useAuthStore.getState().profileWrite()

  try {
    return normalizeUserData(
      await executeCommand<UserData>('profile', 'update', payload, {
        expectedRevision,
      }),
    )
  } finally {
    end()
  }
}

export const removeUserAvatar = async (): Promise<UserData> => {
  const end = useAuthStore.getState().profileWrite()

  try {
    await deleteUserAvatar()
  } finally {
    end()
  }

  return getUserData()
}

export async function uploadImage(
  file: File,
  turnstileToken?: string,
  options?: AvatarUploadOptions,
): Promise<void> {
  const end = useAuthStore.getState().profileWrite()

  try {
    if (getAvatarUploadMode() === 'presigned') {
      await uploadAvatarWithPresignedFlow(file, turnstileToken, options)

      return
    }

    options?.onStageChange?.('uploading')
    options?.onUploadProgress?.(null)
    await uploadUserAvatar(
      {
        file,
        ...(turnstileToken ? { turnstileToken } : {}),
      },
      { signal: options?.signal },
    )
  } finally {
    end()
  }
}

export { isAvatarUploadAbortError }
export type { AvatarUploadOptions, AvatarUploadStage }

onSnapshot('profile', (snapshot) => {
  const auth = useAuthStore.getState()

  if (
    auth.status === 'authenticated' &&
    auth.userData?.id === snapshot.userId
  ) {
    auth.setUserData(normalizeUserData(snapshot.data as unknown as UserData))
  }
})
