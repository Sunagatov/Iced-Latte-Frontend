export type SuccessResponse = {
  token: string
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
  }
  httpStatusCode: number
}

export interface ErrorResponse {
  message: string
  httpStatusCode: number
}
