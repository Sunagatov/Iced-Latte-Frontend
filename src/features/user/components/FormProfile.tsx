'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import type { Resolver } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { editUserProfile } from '@/features/user/api'
import countries from '@/features/user/constants'
import type { UserData } from '@/features/user/types'
import { validationSchema } from '@/features/user/validation'
import { useFormErrorHandler } from '@/shared/utils/apiError'
import Button from '@/shared/ui/Button'
import FormInput from '@/shared/ui/FormInput'

interface FormProfileProps {
  initialUserData: UserData | null
  onSuccessEdit: () => void
  updateUserData: (data: UserData) => void
}

type FormValues = yup.InferType<typeof validationSchema>

const nameFields = [
  { id: 'firstName', label: 'First name', name: 'firstName', placeholder: 'Enter first name' },
  { id: 'lastName', label: 'Last name', name: 'lastName', placeholder: 'Enter last name' },
] as const

const addressFields = [
  { id: 'city', label: 'City', name: 'address.city', placeholder: 'City' },
  { id: 'address', label: 'Address', name: 'address.line', placeholder: 'Address' },
  { id: 'postcode', label: 'Postcode', name: 'address.postcode', placeholder: 'Zip code' },
] as const

const saveButtonClass =
  'focus:outline-focus mt-6 rounded-[47px] border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none'

const FormProfile = ({
  onSuccessEdit,
  updateUserData,
  initialUserData,
}: Readonly<FormProfileProps>) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormValues>,
    defaultValues: initialUserData ?? undefined,
    mode: 'onChange',
  })
  const { errorMessage, handleError } = useFormErrorHandler<FormValues>(setError)

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
          {nameFields.map((field) => (
            <div key={field.id} className="flex-grow md:w-[392px]">
              <FormInput
                id={field.id}
                register={register}
                label={field.label}
                name={field.name}
                type="text"
                placeholder={field.placeholder}
                error={errors[field.name]}
                className="w-full"
              />
            </div>
          ))}
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
        <CountrySelect
          error={errors.address?.country?.message}
          register={register}
        />
        {addressFields.map((field) => (
          <div key={field.id}>
            <FormInput
              id={field.id}
              register={register}
              label={field.label}
              name={field.name}
              type="text"
              placeholder={field.placeholder}
              error={
                field.name === 'address.city'
                  ? errors.address?.city
                  : field.name === 'address.line'
                    ? errors.address?.line
                    : errors.address?.postcode
              }
            />
          </div>
        ))}
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
            } ${saveButtonClass}`}
          >
            <span>{isSubmitting ? 'Saving…' : 'Save Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

function CountrySelect({
  error,
  register,
}: Readonly<{
  error?: string
  register: ReturnType<typeof useForm<FormValues>>['register']
}>) {
  return (
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
        className="bg-secondary text-primary outline-focus block h-[54px] w-full cursor-pointer appearance-none rounded-lg p-2.5"
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
        style={{ width: 'auto', height: 'auto' }}
      />
      {error && <span className="text-negative text-sm">{error}</span>}
    </div>
  )
}

export default FormProfile
