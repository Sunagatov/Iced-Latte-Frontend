import { LoginCredentials, RegisterCredentials } from './types'
import {
  authenticate,
  confirmEmail,
  logout,
  register,
} from '@/shared/api/generated/security'

export async function apiRegisterUser(
  credentials: RegisterCredentials,
): Promise<{ token: string; refreshToken: string } | null> {
  const response = await register(credentials)

  return response.token ? response : null
}

export async function verifyEmailCode(
  code: string,
): Promise<{ token: string; refreshToken: string }> {
  if (!code) throw new Error('Verification code is required')

  return confirmEmail({ token: code })
}

export interface LoginResponse {
  token: string
  refreshToken: string
}

export async function apiLoginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return authenticate(credentials)
}

export async function apiLogoutUser(): Promise<void> {
  await logout()
}
