'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { getUserData } from '@/features/user/api'
import { useErrorHandler } from '@/shared/utils/apiError'

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
    <div
      id="user-btn"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B4332] text-[11px] font-bold text-white transition hover:bg-[#143728]"
    >
      {userName}
    </div>
  )
}

export default UserBar
