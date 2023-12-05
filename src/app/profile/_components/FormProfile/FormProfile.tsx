/* eslint-disable @typescript-eslint/no-misused-promises */
'use client'
import Container from '@/components/Container/Container'
import { editUserProfile } from '@/services/authAndUserService'
import Image from 'next/image'
import { useAuthStore } from '@/store/authTokenStore'
import { useForm, SubmitHandler } from 'react-hook-form'
import { UserData } from '@/services/authAndUserService'
import { FormProfileProps } from './index'

const FormProfile: React.FC<FormProfileProps> = ({
  onSuccessEdit,
  updateUserData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UserData>()

  const { authToken } = useAuthStore()

  const onSubmit: SubmitHandler<UserData> = async (data) => {
    try {
      if (authToken) {
        await editUserProfile(authToken, data)
        onSuccessEdit()
        updateUserData(data)
      } else {
        console.error('Authentication failed. Token is null or undefined.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div>
      <Container>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Personal details</h2>
          <div>
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              placeholder="Enter first name"
              {...register('firstName', { required: 'This field is required' })}
            />
            {errors.firstName && <span>{errors.firstName.message}</span>}
          </div>
          <div>
            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              placeholder="Enter last name"
              {...register('lastName', { required: 'This field is required' })}
            />
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </div>
          <div>
            <label htmlFor="birthDate">Date of birth</label>
            <input
              type="text"
              id="birthDate"
              placeholder="Select date of birth"
              {...register('birthDate', { required: 'This field is required' })}
            />
            {errors.birthDate && <span>{errors.birthDate.message}</span>}
          </div>
          <div>
            <label htmlFor="phoneNumber">Phone number</label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="Enter phone number"
              {...register('phoneNumber', {
                required: 'This field is required',
              })}
            />
            {errors.phoneNumber && <span>{errors.phoneNumber.message}</span>}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              {...register('email', { required: 'This field is required' })}
            />
            {errors.email && <span>{errors.email.message}</span>}
          </div>
          <h2>Delivery address</h2>
          <div>
            <label htmlFor="country">Country</label>
            <select
              id="country"
              {...register('address.country', {
                required: 'This field is required',
              })}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            >
              <option value="" disabled>
                Select country
              </option>
              <option value="USA">United States</option>
              <option value="Canada">Canada</option>
            </select>
            {errors.address?.country && (
              <span>{errors.address.country.message}</span>
            )}
          </div>
          <div>
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              placeholder="City"
              {...register('address.city', {
                required: 'This field is required',
              })}
            />
            {errors.address?.city && <span>{errors.address.city.message}</span>}
          </div>
          <div>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              placeholder="Address"
              {...register('address.line', {
                required: 'This field is required',
              })}
            />
            {errors.address?.line && <span>{errors.address.line.message}</span>}
          </div>
          <div>
            <label htmlFor="postcode">Postcode</label>
            <input
              type="text"
              id="postcode"
              placeholder="Zip code"
              {...register('address.postcode', {
                required: 'This field is required',
              })}
            />
            {errors.address?.postcode && (
              <span>{errors.address.postcode.message}</span>
            )}
          </div>
          <div className="mt-4">
            <button
              disabled={!isValid}
              type="submit"
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Container>
    </div>
  )
}

export default FormProfile
