import {
  SuccessResponse,
  LoginCredentials,
  RegisterCredentials,
  ConfirmEmailResponse,
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
