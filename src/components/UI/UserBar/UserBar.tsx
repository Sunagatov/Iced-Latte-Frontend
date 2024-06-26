'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getUserData } from '@/services/userService'
import { useErrorHandler } from '@/services/apiError/apiError'
import Button from '@/components/UI/Buttons/Button/Button'

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

  const userName = `${userData?.firstName?.[0] ?? ''}${userData?.lastName?.[0] ?? ''}`

  return (
    <Button
      id="user-btn"
      className=" flex h-12 w-12 items-center justify-center "
    >
      {userName}
    </Button>
  )
}

export default UserBar
