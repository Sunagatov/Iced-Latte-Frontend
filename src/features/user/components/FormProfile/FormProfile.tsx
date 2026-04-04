'use client'
import { editUserProfile } from '@/features/user/api'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
interface FormProfileProps { onSuccessEdit: () => void; updateUserData: (data: UserData) => void; initialUserData: UserData | null }
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
        <div>
          <label className="font-XS mb-3 block text-sm font-medium text-primary" htmlFor="birthDate">
            Date of birth
          </label>
          <input
            id="birthDate"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('birthDate')}
            className="block h-[54px] w-full rounded-lg bg-secondary p-2.5 text-primary outline-focus"
          />
          {errors.birthDate && <span className="text-sm text-negative">{errors.birthDate.message}</span>}
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
            {...register('address.country')}
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
            <div className="mt-4 text-negative">{errorMessage}</div>
          )}
          <Button
            id="save-btn"
            type="submit"
            disabled={isSubmitting}
            className={`${
              Object.keys(errors).length > 0 || isSubmitting
                ? 'cursor-not-allowed bg-brand-solid opacity-20'
                : 'bg-brand-solid hover:bg-indigo-700'
            } mt-[24px] rounded-[47px] border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:outline-focus focus:ring-2 focus:ring-offset-2`}
          >
            <span>{isSubmitting ? 'Saving…' : 'Save Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FormProfile
