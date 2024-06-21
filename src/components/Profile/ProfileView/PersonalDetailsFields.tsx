'use client'

import ProfileEditableFieldsWrapper from '@/components/Profile/ProfileEditableFieldsWrapper/ProfileEditableFieldsWrapper'
import Input from '@/components/UI/Input/Input'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { personalDetailsSchema } from '@/validation/userAccountSchemas'
import { UserData } from '@/types/services/UserServices'

type ProfileDetailsFieldsPropsType = {
  // handleInputChange: (e: ChangeEvent<HTMLInputElement>, name: string) => void
  handleEditButtonClick: () => void
  handleSaveButtonClick: SubmitHandler<ProfileDetailsFieldsType>
  handleCancelButtonClick: () => void
  profileData: Partial<UserData>
  isEditing: boolean
  isEditingDisabled: boolean
}

type ProfileDetailsFieldsType = {
  firstName: string
  lastName: string
  birthDate?: string | null
  phoneNumber?: string | null
}

const PersonalDetailsFields = ({
  // handleInputChange = () => {},
  handleEditButtonClick = () => {},
  handleSaveButtonClick = () => {},
  handleCancelButtonClick = () => {},
  profileData,
  isEditing,
  isEditingDisabled,
}: Readonly<ProfileDetailsFieldsPropsType>) => {
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileDetailsFieldsType>({
    resolver: yupResolver(personalDetailsSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      phoneNumber: '',
    },
  })

  const cancelButtonClickHandler = () => {
    handleCancelButtonClick()
    reset(profileData)
  }

  return (
    <ProfileEditableFieldsWrapper
      title="Personal details"
      editButtonClickHandler={handleEditButtonClick}
      cancelButtonClickHandler={cancelButtonClickHandler}
      isEditing={isEditing}
      isEditingDisabled={isEditingDisabled}
      saveButtonClickHandler={handleSubmit(handleSaveButtonClick)}
    >
      <form className="flex w-full flex-col items-start justify-start gap-4">
        <Input
          id="first-name-input"
          register={register}
          name="firstName"
          label="First Name"
          type="text"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'firstName')}
          getValues={getValues}
          value={profileData['firstName']}
          setValue={setValue}
          className="w-full"
          isRequired={true}
          disabled={!isEditing}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          error={errors.firstName}
          labelClassName="opacity-100"
        />

        <Input
          id="last-name-input"
          register={register}
          name="lastName"
          label="Last Name"
          type="text"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'lastName')}
          getValues={getValues}
          value={profileData['lastName']}
          setValue={setValue}
          className="w-full"
          isRequired={true}
          disabled={!isEditing}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          error={errors.lastName}
          labelClassName="opacity-100"
        />

        <Input
          id="birth-date-input"
          register={register}
          name="birthDate"
          label="MM/DD/YY"
          type="text"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'birthDate')}
          getValues={getValues}
          value={profileData['birthDate'] || ''}
          setValue={setValue}
          className="w-full"
          disabled={!isEditing}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          error={errors.birthDate}
          labelClassName="opacity-100"
        />

        <Input
          id="phone-number-input"
          register={register}
          name="phoneNumber"
          label="Phone number"
          type="text"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'phoneNumber')}
          getValues={getValues}
          value={profileData['phoneNumber'] || ''}
          setValue={setValue}
          className="w-full"
          disabled={!isEditing}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          error={errors.phoneNumber}
          labelClassName="opacity-100"
        />
      </form>
    </ProfileEditableFieldsWrapper>
  )
}

export default PersonalDetailsFields
