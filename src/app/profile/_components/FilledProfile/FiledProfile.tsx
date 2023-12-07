'use client'
import { useState, useEffect } from 'react'
import {
  authenticateUser,
  getUserData,
  UserData,
} from '@/services/authAndUserService'
import Image from 'next/image'
import ButtonSubmit from '@/components/ui/DinamycButton'

const showError = (error: unknown) => {
  if (error instanceof Error) {
    alert(`An error occurred: ${error.message}`)
  } else {
    alert(`An unknown error occurred`)
  }
}

const FiledProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null)

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
        const authToken = await authenticateUser()

        if (authToken) {
          const userData = await getUserData(authToken)

          setUserData(userData)
        }
      } catch (error) {
        showError(error)
      }
    }

    fetchData().catch((error) => {
      showError(error)
    })
  }, [])

  const handleLogout = /*async*/ () => {
    try {
      //await logout
    } catch (error) {
      showError(error)
    }
  }

  return (
    <div className="pb-[414px] pt-10">
      <div className="ml-auto mr-auto max-w-[1440px] pl-[10px] pr-[10px]">
        <div className="mb-10 flex items-center justify-between ">
          <h1 className=" w-[200px] text-lg font-medium text-primary md:w-[350px]">
            Your Account
          </h1>
          <div>
            <ButtonSubmit
              className="rounded-full bg-secondary px-6 py-4 text-lg font-medium text-primary transition-opacity hover:opacity-60"
              value="Log out"
              onClick={handleLogout}
            />
          </div>
        </div>
        <div className="mb-4 text-sm font-medium text-primary">
          Profile image
        </div>
        <div className="relative mb-12 box-border flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full  bg-secondary">
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
        {userData && (
          <div>
            <h2 className="mb-8 text-2xl font-medium text-primary">
              Personal details
            </h2>
            <ul className="mb-10 flex flex-col gap-y-6">
              <li className="flex">
                <span className="w-[152px] text-primary opacity-60">
                  First name:
                </span>
                {userData.firstName}
              </li>
              <li className="flex">
                <span className="w-[152px] text-primary opacity-60">
                  Last name:
                </span>
                {userData.lastName}
              </li>
              <li className="flex">
                <span className="w-[152px] text-primary opacity-60">
                  Date of birth:
                </span>
                {userData.birthDate ? formatDate(userData.birthDate) : 'N/A'}
              </li>
              <li className="flex">
                <span className="w-[152px] text-primary opacity-60">
                  Email:
                </span>
                {userData.email}
              </li>
              <li className="flex">
                <span className="w-[152px] text-primary opacity-60">
                  Phone number:
                </span>
                {userData.phoneNumber || 'N/A'}
              </li>
            </ul>

            <div>
              <h3 className="mb-8 text-2xl font-medium text-primary">
                Delivery address
              </h3>
              <ul className="mb-10 flex flex-col gap-y-6">
                <li className="flex">
                  <span className="w-[152px] text-primary opacity-60">
                    Country:
                  </span>
                  {userData.address?.country || 'N/A'}
                </li>
                <li className="flex">
                  <span className="w-[152px] text-primary opacity-60">
                    City:
                  </span>
                  {userData.address?.city || 'N/A'}
                </li>
                <li className="flex">
                  <span className="w-[152px] text-primary opacity-60">
                    Address:
                  </span>
                  {userData.address?.line || 'N/A'}
                </li>
                <li className="flex">
                  <span className="w-[152px] text-primary opacity-60">
                    Postcode:
                  </span>
                  {userData.address?.postcode || 'N/A'}
                </li>
              </ul>
              <ButtonSubmit
                className="mb-[32px] flex w-[130px] cursor-pointer items-center justify-center rounded-[47px] bg-brand-solid px-6 py-4 text-lg font-medium text-white transition-opacity  hover:opacity-60"
                value="Edit"
              />
            </div>

            <div>
              <h3 className="mb-[16px] text-2xl font-medium text-primary">
                Password
              </h3>
              <ButtonSubmit
                className="flex items-center justify-center rounded-[47px] bg-secondary px-6 py-4 text-lg font-medium text-primary transition-opacity  hover:opacity-60"
                value="Change password"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FiledProfile
