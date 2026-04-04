export type SessionResponse = {
  authenticated: boolean
  user: import('@/features/user/types').UserData | null
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface ErrorResponse {
  message: string
}

export interface ForgotPasswordCredentials {
  email: string
}

export interface AuthChangePasswordCredentials {
  newPassword: string
  oldPassword: string
}

export interface GuestResetPasswordCredentials {
  code: string
  password: string
}

export interface SuccessResponse {
  message?: string
}

