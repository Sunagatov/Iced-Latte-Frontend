'use client'
import { useState, useEffect } from 'react'
import {
  authenticateUser,
  getUserData,
  UserData,
} from '@/services/authAndUserService'
import Image from 'next/image'
import Container from '@/components/Container/Container'

const FiledProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const userId = '11111111-1111-1111-1111-111111111111'

  console.log(userData)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = await authenticateUser()

        if (authToken) {
          const userData = await getUserData(authToken, userId)

          setUserData(userData)
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Profile page error:', error.message)
        } else {
          console.error('Profile page error:', 'An unknown error occurred')
        }
      }
    }

    fetchData().catch((error) => {
      if (error instanceof Error) {
        console.error('Profile page error:', error.message)
      } else {
        console.error('Profile page error:', 'An unknown error occurred')
      }
    })
  }, [userId])

  return (
    <div className="pb-[414px] pt-10">
      <Container>
        <div className="mb-10 flex items-center justify-between ">
          <h1 className="text-decoration-color: #04121B text-4xl font-medium">
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
        {/* <div> */}
        <div className="text-decoration-color: #04121B mb-4 text-sm font-medium">
          Profile image
        </div>
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
        {/* </div> */}
        {/* {userData && ( */}
        <div>
          <h2 className="text-decoration-color: #04121B mb-8 text-2xl font-medium">
            Personal details
          </h2>
          <ul className="mb-10 flex flex-col gap-y-6">
            <li className="flex">
              <span className="w-[152px] decoration-[#04121B] opacity-60">
                First name:
              </span>
              John
              {/*userData.firstName*/}
            </li>
            <li className="flex">
              <span className="w-[152px] decoration-[#04121B] opacity-60">
                Last name:
              </span>
              Smith
              {/*userData.lastName*/}
            </li>
            <li className="flex">
              <span className="w-[152px] decoration-[#04121B] opacity-60">
                Date of birth:
              </span>
              10 January 1999
              {/*userData.birthDate || 'N/A'*/}
            </li>
            <li className="flex">
              <span className="w-[152px] decoration-[#04121B] opacity-60">
                Email:
              </span>
              email@gmail.com {/*userData.email*/}
            </li>
            <li className="flex">
              <span className="w-[152px] decoration-[#04121B] opacity-60">
                Phone number:
              </span>
              (628) 267-9041
              {/*userData.phoneNumber || 'N/A'*/}
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
                US
                {/*userData.address?.country || 'N/A'*/}
              </li>
              <li className="flex">
                <span className="w-[152px] decoration-[#04121B] opacity-60">
                  City:
                </span>
                Menlo Park
                {/*userData.address?.city || 'N/A'*/}
              </li>
              <li className="flex">
                <span className="w-[152px] decoration-[#04121B] opacity-60">
                  Address:
                </span>
                1226 University Dr
                {/*userData.address?.address || 'N/A'*/}
              </li>
              <li className="flex">
                <span className="w-[152px] decoration-[#04121B] opacity-60">
                  Postcode:
                </span>
                94025-4221
                {/*userData.address?.postcode || 'N/A'*/}
              </li>
            </ul>
            <button
              className="mb-[32px] flex w-[130px] cursor-pointer items-center justify-center rounded-[47px] bg-[#682EFF] px-6 py-4 text-lg font-medium text-white transition-opacity  hover:opacity-60"
              type="button"
            >
              Edit
            </button>
          </div>

          <div>
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
        </div>
        {/* )} */}
      </Container>
    </div>
  )
}

export default FiledProfile
