/* eslint-disable @typescript-eslint/no-misused-promises */
'use client'
import 'react-calendar/dist/Calendar.css'
import { editUserProfile } from '@/services/authAndUserService'
import { useState, FormEvent } from 'react'
import { useAuthStore } from '@/store/authTokenStore'
import { useForm, SubmitHandler } from 'react-hook-form'
import { UserData } from '@/services/authAndUserService'
import { FormProfileProps } from './index'
import { isValid as isValidDate, format } from 'date-fns'
import { validationSchema } from '@/validation/userFormSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import CalendarComponent from '@/components/ui/Calendar'
import FormInput from '@/components/ui/FormInput'

type ValuePiece = Date | null

type Value = ValuePiece | [ValuePiece, ValuePiece]

const FormProfile = ({
  onSuccessEdit,
  updateUserData,
  initialUserData,
}: FormProfileProps) => {
  const [isCalendarOpen, setCalendarOpen] = useState(false)
  const [date, setDate] = useState<Date | null>(new Date())
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loadingImg, setLoadingImg] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserData>({
    resolver: yupResolver(validationSchema),
    defaultValues: initialUserData,
  })

  const { authToken } = useAuthStore()

  // Handler for changing the input element (input) to select an image.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement & { files: FileList }>,
  ) => {
    const selectedFile = e.target.files && e.target.files[0]

    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    } else {
      setFile(null)
      setPreview(null)
    }
  }

  // function for uploading the image to the server
  const handleUpload = /*async*/ (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (!file) return alert('No valid image file selected.')

    const formData = new FormData()

    formData.append('file', file)

    try {
      setLoadingImg(true)
      // const res = await uploadPhoto(formData)

      // if (!res) {
      //   alert('Error uploading image')

      //   return
      // }
      setFile(null)
      setPreview(null)
    } catch (error) {
      console.log('Ошибка при отправке запроса:', error)
    } finally {
      setLoadingImg(false)
    }
  }

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
    setCalendarOpen(!isCalendarOpen)
  }

  // function for closing the calendar by clicking anywhere in the viewport
  const clickBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      setCalendarOpen(false)
    }
  }

  const onSubmit: SubmitHandler<UserData> = async (data) => {
    try {
      if (authToken) {
        await editUserProfile(authToken, data)
        // await handleUpload()
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
      <label className="relative mb-12 box-border flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full  bg-[#F4F5F6]">
        <input
          className="updateUserInputImage whitespace-no-wrap clip-rect-0 clip-path-inset-1/2 m-neg1 absolute h-1 w-1 overflow-hidden border-0 p-0"
          type="file"
          accept="image/*"
          id="image"
          name="image"
          onChange={handleInputChange}
          aria-label="image"
        />
        {preview ? (
          <Image
            className=" h-full w-full rounded-full object-cover"
            src={preview}
            alt={`user preview`}
            width={100}
            height={100}
          />
        ) : (
          <Image
            src="/upload_photo.svg"
            alt="user photo"
            width={45}
            height={61}
          />
        )}

        <div
          className="absolute bottom-0 right-0 flex h-[40px] w-[40px] items-center justify-center rounded-full"
          onClick={handleUpload}
        >
          {loadingImg ? (
            <p>Loading...</p>
          ) : (
            <Image
              src={preview ? '/add_photo.svg' : '/edit_pen.png'}
              alt="eit pen icon"
              width={40}
              height={40}
            />
          )}
        </div>
      </label>
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
            placeholder="Select date of birth"
            error={errors.birthDate}
          />
          <Image
            src="/open_select.svg"
            alt="calendar open icon"
            width={18}
            height={18}
            className={`absolute right-10 top-[60%] cursor-pointer transition-transform ${
              isCalendarOpen ? 'rotate-180' : ''
            }`}
            onClick={handleCalendarToggle}
          />
          {isCalendarOpen && (
            <div
              className="fixed bottom-0 left-0 right-0 top-0 z-10"
              onClick={clickBackdrop}
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
            <option value="USA">United States</option>
            <option value="Canada">Canada</option>
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
          <Button
            type="submit"
            className={`${
              Object.keys(errors).length > 0
                ? 'cursor-not-allowed bg-brand-solid opacity-20'
                : 'bg-brand-solid hover:bg-indigo-700'
            } mt-[24px] rounded-[47px] border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:outline-focus focus:ring-2 focus:ring-offset-2`}
          >
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FormProfile
