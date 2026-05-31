import {
  AuthChangePasswordCredentials,
  ForgotPasswordCredentials,
  GuestResetPasswordCredentials,
  LoginCredentials,
  RegisterCredentials,
  SuccessResponse,
} from './types'
import {
  authenticate,
  changePassword,
  confirmEmail,
  forgotPassword,
  logout,
  register,
} from '@/shared/api/generated/security'
import { changeUserPassword } from '@/shared/api/generated/user'

type AuthSessionResult = {
  authenticated?: boolean
}

export async function apiRegisterUser(
  credentials: RegisterCredentials,
): Promise<boolean> {
  const result: Awaited<ReturnType<typeof register>> & AuthSessionResult =
    await register(credentials)

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

export async function apiForgotPassword(
  email: ForgotPasswordCredentials,
): Promise<SuccessResponse> {
  await forgotPassword(email)

  return {}
}

export async function apiGuestResetPassword(
  credentials: GuestResetPasswordCredentials,
): Promise<SuccessResponse> {
  await changePassword(credentials)

  return {}
}

export async function apiAuthChangePassword(
  credentials: AuthChangePasswordCredentials,
): Promise<SuccessResponse> {
  await changeUserPassword(credentials)

  return {}
}
