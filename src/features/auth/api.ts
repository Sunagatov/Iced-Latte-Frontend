import { AxiosResponse } from 'axios'
import { api } from '@/shared/api/client'
import {
  SuccessResponse,
  LoginCredentials,
  RegisterCredentials,
  ConfirmEmailResponse,
} from './types'

export async function apiRegisterUser(credentials: RegisterCredentials): Promise<string> {
  const response: AxiosResponse<string> = await api.post('/auth/register', credentials)
  return response.data
}

export async function apiConfirmEmail(token: string | null): Promise<ConfirmEmailResponse> {
  if (!token) throw new Error('Token is null or undefined')
  const response = await api.post('/auth/confirm', { token })
  return { token: response.data, httpStatusCode: response.status }
}

export async function apiLoginUser(credentials: LoginCredentials): Promise<SuccessResponse> {
  const response: AxiosResponse<SuccessResponse> = await api.post('/auth/authenticate', credentials)
  return response.data
}

export async function apiLogoutUser(): Promise<string> {
  const response: AxiosResponse<string> = await api.post('/auth/logout')
  return response.data
}
