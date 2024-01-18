import { handleResponse } from '@/utils/handleResponse'
import {
  SuccessResponse,
  LoginCredentials,
  RegisterCredentials,
  ConfirmEmailResponse,
  ErrorResponse,
} from '@/types/services/AuthServices'

export async function apiConfirmEmail(
  token: string | null,
): Promise<ConfirmEmailResponse> {
  try {
    if (!token) {
      throw new Error('Token is null or undefined')
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/auth/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
      },
    )

    if (!response.ok) {
      const errorResponse: ErrorResponse = await response.json()

      if (errorResponse.message) {
        throw new Error(`Confirm registration failed: ${errorResponse.message}`)
      }

      throw new Error(
        `Confirm registration failed: ${JSON.stringify(errorResponse)}`,
      )
    }

    const responseData: ConfirmEmailResponse = {
      token: await response.json(),
      httpStatusCode: response.status,
    }

    return responseData
  } catch (error) {
    console.error('confirm email:', error)
    throw error
  }
}

export async function apiRegisterUser(credentials: RegisterCredentials) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      },
    )

    if (!response.ok) {
      const errorResponse: ErrorResponse = await response.json()

      if (errorResponse.message) {
        throw new Error(`Registration failed: ${errorResponse.message}`)
      }

      throw new Error(`Registration failed: ${JSON.stringify(errorResponse)}`)
    }

    const registerData = await response.text()

    return registerData
  } catch (error) {
    console.error('Registration failed:', error)
    throw error
  }
}

export async function apiLoginUser(
  credentials: LoginCredentials,
): Promise<SuccessResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/auth/authenticate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      },
    )

    return handleResponse<SuccessResponse, ErrorResponse>(response)
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

export class ServerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerError'
  }
}
