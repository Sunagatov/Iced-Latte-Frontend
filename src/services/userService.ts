import { AxiosResponse } from 'axios'
import { api } from './apiConfig/apiConfig'
import { UserData } from '@/types/services/UserServices'
import {
  SuccessResponse,
  ForgotPasswordCredentials,
  GuestResetPasswordCredentials,
  AuthChangePasswordCredentials,
  ConfirmPasswordCredentials,
} from '@/types/services/AuthServices'

export const getUserData = async (): Promise<UserData> => {
  const response: AxiosResponse<UserData> = await api.get('/users')

  return response.data
}

export const editUserProfile = async (
  updatedUserData: Partial<UserData>,
): Promise<UserData> => {
  const response: AxiosResponse<UserData> = await api.put(
    '/users',
    updatedUserData,
  )

  return response.data
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()

  formData.append('file', file)

  const response: AxiosResponse<string> = await api.post(
    '/users/avatar',
    formData,
  )

  return response.data
}

export async function getAvatar() {
  const response: AxiosResponse<string> = await api.get('/users/avatar')

  return response.data
}

// Function for forgot password
export async function apiForgotPassword(
  email: ForgotPasswordCredentials,
): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.post(
    '/auth/password/forgot',
    email,
  )

  return response.data
}

// Function for GUEST reset password
export async function apiGuestResetPassword(
  credentials: GuestResetPasswordCredentials,
): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.post(
    '/auth/password/change',
    credentials,
  )

  return response.data
}

// Function for user to chnage password
export async function apiAuthChangePassword(
  credentials: AuthChangePasswordCredentials,
): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.patch(
    '/users',
    credentials,
  )

  return response.data
}

// Function for user to intialize password change
export async function apiAuthInitPasswordChange(): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.post(
    '/users/password/reset',
  )

  return response.data
}

// Function for confirming password change
export async function apiAuthPasswordChangeConfirm(
  token: string | null,
): Promise<ConfirmPasswordCredentials> {
  const response: AxiosResponse<ConfirmPasswordCredentials> = await api.post(
    '/users/password/reset/confirm',
    { token: token },
  )

  return response.data
}
