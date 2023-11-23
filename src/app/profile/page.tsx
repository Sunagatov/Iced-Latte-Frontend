const ProfilePage = async () => {
  const userId = '11111111-1111-1111-1111-111111111111'

  async function authenticateUser() {
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

      const authData = await authResponse.json()

      const authToken = authData.token

      return authToken
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  const authToken = await authenticateUser()

  async function getUserData(token, userId) {
    await authenticateUser()
    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST_REMOTE}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // if (!userResponse.ok) {
      //   throw new Error(userResponse.statusText)
      // }

      const userData = await userResponse.json()

      // console.log('User data:', userData)

      return userData
    } catch (error) {
      console.error('User data fetch error:', error)
    }
  }

  if (authToken) {
    const userData = await getUserData(authToken, userId)

    console.log(userData)
  }

  return <div>Profile Page</div>
}

export default ProfilePage
