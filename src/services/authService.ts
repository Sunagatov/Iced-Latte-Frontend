import { ErrorResponse } from '@/models/ErrorResponse'
import { handleResponse } from '@/utils/handleResponse'

type SuccessResponse = {
  token: string
}

type LoginCredentials = {
  email: string
  password: string
}

type RegisterCredentials = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export async function apiRegisterUser(
  credentials: RegisterCredentials,
): Promise<SuccessResponse> {
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

    return handleResponse<SuccessResponse, ErrorResponse>(response)
  } catch (error) {
    throw new ServerError('Something went wrong')
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
    throw new ServerError('Something went wrong')
  }
}

export class ServerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerError'
  }
}
