export type SuccessResponse = {
  token: string
  refreshToken: string
}

export type SuccessRefreshToken = {
  token: string | null
  refreshToken: string | null
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

export interface ConfirmEmailResponse {
  token: {
    token: string
    refreshToken: string
  }
  httpStatusCode: number
}
export interface ErrorResponse {
  message: string
}

export interface ForgotPasswordCredentials {
  email: string
}

export interface AuthResetPasswordCredentials {
  password: string
  confirmPassword: string
}

export interface GuestResetPasswordCredentials {
  email: string
  code: string
  password: string
  confirmPassword: string
}
