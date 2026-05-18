import { UserData } from './types'
import {
  SuccessResponse,
  ForgotPasswordCredentials,
  GuestResetPasswordCredentials,
  AuthChangePasswordCredentials,
} from '@/features/auth/types'
import {
  changeUserPassword,
  editUserProfile as editGeneratedUserProfile,
  getUserProfile,
  uploadUserAvatar,
} from '@/shared/api/generated/user'
import {
  changePassword,
  forgotPassword,
} from '@/shared/api/generated/security'

function normalizeUserData(data: UserData): UserData {
  return {
    ...data,
    address: data.address ?? {},
  }
}

type UserRequestConfig = object & {
  skipAuthRetry?: boolean
}

export const getUserData = async (
  config?: UserRequestConfig,
): Promise<UserData> => {
  const data = await getUserProfile({
    cache: false,
    ...config,
  } as object) as UserData

  return normalizeUserData(data)
}

export const editUserProfile = async (
  updatedUserData: Partial<UserData>,
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

export async function uploadImage(file: File): Promise<void> {
  await uploadUserAvatar({ file })
}

export async function apiForgotPassword(
  email: ForgotPasswordCredentials,
): Promise<SuccessResponse> {
  await forgotPassword(email)

  return {}
}

export async function apiGuestResetPassword(
  credentials: GuestResetPasswordCredentials,
): Promise<SuccessResponse> {
  await changePassword(credentials)

  return {}
}

export async function apiAuthChangePassword(
  credentials: AuthChangePasswordCredentials,
): Promise<SuccessResponse> {
  await changeUserPassword(credentials)

  return {}
}
