import { UserData } from '@/types/services/UserServices'

const BASE_URL = process.env.NEXT_PUBLIC_API_HOST_REMOTE

// get user profile data
export const getUserData = async (token: string) => {
  try {
    const userResponse = await fetch(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error(`User data request failed: ${userResponse.statusText}`)
    }

    const userData: UserData = await userResponse.json()

    return userData
  } catch (error) {
    console.error('User data fetch error:', error)
    throw error
  }
}

// edit user profile
export const editUserProfile = async (
  token: string,
  updatedUserData: Partial<UserData>,
) => {
  try {
    const editResponse = await fetch(`${BASE_URL}/users`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUserData),
    })

    if (!editResponse.ok) {
      throw new Error(`Profile edit request failed: ${editResponse.statusText}`)
    }

    const editedUserData: UserData = await editResponse.json()

    return editedUserData
  } catch (error) {
    console.error('Profile edit error:', error)
    throw error
  }
}

// user avatar upload
export async function uploadImage(file: File, token: string): Promise<string> {
  const formData = new FormData()

  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/users/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`)
  }

  const result: string = await response.text()

  return result
}

// get a user image
export async function getAvatar(token: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/users/avatar`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Avatar request failed: ${response.statusText}`)
    }

    const avatarUrl: string = await response.text()

    return avatarUrl
  } catch (error) {
    console.error('Avatar fetch error:', error)
    throw error
  }
}
