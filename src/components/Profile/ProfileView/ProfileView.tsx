'use client'

import { useState } from 'react'
import { pick } from 'lodash'
import PersonalDetailsFields from '@/components/Profile/ProfileView/PersonalDetailsFields'
import { useAuthStore } from '@/store/authStore'
import { SubmitHandler } from 'react-hook-form'
import { UserData } from '@/types/services/UserServices'
import { editUserProfile } from '@/services/userService'
import { useErrorHandler } from '@/services/apiError/apiError'
import DeliveryAddressFields from '@/components/Profile/ProfileView/DeliveryAddressFields'
import LoginSecurityFields from '@/components/Profile/ProfileView/LoginSecurityFields'

export type EditingFieldsSetType =
  | 'personalDetails'
  | 'deliveryAddress'
  | 'loginSecurity'

const ProfileFieldSetMap = {
  personalDetails: ['firstName', 'lastName', 'birthDate', 'phoneNumber'],
  deliveryAddress: ['address'],
  loginSecurity: ['email'],
}

const getUserDataSliceForFieldSetType = (
  fieldSetType: EditingFieldsSetType,
  userData: Partial<UserData> | null,
) => {
  return pick(userData, ProfileFieldSetMap[fieldSetType])
}

const ProfileView = () => {
  const { setUserData, userData = {} } = useAuthStore()
  const {
    // errorMessage,
    handleError,
  } = useErrorHandler()

  const [currentEditingFieldsSet, setCurrentEditingFieldsSet] = useState<
    EditingFieldsSetType | ''
  >('')

  const onSubmit: SubmitHandler<Partial<UserData>> = async (data) => {
    try {
      await editUserProfile(data)
      setUserData(data)
      setCurrentEditingFieldsSet('')
    } catch (error) {
      handleError(error)
    }
  }
  // const handleInputChange = (event: ChangeEvent<HTMLInputElement>, name: string) => {
  //
  // }

  const editButtonClickHandler = (fieldSetType: EditingFieldsSetType) => {
    setCurrentEditingFieldsSet(fieldSetType)
  }

  const cancelButtonClickHandler = () => {
    setCurrentEditingFieldsSet('')
  }

  return (
    <div className="over-y-auto w-full bg-profile px-[75px] pb-16 pt-[75px]">
      <div className="w-full max-w-[649px] rounded-2xl bg-primary px-8 py-8">
        <h2 className="mb-[50px] w-full text-3XL font-medium text-primary">
          Account
        </h2>

        <PersonalDetailsFields
          profileData={getUserDataSliceForFieldSetType(
            'personalDetails',
            userData,
          )}
          // handleInputChange={handleInputChange}
          handleEditButtonClick={() =>
            editButtonClickHandler('personalDetails')
          }
          handleCancelButtonClick={cancelButtonClickHandler}
          handleSaveButtonClick={onSubmit}
          isEditing={currentEditingFieldsSet === 'personalDetails'}
          isEditingDisabled={
            !['', 'personalDetails'].includes(currentEditingFieldsSet)
          }
        />

        <DeliveryAddressFields
          profileData={getUserDataSliceForFieldSetType(
            'deliveryAddress',
            userData,
          )}
          // handleInputChange={handleInputChange}
          handleEditButtonClick={() =>
            editButtonClickHandler('deliveryAddress')
          }
          handleCancelButtonClick={cancelButtonClickHandler}
          handleSaveButtonClick={onSubmit}
          isEditing={currentEditingFieldsSet === 'deliveryAddress'}
          isEditingDisabled={
            !['', 'deliveryAddress'].includes(currentEditingFieldsSet)
          }
        />

        <LoginSecurityFields
          profileData={getUserDataSliceForFieldSetType(
            'loginSecurity',
            userData,
          )}
          // handleInputChange={handleInputChange}
          handleEditButtonClick={() => editButtonClickHandler('loginSecurity')}
          handleCancelButtonClick={cancelButtonClickHandler}
          handleSaveButtonClick={onSubmit}
          isEditing={currentEditingFieldsSet === 'loginSecurity'}
          isEditingDisabled={
            !['', 'loginSecurity'].includes(currentEditingFieldsSet)
          }
        />
      </div>
    </div>
  )
}

export default ProfileView
