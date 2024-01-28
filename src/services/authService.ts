import {
  SuccessResponse,
  SuccessRefreshToken,
  LoginCredentials,
  RegisterCredentials,
  ConfirmEmailResponse,
} from '@/types/services/AuthServices'
import { api, setAuth } from './apiConfig/apiConfig'
import { AxiosResponse } from 'axios'

// Function for user registration
export async function apiRegisterUser(
  credentials: RegisterCredentials,
): Promise<string> {
  try {
    const response: AxiosResponse<string> = await api.post(
      '/auth/register',
      credentials,
    )

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

// Function for confirm email
export async function apiConfirmEmail(
  token: string | null,
): Promise<ConfirmEmailResponse> {
  try {
    if (!token) {
      throw new Error('Token is null or undefined')
    }

    const response = await api.post('/auth/confirm', { token })

    const responseData: ConfirmEmailResponse = {
      token: response.data,
      httpStatusCode: response.status,
    }

    return responseData
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

// Function for login user
export async function apiLoginUser(
  credentials: LoginCredentials,
): Promise<SuccessResponse> {
  try {
    const response: AxiosResponse<SuccessResponse> = await api.post(
      '/auth/authenticate',
      credentials,
    )

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

// Function for refresh token
export async function apiRefreshToken(
  refreshToken: string | null,
): Promise<SuccessRefreshToken> {
  try {
    setAuth(refreshToken)

    const response: AxiosResponse<SuccessRefreshToken> =
      await api.post('/auth/refresh')

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export class ServerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerError'
  }
}
