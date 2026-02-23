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

export interface AuthChangePasswordCredentials {
  newPassword: string
  oldPassword: string
}

export interface GuestResetPasswordCredentials {
  code: string
  email: string
  password: string
}

export interface ConfirmPasswordCredentials {
  token: {
    token: string
  }
}

export interface StoredData {
  state: {
    token: string
  }
}
