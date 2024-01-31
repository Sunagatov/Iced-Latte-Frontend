import { AxiosResponse } from 'axios'
import { api } from './apiConfig/apiConfig'
import { UserData } from '@/types/services/UserServices'

export const getUserData = async (): Promise<UserData> => {
  try {
    const response: AxiosResponse<UserData> = await api.get('/users')

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}

export const editUserProfile = async (
  updatedUserData: Partial<UserData>,
): Promise<UserData> => {
  try {
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

export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData()

    formData.append('file', file)

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

export async function getAvatar() {
  try {
    const response: AxiosResponse<string> = await api.get('/users/avatar')

    return response.data
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unknown error occurred')
  }
}
