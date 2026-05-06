'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'
import { useToastErrorHandler } from '@/shared/utils/apiError'

const UserBar = () => {
  const { setUserData, userData } = useAuthStore()
  const { handleError } = useToastErrorHandler()

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
    <div
      id="user-btn"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-solid text-[11px] font-bold text-white transition hover:bg-brand-solid-hover"
    >
      {userName}
    </div>
  )
}

export default UserBar
