import {
  SuccessResponse,
  LoginCredentials,
  RegisterCredentials,
  ConfirmEmailResponse,
  ForgotPasswordCredentials,
  GuestResetPasswordCredentials,
  AuthChangePasswordCredentials,
  ConfirmPasswordCredentials,
} from '@/types/services/AuthServices'
import { api } from './apiConfig/apiConfig'
import { AxiosResponse } from 'axios'

// Function for user registration
export async function apiRegisterUser(
  credentials: RegisterCredentials,
): Promise<string> {
  const response: AxiosResponse<string> = await api.post(
    '/auth/register',
    credentials,
  )

  return response.data
}

// Function for confirm email
export async function apiConfirmEmail(
  token: string | null,
): Promise<ConfirmEmailResponse> {
  if (!token) {
    throw new Error('Token is null or undefined')
  }

  const response = await api.post('/auth/confirm', { token })

  const responseData: ConfirmEmailResponse = {
    token: response.data,
    httpStatusCode: response.status,
  }

  return responseData
}

// Function for login user
export async function apiLoginUser(
  credentials: LoginCredentials,
): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.post(
    '/auth/authenticate',
    credentials,
  )

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
