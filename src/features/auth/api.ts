import { AxiosResponse } from 'axios'
import { api } from '@/shared/api/client'
import {
  AuthTokens,
  VerifyEmailResponse,
  SessionResponse,
  LoginCredentials,
  RegisterCredentials,
} from './types'

export async function apiRegisterUser(credentials: RegisterCredentials): Promise<string> {
  const response: AxiosResponse<string> = await api.post('/auth/register', credentials)

  return response.data
}

export async function verifyEmailCode(code: string): Promise<VerifyEmailResponse> {
  if (!code) throw new Error('Verification code is required')
  const response = await api.post('/auth/confirm', { token: code })

  return { token: response.data, httpStatusCode: response.status }
}

/** @deprecated use verifyEmailCode */
export const apiConfirmEmail = verifyEmailCode

export async function apiLoginUser(credentials: LoginCredentials): Promise<AuthTokens> {
  const response: AxiosResponse<AuthTokens> = await api.post('/auth/authenticate', credentials)

  return response.data
}

export async function apiLogoutUser(): Promise<void> {
  await api.post('/auth/logout')
}

export async function apiGetSession(): Promise<SessionResponse> {
  const response: AxiosResponse<SessionResponse> = await api.get('/auth/session')

  return response.data
}
