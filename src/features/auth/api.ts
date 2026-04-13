import { AxiosResponse } from 'axios'
import { api } from '@/shared/api/client'
import { LoginCredentials, RegisterCredentials } from './types'

export async function apiRegisterUser(
  credentials: RegisterCredentials,
): Promise<string> {
  const response: AxiosResponse<string> = await api.post(
    '/auth/register',
    credentials,
  )

  return response.data
}

export async function verifyEmailCode(
  code: string,
): Promise<{ token: string; refreshToken: string }> {
  if (!code) throw new Error('Verification code is required')
  const response = await api.post<{ token: string; refreshToken: string }>(
    '/auth/confirm',
    { token: code },
  )
  return response.data
}

export interface LoginResponse {
  token: string
  refreshToken: string
}

export async function apiLoginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response: AxiosResponse<LoginResponse> = await api.post(
    '/auth/authenticate',
    credentials,
  )

  return response.data
}

export async function apiLogoutUser(): Promise<void> {
  await api.post('/auth/logout')
}
