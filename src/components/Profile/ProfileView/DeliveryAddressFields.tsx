'use client'

import ProfileEditableFieldsWrapper from '@/components/Profile/ProfileEditableFieldsWrapper/ProfileEditableFieldsWrapper'
import Input from '@/components/UI/Input/Input'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { deliveryAddressSchema } from '@/validation/userAccountSchemas'
import { UserData } from '@/types/services/UserServices'
import countries from '@/constants/countryData'
import Image from 'next/image'

type DeliveryAddressFieldsPropsType = {
  // handleInputChange: (e: ChangeEvent<HTMLInputElement>, name: string) => void
  handleEditButtonClick: () => void
  handleSaveButtonClick: SubmitHandler<DeliveryAddressFieldsType>
  handleCancelButtonClick: () => void
  profileData: Partial<UserData>
  isEditing: boolean
  isEditingDisabled: boolean
}

interface IAddress {
  country?: string | null
  city?: string | null
  line?: string | null
  postcode?: string | null
}

export type DeliveryAddressFieldsType = {
  address: IAddress
}

const DeliveryAddressFields = ({
  // handleInputChange = () => {},
  handleEditButtonClick = () => {},
  handleSaveButtonClick = () => {},
  handleCancelButtonClick = () => {},
  profileData,
  isEditing,
  isEditingDisabled,
}: Readonly<DeliveryAddressFieldsPropsType>) => {
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeliveryAddressFieldsType>({
    resolver: yupResolver(deliveryAddressSchema),
    defaultValues: {
      address: {
        country: '',
        city: '',
        line: '',
        postcode: '',
      },
    },
  })

  const cancelButtonClickHandler = () => {
    handleCancelButtonClick()
    reset(profileData)
  }

  return (
    <ProfileEditableFieldsWrapper
      title="Delivery address"
      editButtonClickHandler={handleEditButtonClick}
      cancelButtonClickHandler={cancelButtonClickHandler}
      isEditing={isEditing}
      isEditingDisabled={isEditingDisabled}
      saveButtonClickHandler={handleSubmit(handleSaveButtonClick)}
    >
      <form className="flex w-full flex-col items-start justify-start gap-4">
        <div className="relative">
          <label
            className="font-XS mb-3 block text-sm font-medium text-primary"
            htmlFor="country"
          >
            Country
          </label>
          <select
            id="country-select"
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

        <Input
          id="city-input"
          register={register}
          name="address.city"
          label="City"
          type="text"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'lastName')}
          getValues={getValues}
          value={profileData?.address?.city}
          setValue={setValue}
          className="w-full"
          disabled={!isEditing}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          error={errors.address?.city}
          labelClassName="opacity-100"
        />

        <Input
          id="address-line-input"
          register={register}
          name="address.line"
          label="Address"
          type="text"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'birthDate')}
          getValues={getValues}
          value={profileData.address?.line}
          setValue={setValue}
          className="w-full"
          disabled={!isEditing}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          error={errors.address?.line}
          labelClassName="opacity-100"
        />

        <Input
          id="postcode-input"
          register={register}
          name="address.postcode"
          label="Postal code"
          type="text"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'phoneNumber')}
          getValues={getValues}
          value={profileData.address?.postcode}
          setValue={setValue}
          className="w-full"
          disabled={!isEditing}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          error={errors.address?.postcode}
          labelClassName="opacity-100"
        />
      </form>
    </ProfileEditableFieldsWrapper>
  )
}

export default DeliveryAddressFields
