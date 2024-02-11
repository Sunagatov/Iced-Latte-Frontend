'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { removeCookie } from '@/utils/cookieUtils'
import { useFavouritesStore } from '@/store/favStore'
import FormProfile from '../FormProfile/FormProfile'
import ProfileInfo from '../ProfileInfo/ProfileInfo'
import Button from '@/components/UI/Buttons/Button/Button'
import ImageUpload from '@/components/UI/ImageUpload/ImageUpload'
import Link from 'next/link'

const FiledProfile = () => {
  const [isSuccessEditUser, setIsSuccessEditUser] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { reset, setUserData, userData } = useAuthStore()
  const { resetFav } = useFavouritesStore()

  const router = useRouter()

  const handleSuccessEdit = () => {
    setIsSuccessEditUser(true)
    setIsEditing(false)
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setIsSuccessEditUser(false)
  }

  const handleLogout = async () => {
    try {
      // logic logout
      reset()
      await removeCookie('token')
      router.push('/')
      resetFav()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="pb-[40px] pt-10 md:pb-[414px]">
      <div className="ml-auto mr-auto max-w-[800px] pl-[10px] pr-[10px] md:pl-[10px] md:pr-[10px]">
        <div className="mb-10 flex w-full items-center justify-between">
          <h1 className="w-[100px] text-lg font-medium text-primary md:w-[350px]">
            Your Account
          </h1>
          <div>
            <Button
              className="flex items-center justify-center rounded-full bg-secondary px-6 py-4 text-lg font-medium text-primary transition-opacity hover:opacity-60"
              onClick={handleLogout}
            >
              <span>Log out</span>
            </Button>
          </div>
        </div>
        <div className="mb-4 text-sm font-medium text-primary">
          Profile image
        </div>
        {isSuccessEditUser && !isEditing ? (
          <>
            <ImageUpload />
            <ProfileInfo
              userData={userData}
              onEditClick={handleEditClick}
            />
          </>
        ) : (
          <FormProfile
            onSuccessEdit={handleSuccessEdit}
            updateUserData={setUserData}
            initialUserData={userData ?? {}}
          />
        )}
        <div className="mt-[51px]">
          <h3 className="mb-[16px] text-2xl font-medium text-primary">
            Password
          </h3>
          <Link href="/">
            <Button className="flex items-center justify-center rounded-[47px] bg-secondary px-6 py-4 text-lg font-medium text-primary transition-opacity hover:opacity-60">
              <span>Change password</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FiledProfile
