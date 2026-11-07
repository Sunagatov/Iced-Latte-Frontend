'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Resolver } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import {
  editUserProfile,
  type UpdateUserProfileInput,
} from '@/features/user/api'
import countries from '@/shared/config/countries'
import type { UserData } from '@/features/user/types'
import { validationSchema } from '@/features/user/validation'
import { useFormErrorHandler } from '@/shared/utils/apiError'
import Button from '@/shared/ui/Button'
import { captureAccountScope } from '@/features/auth/accountScope'
import FormInput from '@/shared/ui/FormInput'
import { isSyncRejected } from '@/features/session/syncCommands'
import { keepProfileEdits } from '@/features/user/profileConflict'

interface FormProfileProps {
  initialUserData: UserData | null
  onSuccessEdit: () => void
  updateUserData: (data: UserData) => void
}

type FormValues = yup.InferType<typeof validationSchema>

const nameFields = [
  {
    id: 'firstName',
    label: 'First name',
    name: 'firstName',
    placeholder: 'Enter first name',
  },
  {
    id: 'lastName',
    label: 'Last name',
    name: 'lastName',
    placeholder: 'Enter last name',
  },
] as const

const addressFields = [
  { id: 'city', label: 'City', name: 'address.city', placeholder: 'City' },
  {
    id: 'address',
    label: 'Address',
    name: 'address.line',
    placeholder: 'Address',
  },
  {
    id: 'postcode',
    label: 'Postcode',
    name: 'address.postcode',
    placeholder: 'Zip code',
  },
] as const

const saveButtonClass =
  'focus:outline-focus mt-6 rounded-[47px] border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none'

const FormProfile = ({
  onSuccessEdit,
  updateUserData,
  initialUserData,
}: Readonly<FormProfileProps>) => {
  const [base, setBase] = useState(initialUserData)
  const [conflict, setConflict] = useState<{
    latest: UserData
    draft: UserData
  } | null>(null)
  const conflictRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!conflict) return
    conflictRef.current?.focus({ preventScroll: true })
    conflictRef.current?.scrollIntoView({ block: 'center' })
  }, [conflict])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormValues>,
    defaultValues: initialUserData ?? undefined,
    mode: 'onChange',
  })
  const { errorMessage, handleError, clearError } =
    useFormErrorHandler<FormValues>(setError)

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    clearError()
    const account = captureAccountScope()

    try {
      const saved = await editUserProfile(
        data as UpdateUserProfileInput,
        base?.profileRevision,
      )

      if (!account.isCurrent()) return
      updateUserData(saved)
      onSuccessEdit()
    } catch (error) {
      if (!account.isCurrent()) return
      if (isSyncRejected(error) && error.result.code === 'REVISION_CONFLICT') {
        setConflict({
          latest: error.result.snapshot.data as unknown as UserData,
          draft: data as UserData,
        })
      } else handleError(error)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {conflict && (
          <section
            ref={conflictRef}
            tabIndex={-1}
            role="alert"
            className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm"
          >
            <p className="font-semibold">
              Your profile changed on another device.
            </p>
            <p className="mt-1">
              Your unsaved edits are kept here. Load the latest profile, or keep
              your edited fields and review them before saving.
            </p>
            <p className="mt-2">
              Latest name: {conflict.latest.firstName}{' '}
              {conflict.latest.lastName}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className="underline"
                onClick={() => {
                  reset(conflict.latest)
                  setBase(conflict.latest)
                  setConflict(null)
                }}
              >
                Load latest profile
              </button>
              <button
                type="button"
                className="underline"
                onClick={() => {
                  reset(
                    keepProfileEdits(base!, conflict.draft, conflict.latest),
                  )
                  setBase(conflict.latest)
                  setConflict(null)
                }}
              >
                Keep my edits and review
              </button>
            </div>
          </section>
        )}
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
            disabled={isSubmitting || Boolean(conflict)}
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
