'use client'
import { useState, useEffect } from 'react'
import { getUserData, UserData } from '@/services/authAndUserService'
import Image from 'next/image'
import FormProfile from '../FormProfile/FormProfile'
import { useAuthStore } from '@/store/authTokenStore'
import ProfileInfo from '../ProfileInfo/ProfileInfo'
import Button from '@/components/ui/Button'

const showError = (error: unknown) => {
  if (error instanceof Error) {
    alert(`An error occurred: ${error.message}`)
  } else {
    alert(`An unknown error occurred`)
  }
}

const FiledProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isSuccessEditUser, setIsSuccessEditUser] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { authToken, setAuthToken, loading } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        await setAuthToken()

        if (authToken) {
          const userData = await getUserData(authToken)

          setUserData(userData)
        }
      } catch (error) {
        showError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData().catch((error) => {
      showError(error)
    })
  }, [authToken, setAuthToken])

  const handleSuccessEdit = () => {
    setIsSuccessEditUser(true)
    setIsEditing(false)
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setIsSuccessEditUser(false)
  }

  // Function for formatting the date into the desired format
  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'N/A'
    }

    const date = new Date(dateString)
    const day = date.getDate()
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
      date,
    )
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
  }

  const handleLogout = /*async*/ () => {
    try {
      //await logout
    } catch (error) {
      showError(error)
    }
  }

  return (
    <div className="pb-[414px] pt-10">
      <div className="ml-auto mr-auto max-w-[1220px] pl-[10px] pr-[10px]">
        <div className="mb-10 flex items-center justify-between ">
          <h1 className=" w-[200px] text-lg font-medium text-primary md:w-[350px]">
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
        {loading && <p>Loading...</p>}
        {isSuccessEditUser && !isEditing ? (
          <>
            <label
              htmlFor="image"
              className="relative mb-12 box-border flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full  bg-secondary"
            >
              <input
                className="updateUserInputImage whitespace-no-wrap clip-rect-0 clip-path-inset-1/2 m-neg1 absolute h-1 w-1 overflow-hidden border-0 p-0"
                type="file"
                accept="image/*"
                id="image"
                name="image"
                // onChange={handleInputChange}
                aria-label="image"
              />
              <Image
                src="/upload_photo.svg"
                alt="user photo"
                width={45}
                height={61}
              />
              <div className="absolute bottom-0 right-0 flex h-[40px] w-[40px] items-center justify-center rounded-full">
                <Image
                  src="/edit_pen.png"
                  alt="eit pen icon"
                  width={40}
                  height={40}
                />
              </div>
            </label>
            <ProfileInfo
              userData={userData}
              isLoading={isLoading}
              onEditClick={handleEditClick}
              formatDate={formatDate}
            />
          </>
        ) : (
          <FormProfile
            onSuccessEdit={handleSuccessEdit}
            updateUserData={setUserData}
            initialUserData={userData || {}}
          />
        )}
        <div className="mt-[51px]">
          <h3 className="mb-[16px] text-2xl font-medium text-primary">
            Password
          </h3>
          <Button className="flex items-center justify-center rounded-[47px] bg-secondary px-6 py-4 text-lg font-medium text-primary transition-opacity hover:opacity-60">
            <span>Change password</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FiledProfile
