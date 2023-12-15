type SuccessResponse = {
  token: string
}

type ErrorResponse = {
  message: string
  httpStatusCode: number
  timestamp: string
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

async function handleResponse<T, E>(response: Response): Promise<T> {
  const data: T | E = await response.json()

  if (!response.ok) {
    throw new Error((data as ErrorResponse).message)
  }

  return data as T
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
      `${process.env.NEXT_PUBLIC_API_HOST_DOCKER}/auth/authenticate`,
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
    this.name = 'ValidationError'
  }
}
