import { AxiosResponse } from 'axios'
import { api } from './apiConfig/apiConfig'
import { UserData } from '@/types/services/UserServices'

export const getUserData = async (): Promise<UserData> => {
  const response: AxiosResponse<UserData> = await api.get('/users')

  return response.data
}

export const editUserProfile = async (
  updatedUserData: Partial<UserData>,
): Promise<UserData> => {
  const response: AxiosResponse<UserData> = await api.put(
    '/users',
    updatedUserData,
  )

  return response.data
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()

  formData.append('file', file)

  const response: AxiosResponse<string> = await api.post(
    '/users/avatar',
    formData,
  )

  return response.data
}

export async function getAvatar() {
  const response: AxiosResponse<string> = await api.get('/users/avatar')

  return response.data
}
