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
import Image from 'next/image'
import Button from '@/components/ui/Button'
import CalendarComponent from '@/components/ui/Calendar'
import FormInput from '@/components/ui/FormInput'
// import { validationSchema } from '@/validation/userFormSchema'
// import { yupResolver } from '@hookform/resolvers/yup'

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
    // resolver: yupResolver(validationSchema),
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
        <h2>Personal details</h2>
        <FormInput
          id="firstName"
          register={register}
          label="First name"
          name="firstName"
          type="text"
          placeholder="Enter first name"
          error={errors.firstName}
        />
        {/* <div>
          <label htmlFor="firstName">First name</label>
          <input
            type="text"
            id="firstName"
            placeholder="Enter first name"
            {...register('firstName', { required: 'This field is required' })}
          />
          {errors.firstName && <span>{errors.firstName.message}</span>}
        </div> */}
        <div>
          <FormInput
            id="lastName"
            register={register}
            label="Last name"
            name="lastName"
            type="text"
            placeholder="Enter last name"
            error={errors.lastName}
          />
          {/* <label htmlFor="lastName">Last name</label>
          <input
            type="text"
            id="lastName"
            placeholder="Enter last name"
            {...register('lastName', { required: 'This field is required' })}
          />
          {errors.lastName && <span>{errors.lastName.message}</span>} */}
        </div>
        <div>
          {/* <label htmlFor="birthDate">Date of birth</label>
          <input
            className="relative"
            type="text"
            id="birthDate"
            placeholder="Select date of birth"
            {...register('birthDate', {
              required: 'This field is required',
              validate: (value) => {
                const parsedDate =
                  value !== null ? parse(value, 'yyyy-MM-dd', new Date()) : null

                return (
                  isValidDate(parsedDate) ||
                  'Incorrect date format. Use YYYY-MM-DD'
                )
              },
            })}
          /> */}
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
            src="/calendar.svg"
            alt="calendar icon"
            width={18}
            height={18}
            className="absolute right-10 top-1/2"
            onClick={handleCalendarToggle}
          />
          {/* {errors.birthDate && <span>{errors.birthDate.message}</span>} */}
          {isCalendarOpen && (
            <div
              className="fixed bottom-0 left-0 right-0 top-0"
              onClick={clickBackdrop}
            >
              <div className={'calendarContainer'}>
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
          {/* <label htmlFor="phoneNumber">Phone number</label>
          <input
            type="tel"
            id="phoneNumber"
            placeholder="Enter phone number"
            {...register('phoneNumber', {
              required: 'This field is required',
            })}
          />
          {errors.phoneNumber && <span>{errors.phoneNumber.message}</span>} */}
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
          {/* <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter email"
            {...register('email', { required: 'This field is required' })}
          />
          {errors.email && <span>{errors.email.message}</span>} */}
        </div>
        <h2>Delivery address</h2>
        <div>
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
            className="placeholder:text-placeholder' block h-[54px] w-full rounded-lg bg-secondary p-2.5 text-L text-primary outline-focus"
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
          <FormInput
            id="city"
            register={register}
            label="City"
            name="address.city"
            type="text"
            placeholder="City"
            error={errors.address?.city}
          />
          {/* <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            placeholder="City"
            {...register('address.city', {
              required: 'This field is required',
            })}
          />
          {errors.address?.city && <span>{errors.address.city.message}</span>} */}
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
          {/* <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            placeholder="Address"
            {...register('address.line', {
              required: 'This field is required',
            })}
          />
          {errors.address?.line && <span>{errors.address.line.message}</span>} */}
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
          {/* <label htmlFor="postcode">Postcode</label>
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
          )} */}
        </div>
        <div className="mt-4">
          <Button
            type="submit"
            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FormProfile
