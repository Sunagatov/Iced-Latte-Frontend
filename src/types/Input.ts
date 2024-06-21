import React, { HTMLInputTypeAttribute } from 'react'
import {
  FieldError,
  FieldValues,
  Path,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'

export type InputProps<T extends FieldValues> = {
  id: string
  register: UseFormRegister<T>
  getValues: UseFormGetValues<T>
  setValue: UseFormSetValue<T>
  name: Path<T>
  label: string
  type: HTMLInputTypeAttribute
  error?: FieldError
  className?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  labelClassName?: string
  inputClassName?: string
  value?: string | null
  disabled?: boolean
  isRequired?: boolean
}
