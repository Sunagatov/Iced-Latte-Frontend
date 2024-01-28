import { AxiosResponse } from 'axios'
import { api, setAuth } from './apiConfig/apiConfig'
import { UserData } from '@/types/services/UserServices'

export const getUserData = async (token: string): Promise<UserData> => {
  try {
    setAuth(token)

    const response: AxiosResponse<UserData> = await api.get('/users')

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export const editUserProfile = async (
  token: string,
  updatedUserData: Partial<UserData>,
): Promise<UserData> => {
  try {
    setAuth(token)

    const response: AxiosResponse<UserData> = await api.put(
      '/users',
      updatedUserData,
    )

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function uploadImage(file: File, token: string): Promise<string> {
  try {
    const formData = new FormData()

    formData.append('file', file)

    setAuth(token)

    const response: AxiosResponse<string> = await api.post(
      '/users/avatar',
      formData,
    )

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export async function getAvatar(token: string) {
  try {
    setAuth(token)

    const response: AxiosResponse<string> = await api.get('/users/avatar')

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}
