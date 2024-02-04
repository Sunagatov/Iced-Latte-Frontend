'use client'
import Image from 'next/image'
import getImgUrl from '@/utils/getImgUrl'
import { getUserData } from '@/services/userService'
import { useEffect, useState } from 'react'
import { UserData } from '@/types/services/UserServices'
import { useErrorHandler } from '@/services/apiError/apiError'

const UserBar = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const { errorMessage, handleError } = useErrorHandler()
  const uploadImg = '/profile.png'

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserData()

      setUserData(userData)

    }

    fetchData()
      .catch((error) => {
        handleError(error)
      })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {errorMessage && (
        <div className="mt-4 text-negative">
          {errorMessage}
        </div>
      )}
      <div className='flex gap-[10px] items-center sm:bg-tertiary rounded-full px-4 py-1'>
        <div className='w-[30px] h-[30px] rounded-full'>
          <Image src={getImgUrl(userData?.avatarLink, uploadImg)} alt="User profile" width={30} height={30} />
        </div>
        <div className='text-primary font-medium'>{userData?.firstName}</div>
      </div>
    </>
  )
}

export default UserBar
