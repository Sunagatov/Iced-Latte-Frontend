import { AxiosResponse } from 'axios'
import { api } from '@/shared/api/client'
import { UserData } from './types'
import {
  SuccessResponse,
  ForgotPasswordCredentials,
  GuestResetPasswordCredentials,
  AuthChangePasswordCredentials,
} from '@/features/auth/types'

export const getUserData = async (): Promise<UserData> => {
  const response: AxiosResponse<UserData> = await api.get('/users', {
    cache: false,
  })

  return response.data
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
  const response: AxiosResponse<UserData> = await api.put('/users', payload)

  return response.data
}

export async function uploadImage(file: File): Promise<void> {
  const formData = new FormData()

  formData.append('file', file)
  await api.post('/users/avatar', formData)
}

export async function apiForgotPassword(
  email: ForgotPasswordCredentials,
): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.post(
    '/auth/password/forgot',
    email,
  )

  return response.data
}

export async function apiGuestResetPassword(
  credentials: GuestResetPasswordCredentials,
): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.post(
    '/auth/password/change',
    credentials,
  )

  return response.data
}

export async function apiAuthChangePassword(
  credentials: AuthChangePasswordCredentials,
): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.patch(
    '/users',
    credentials,
  )

  return response.data
}
