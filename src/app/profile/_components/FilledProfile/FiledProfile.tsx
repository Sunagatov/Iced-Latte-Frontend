'use client'
import { useState, useEffect } from 'react'
import { getUserData, UserData } from '@/services/authAndUserService'
import Image from 'next/image'
import Container from '@/components/Container/Container'
import FormProfile from '../FormProfile/FormProfile'
import { useAuthStore } from '@/store/authTokenStore'

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
  const { authToken, setAuthToken } = useAuthStore()

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

  return (
    <div className="pb-[414px] pt-10">
      <Container>
        <div className="mb-10 flex items-center justify-between ">
          <h1 className="text-decoration-color: #04121B w-[200px] text-4xl font-medium md:w-[350px]">
            Your Account
          </h1>
          <div>
            <button
              className="text-decoration-color: #04121B rounded-full bg-[#F4F5F6] px-6 py-4 text-lg font-medium transition-opacity hover:opacity-60"
              type="button"
            >
              Log out
            </button>
          </div>
        </div>
        <div className="text-decoration-color: #04121B mb-4 text-sm font-medium">
          Profile image
        </div>
        {isSuccessEditUser && !isEditing ? (
          <>
            <div className="relative mb-12 box-border flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full  bg-[#F4F5F6]">
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
            </div>
            {isLoading && <div className="text-center">Loading...</div>}
            {userData && (
              <div>
                <h2 className="text-decoration-color: #04121B mb-8 text-2xl font-medium">
                  Personal details
                </h2>
                <ul className="mb-10 flex flex-col gap-y-6">
                  <li className="flex">
                    <span className="w-[152px] decoration-[#04121B] opacity-60">
                      First name:
                    </span>
                    {userData.firstName}
                  </li>
                  <li className="flex">
                    <span className="w-[152px] decoration-[#04121B] opacity-60">
                      Last name:
                    </span>
                    {userData.lastName}
                  </li>
                  <li className="flex">
                    <span className="w-[152px] decoration-[#04121B] opacity-60">
                      Date of birth:
                    </span>
                    {userData.birthDate
                      ? formatDate(userData.birthDate)
                      : 'N/A'}
                  </li>
                  <li className="flex">
                    <span className="w-[152px] decoration-[#04121B] opacity-60">
                      Email:
                    </span>
                    {userData.email}
                  </li>
                  <li className="flex">
                    <span className="w-[152px] decoration-[#04121B] opacity-60">
                      Phone number:
                    </span>
                    {userData.phoneNumber || 'N/A'}
                  </li>
                </ul>

                <div>
                  <h3 className="text-decoration-color: #04121B mb-8 text-2xl font-medium">
                    Delivery address
                  </h3>
                  <ul className="mb-10 flex flex-col gap-y-6">
                    <li className="flex">
                      <span className="w-[152px] decoration-[#04121B] opacity-60">
                        Country:
                      </span>
                      {userData.address?.country || 'N/A'}
                    </li>
                    <li className="flex">
                      <span className="w-[152px] decoration-[#04121B] opacity-60">
                        City:
                      </span>
                      {userData.address?.city || 'N/A'}
                    </li>
                    <li className="flex">
                      <span className="w-[152px] decoration-[#04121B] opacity-60">
                        Address:
                      </span>
                      {userData.address?.line || 'N/A'}
                    </li>
                    <li className="flex">
                      <span className="w-[152px] decoration-[#04121B] opacity-60">
                        Postcode:
                      </span>
                      {userData.address?.postcode || 'N/A'}
                    </li>
                  </ul>
                  <button
                    onClick={handleEditClick}
                    className="mb-[32px] flex w-[130px] cursor-pointer items-center justify-center rounded-[47px] bg-[#682EFF] px-6 py-4 text-lg font-medium text-white transition-opacity  hover:opacity-60"
                    type="button"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <FormProfile
            onSuccessEdit={handleSuccessEdit}
            updateUserData={setUserData}
          />
        )}
        <div className="mt-[51px]">
          <h3 className="mb-[16px] text-2xl font-medium text-[#04121B]">
            Password
          </h3>
          <button
            className="flex items-center justify-center rounded-[47px] bg-[#F4F5F6] px-6 py-4 text-lg font-medium text-[#04121B] transition-opacity  hover:opacity-60"
            type="button"
          >
            Change password
          </button>
        </div>
      </Container>
    </div>
  )
}

export default FiledProfile
