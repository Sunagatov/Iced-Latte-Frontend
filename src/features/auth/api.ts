import { AxiosResponse } from 'axios'
import { api } from '@/shared/api/client'
import {
  SessionResponse,
  LoginCredentials,
  RegisterCredentials,
} from './types'

export async function apiRegisterUser(credentials: RegisterCredentials): Promise<string> {
  const response: AxiosResponse<string> = await api.post('/auth/register', credentials)

  return response.data
}

/** Sends the email verification code. Backend sets session cookie on success. */
export async function verifyEmailCode(code: string): Promise<void> {
  if (!code) throw new Error('Verification code is required')
  await api.post('/auth/confirm', { token: code })
}

export async function apiLoginUser(credentials: LoginCredentials): Promise<void> {
  await api.post('/auth/authenticate', credentials)
}

export async function apiLogoutUser(): Promise<void> {
  await api.post('/auth/logout')
}

export async function apiGetSession(): Promise<SessionResponse> {
  const response: AxiosResponse<SessionResponse> = await api.get('/auth/session')

  return response.data
}
