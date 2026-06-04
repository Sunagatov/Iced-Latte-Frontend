export type LoginCredentials = {
  email: string
  password: string
  turnstileToken?: string
}

export type RegisterCredentials = {
  firstName: string
  lastName: string
  email: string
  password: string
  turnstileToken?: string
}

export interface ErrorResponse {
  message: string
}

export interface ForgotPasswordCredentials {
  email: string
  turnstileToken?: string
}

export interface AuthChangePasswordCredentials {
  newPassword: string
  oldPassword: string
}

export interface GuestResetPasswordCredentials {
  code: string
  password: string
  turnstileToken?: string
}

export interface SuccessResponse {
  message?: string
}
