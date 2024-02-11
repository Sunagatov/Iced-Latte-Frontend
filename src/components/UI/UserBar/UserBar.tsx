'use client'
import Image from 'next/image'
import getImgUrl from '@/utils/getImgUrl'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getUserData } from '@/services/userService'
import { useErrorHandler } from '@/services/apiError/apiError'

const UserBar = () => {
  const { setUserData, userData } = useAuthStore()
  const { handleError } = useErrorHandler()
  const uploadImg = '/profile.png'

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

  const userName = userData?.firstName ?? ''
  const displayUserName = userName.length > 9 ? userName.substring(0, 9) + '...' : userName

  return (
    <div className='flex gap-[10px] items-center sm:bg-tertiary rounded-full px-4 py-1'>
      <div className='w-[30px] h-[30px] rounded-full'>
        <Image src={getImgUrl(userData?.avatarLink, uploadImg)} alt="User profile" width={30} height={30} />
      </div>
      <div className={`text-primary font-medium text-[12px] md:text-[16px] overflow-hidden whitespace-nowrap sm:block hidden`}>
        {displayUserName}
      </div>
    </div>
  )
}

export default UserBar
