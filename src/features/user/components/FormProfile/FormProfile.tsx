'use client'
import { editUserProfile } from '@/features/user/api'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
interface FormProfileProps {
  onSuccessEdit: () => void
  updateUserData: (data: UserData) => void
  initialUserData: UserData | null
}
import { yupResolver } from '@hookform/resolvers/yup'
import { UserData } from '@/features/user/types'
import { validationSchema } from '@/features/user/validation'
import * as yup from 'yup'

type FormValues = yup.InferType<typeof validationSchema>
import { useErrorHandler } from '@/shared/utils/apiError'
import Image from 'next/image'
import Button from '@/shared/components/Buttons/Button/Button'
import FormInput from '@/shared/components/FormInput/FormInput'
import countries from '@/features/user/constants'

const FormProfile = ({
  onSuccessEdit,
  updateUserData,
  initialUserData,
}: Readonly<FormProfileProps>) => {
  const { errorMessage, handleError } = useErrorHandler()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormValues>,
    defaultValues: initialUserData ?? undefined,
    mode: 'onChange',
  })

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const saved = await editUserProfile(data as UserData)

      updateUserData(saved)
      onSuccessEdit()
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-primary text-2xl font-medium">Personal details</h2>
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
        <div>
          <label
            className="font-XS text-primary mb-3 block text-sm font-medium"
            htmlFor="birthDate"
          >
            Date of birth
          </label>
          <input
            id="birthDate"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('birthDate')}
            className="bg-secondary text-primary outline-focus block h-[54px] w-full rounded-lg p-2.5"
          />
          {errors.birthDate && (
            <span className="text-negative text-sm">
              {errors.birthDate.message}
            </span>
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
        <h2 className="text-primary mt-[32px] mb-[19px] text-2xl font-medium">
          Delivery address
        </h2>
        <div className="relative">
          <label
            className="font-XS text-primary mb-3 block text-sm font-medium"
            htmlFor="country"
          >
            Country
          </label>
          <select
            id="country"
            {...register('address.country')}
            className="placeholder:text-placeholder' bg-secondary text-L text-primary outline-focus block h-[54px] w-full cursor-pointer appearance-none rounded-lg p-2.5"
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
          <Image
            src="/open_select.svg"
            alt="open select icon"
            className="pointer-events-none absolute top-[60%] right-2 -translate-y-[-60%] transform"
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
            <div className="text-negative mt-4">{errorMessage}</div>
          )}
          <Button
            id="save-btn"
            type="submit"
            disabled={isSubmitting}
            className={`${
              Object.keys(errors).length > 0 || isSubmitting
                ? 'bg-brand-solid cursor-not-allowed opacity-20'
                : 'bg-brand-solid hover:bg-indigo-700'
            } focus:outline-focus mt-[24px] rounded-[47px] border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none`}
          >
            <span>{isSubmitting ? 'Saving…' : 'Save Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FormProfile
