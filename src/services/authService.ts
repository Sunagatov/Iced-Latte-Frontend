interface ISuccessResponse {
  token: string
}

interface IErrorResponse {
  message: string
  httpStatusCode: number
  timestamp: string
}

interface ILoginCredentials {
  email: string
  password: string
}

interface IRegisterCredentials {
  firstName: string
  lasName: string
  email: string
  password: string
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new Error((data as IErrorResponse).message)
  }

  return data as T
}

export async function apiRegisterUser(
  credentials: IRegisterCredentials,
): Promise<ISuccessResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/auth/register`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      },
    )

    return handleResponse<ISuccessResponse>(response)
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message)
    else throw new Error('Something went wrong')
  }
}

export async function apiLoginUser(
  credentials: ILoginCredentials,
): Promise<ISuccessResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/auth/authenticate`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      },
    )

    return handleResponse<ISuccessResponse>(response)
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message)
    else throw new Error('Something went wrong')
  }
}
