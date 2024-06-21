'use client'

import ProfileEditableFieldsWrapper from '@/components/Profile/ProfileEditableFieldsWrapper/ProfileEditableFieldsWrapper'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSecuritySchema } from '@/validation/userAccountSchemas'
import { UserData } from '@/types/services/UserServices'
import Input from '@/components/UI/Input/Input'

type LoginSecurityFieldsType = {
  email: string
  password?: string
}

type LoginSecurityFieldsPropsType = {
  // handleInputChange: (e: ChangeEvent<HTMLInputElement>, name: string) => void
  handleEditButtonClick: () => void
  handleSaveButtonClick: SubmitHandler<LoginSecurityFieldsType>
  handleCancelButtonClick: () => void
  profileData: Partial<UserData>
  isEditing: boolean
  isEditingDisabled: boolean
}

const LoginSecurityFields = ({
  // handleInputChange = () => {},
  handleEditButtonClick = () => {},
  handleSaveButtonClick = () => {},
  handleCancelButtonClick = () => {},
  profileData,
  isEditing,
  isEditingDisabled,
}: Readonly<LoginSecurityFieldsPropsType>) => {
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginSecurityFieldsType>({
    resolver: yupResolver(loginSecuritySchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const cancelButtonClickHandler = () => {
    handleCancelButtonClick()
    reset(profileData)
  }

  return (
    <ProfileEditableFieldsWrapper
      title="Login&Security"
      editButtonClickHandler={handleEditButtonClick}
      cancelButtonClickHandler={cancelButtonClickHandler}
      isEditing={isEditing}
      isEditingDisabled={isEditingDisabled}
      saveButtonClickHandler={handleSubmit(handleSaveButtonClick)}
    >
      <form className="flex w-full flex-col items-start justify-start gap-4">
        <Input
          id="email-input"
          register={register}
          name="email"
          label="Email"
          type="text"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'firstName')}
          getValues={getValues}
          value={profileData['email']}
          setValue={setValue}
          className="w-full"
          isRequired={true}
          disabled={!isEditing}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          error={errors.email}
          labelClassName="opacity-100"
        />
        <Input
          id="password-input"
          register={register}
          name="password"
          label="Password"
          type="password"
          // onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'firstName')}
          getValues={getValues}
          value={'Stub Password'}
          setValue={setValue}
          className="w-full"
          disabled={true}
          inputClassName={`${!isEditing && 'bg-input-profile disabled:opacity-100'}`}
          labelClassName="opacity-100"
        />
      </form>
    </ProfileEditableFieldsWrapper>
  )
}

export default LoginSecurityFields
