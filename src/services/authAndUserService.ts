interface AuthData {
  token: string
}

export interface UserData {
  id: string
  firstName: string
  lastName: string
  birthDate: string | null
  phoneNumber: string | null
  stripeCustomerToken: string | null
  email: string
  address: string | null
}

export async function authenticateUser() {
  try {
    const authResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/auth/authenticate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'pass12345',
        }),
      },
    )

    if (!authResponse.ok) {
      throw new Error(authResponse.statusText)
    }

    const authData: AuthData = await authResponse.json()

    const authToken = authData.token

    return authToken
  } catch (error) {
    console.error('Authentication error:', error)
  }
}

export const getUserData = async (token: string, userId: string) => {
  try {
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!userResponse.ok) {
      throw new Error(`User data request failed: ${userResponse.statusText}`)
    }

    const userData: UserData = await userResponse.json()

    console.log('User data:', userData)

    return userData
  } catch (error) {
    console.error('User data fetch error:', error)
    throw error
  }
}
