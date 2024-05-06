'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getUserData } from '@/services/userService'
import { useErrorHandler } from '@/services/apiError/apiError'
import Button from '@/components/UI/Buttons/Button/Button'
import { UserData } from '@/types/services/UserServices'

const UserBar = () => {
  const { setUserData, userData } = useAuthStore()
  const { handleError } = useErrorHandler()

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserData()

      setUserData(userData)
    }

    fetchData().catch((error) => {
      handleError(error)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayUserName = (userData: UserData) => {
    const userName = `${userData?.firstName?.[0] ?? ''}${userData?.lastName?.[0] ?? ''}`

    return userName.length > 9 ? userName.substring(0, 9) + '...' : userName
  }

  return (
    <Button className="mx-5 flex w-14 items-center justify-center sm:ml-9">
      {userData ? displayUserName(userData) : 'Loading...'}
    </Button>
  )
}

export default UserBar
