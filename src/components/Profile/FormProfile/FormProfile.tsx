'use client'
import 'react-calendar/dist/Calendar.css'
import { editUserProfile } from '@/services/userService'
import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { isValid as isValidDate, format } from 'date-fns'
import { ValuePiece, Value, FormProfileProps } from '../../../types/FormProfileTypes'
import { validationSchema } from '@/validation/userFormSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { UserData } from '@/types/services/UserServices'
import { useErrorHandler } from '@/services/apiError/apiError'
import Image from 'next/image'
import Button from '@/components/UI/Buttons/Button/Button'
import CalendarComponent from '@/components/UI/Calendar/Calendar'
import FormInput from '@/components/UI/FormInput/FormInput'
import ImageUpload from '@/components/UI/ImageUpload/ImageUpload'
import countries from '@/constants/countryData'

const FormProfile = ({
  onSuccessEdit,
  updateUserData,
  initialUserData,
}: Readonly<FormProfileProps>) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [date, setDate] = useState<Date | null>(new Date())
  const { errorMessage, handleError } = useErrorHandler()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserData>({
    resolver: yupResolver(validationSchema),
    defaultValues: initialUserData,
  })

  useEscapeKey(() => {
    setIsCalendarOpen(false)
  })

  // function to convert the date for the server
  const handleCalendarChange = (newDate: Value) => {
    if (newDate === null) {
      return
    }

    const selectedDate = Array.isArray(newDate)
      ? newDate[0]
      : (newDate as ValuePiece)

    if (isValidDate(selectedDate)) {
      const formattedDate =
        selectedDate instanceof Date ? format(selectedDate, 'yyyy-MM-dd') : ''

      setDate(selectedDate)
      setValue('birthDate', formattedDate)
    }
  }

  // function for opening and closing the calendar
  const handleCalendarToggle = () => {
    setIsCalendarOpen(!isCalendarOpen)
  }

  // function for closing the calendar by clicking anywhere in the viewport
  const clickBackdrop = (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent) => {
    if (e.currentTarget === e.target) {
      setIsCalendarOpen(false)
    }
  }

  const onSubmit: SubmitHandler<UserData> = async (data) => {
    try {
      await editUserProfile(data)
      onSuccessEdit()
      updateUserData(data)
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <div>
      <ImageUpload />
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-2xl font-medium text-primary">Personal details</h2>
        <div className="flex flex-col md:flex-row md:gap-[16px]">
          <div className="flex-grow md:w-[392px]">
            <FormInput
              id="firstName"
              register={register}
              label="First name"
              name="firstName"
              type="text"
              placeholder="Enter first name"
              error={errors.firstName}
              className="w-full"
            />
          </div>
          <div className="flex-grow md:w-[392px]">
            <FormInput
              id="lastName"
              register={register}
              label="Last name"
              name="lastName"
              type="text"
              placeholder="Enter last name"
              error={errors.lastName}
              className="w-full"
            />
          </div>
        </div>
        <div className="relative">
          <FormInput
            id="birthDate"
            register={register}
            label="Date of birth"
            name="birthDate"
            type="text"
            placeholder="Select date of birth. Date format YYYY-MM-DD"
          />
          <Image
            src="/open_select.svg"
            alt="calendar open icon"
            width={18}
            height={18}
            className={`absolute right-10 top-[60%] cursor-pointer transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`}
            onClick={handleCalendarToggle}
          />
          {isCalendarOpen && (
            <div
              className="fixed bottom-0 left-0 right-0 top-0 z-10"
              onClick={clickBackdrop}
              onKeyDown={clickBackdrop}
            >
              <div className="z-20">
                {isCalendarOpen && (
                  <CalendarComponent
                    onChange={handleCalendarChange}
                    isOpen={isCalendarOpen}
                    onClickBackdrop={clickBackdrop}
                    selectedDate={date}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          <FormInput
            id="phoneNumber"
            register={register}
            label="Phone number"
            name="phoneNumber"
            type="tel"
            placeholder="Enter phone number"
            error={errors.phoneNumber}
          />
        </div>
        <div>
          <FormInput
            id="email"
            register={register}
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email"
            error={errors.email}
          />
        </div>
        <h2 className="mb-[19px] mt-[32px] text-2xl font-medium text-primary">
          Delivery address
        </h2>
        <div className="relative">
          <label
            className="font-XS mb-3 block text-sm font-medium text-primary"
            htmlFor="country"
          >
            Country
          </label>
          <select
            id="country"
            {...register('address.country', {
              required: 'This field is required',
            })}
            className="placeholder:text-placeholder' block h-[54px] w-full cursor-pointer appearance-none rounded-lg bg-secondary p-2.5 text-L text-primary outline-focus"
          >
            <option value="" disabled>
              Select country
            </option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
          <Image
            src="/open_select.svg"
            alt="open select icon"
            className="pointer-events-none absolute right-2 top-[60%] -translate-y-[-60%] transform"
            width={14}
            height={14}
          />
          {errors.address?.country && (
            <span>{errors.address.country.message}</span>
          )}
        </div>
        <div>
          <FormInput
            id="city"
            register={register}
            label="City"
            name="address.city"
            type="text"
            placeholder="City"
            error={errors.address?.city}
          />
        </div>
        <div>
          <FormInput
            id="address"
            register={register}
            label="Address"
            name="address.line"
            type="text"
            placeholder="Address"
            error={errors.address?.line}
          />
        </div>
        <div>
          <FormInput
            id="postcode"
            register={register}
            label="Postcode"
            name="address.postcode"
            type="text"
            placeholder="Zip code"
            error={errors.address?.postcode}
          />
        </div>
        <div className="mt-4">
          {errorMessage && (
            <div className="mt-4 text-negative">
              {errorMessage}
            </div>
          )}
          <Button
            type="submit"
            className={`${Object.keys(errors).length > 0
              ? 'cursor-not-allowed bg-brand-solid opacity-20'
              : 'bg-brand-solid hover:bg-indigo-700'} mt-[24px] rounded-[47px] border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:outline-focus focus:ring-2 focus:ring-offset-2`}
          >
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FormProfile
