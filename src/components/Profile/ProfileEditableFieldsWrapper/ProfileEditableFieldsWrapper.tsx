'use client'

import React from 'react'
import Button from '@/components/UI/Buttons/Button/Button'
import { twMerge } from 'tailwind-merge'

type ProfileEditableFieldsWrapperPropsType = {
  title: string
  editButtonClickHandler: () => void
  saveButtonClickHandler: () => void
  cancelButtonClickHandler: () => void
  isEditing: boolean
  isEditingDisabled: boolean
  children: React.ReactNode
}

const ProfileEditableFieldsWrapper = ({
  title,
  saveButtonClickHandler = () => {},
  editButtonClickHandler = () => {},
  cancelButtonClickHandler = () => {},
  isEditing = false,
  isEditingDisabled = false,
  children,
}: Readonly<ProfileEditableFieldsWrapperPropsType>) => {
  return (
    <div
      className={twMerge(
        'mb-11 flex w-full flex-col items-start justify-start gap-5 border-b-[1px] border-b-primary pb-11',
        isEditing && 'rounded-xl border-2 border-focus px-6 pt-6',
      )}
    >
      <h4 className="flex w-full flex-row items-center justify-between gap-5 text-XL font-medium text-primary">
        <span>{title}</span>
        {!isEditing && (
          <Button
            onClick={editButtonClickHandler}
            id={`edit-${title}-button`}
            className={twMerge(
              'h-12 border-2 border-white-button bg-primary text-primary',
            )}
            disabled={isEditingDisabled}
          >
            Edit
          </Button>
        )}
      </h4>

      <div className="w-full">{children}</div>

      {isEditing && (
        <div className="mt-3 flex w-full flex-row justify-end gap-4">
          <Button
            id={`cancel-${title}-button`}
            className="bg-primary text-primary"
            onClick={cancelButtonClickHandler}
          >
            Cancel
          </Button>

          <Button id={`save-${title}-button`} onClick={saveButtonClickHandler}>
            Save changes
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProfileEditableFieldsWrapper
