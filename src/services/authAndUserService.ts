export interface AuthData {
  token: string
}

export interface UserData {
  firstName: string
  lastName: string
  birthDate: string
  phoneNumber: string
  email: string
  address: {
    country: string
    city: string
    line: string
    postcode: string
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_HOST_DOCKER

export async function authenticateUser() {
  try {
    const authResponse = await fetch(`${BASE_URL}/auth/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'pass12345',
      }),
    })

    if (!authResponse.ok) {
      throw new Error(authResponse.statusText)
    }

    const authData: AuthData = await authResponse.json()

    const authToken = authData?.token

    if (!authToken) {
      throw new Error('Authentication failed. Token is null or undefined.')
    }

    return authToken
  } catch (error) {
    console.error('Authentication error:', error)
  }
}

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
