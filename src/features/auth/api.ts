import { LoginCredentials, RegisterCredentials } from './types'
import {
  authenticate,
  confirmEmail,
  logout,
  register,
} from '@/shared/api/generated/security'

type AuthSessionResult = {
  authenticated?: boolean
}

export async function apiRegisterUser(
  credentials: RegisterCredentials,
): Promise<boolean> {
  const result = (await register(credentials)) as unknown as AuthSessionResult

  return result.authenticated === true
}

export async function verifyEmailCode(
  code: string,
): Promise<void> {
  if (!code) throw new Error('Verification code is required')

  await confirmEmail({ token: code })
}

export async function apiLoginUser(
  credentials: LoginCredentials,
): Promise<void> {
  await authenticate(credentials)
}

export async function apiLogoutUser(): Promise<void> {
  await logout()
}
