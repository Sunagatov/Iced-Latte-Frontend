import { ErrorResponse } from '@/types/ErrorResponse'

export async function handleResponse<T, E>(response: Response): Promise<T> {
  const data: T | E = await response.json()

  if (!response.ok) {
    throw new Error((data as ErrorResponse).message)
  }

  return data as T
}
