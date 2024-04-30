import { HTMLInputTypeAttribute } from 'react'
import { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form'

export type InputProps<T extends FieldValues> = {
  id: string
  register: UseFormRegister<T>
  name: Path<T>
  label: string
  type: HTMLInputTypeAttribute
  placeholder: string
  error?: FieldError
  className?: string
}
