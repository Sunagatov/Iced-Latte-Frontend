import { UseFormRegister, FieldValues, Path, FieldError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import React from 'react'

interface InputProps<T extends FieldValues> {
  id: string
  register: UseFormRegister<T>
  label?: string
  name: Path<T>
  placeholder?: string
  type?: string
  error?: FieldError
  className?: string
  labelClassName?: string
  inputClassName?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  [key: string]: unknown
}

export default function FormInput<T extends FieldValues>({
  id,
  register,
  label,
  name,
  placeholder,
  type = 'text',
  error,
  className,
  labelClassName,
  inputClassName,
  onChange,
  ...rest
}: Readonly<InputProps<T>>) {
  const registered = register(name)

  return (
    <div className={twMerge('mt-6', className)}>
      <label
        htmlFor={id}
        className={twMerge(
          'font-XS text-primary mb-3 block cursor-pointer text-sm font-medium',
          labelClassName,
        )}
      >
        {label}
      </label>
      <input
        className={twMerge(
          'bg-secondary text-L text-primary outline-focus placeholder:text-placeholder block h-[54px] w-full rounded-lg p-2.5',
          error && 'border-error border-2',
          inputClassName,
        )}
        id={id}
        type={type}
        placeholder={placeholder}
        {...registered}
        {...rest}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        onChange={(e) => {
          void (
            registered.onChange as React.ChangeEventHandler<HTMLInputElement>
          )(e)
          onChange?.(e)
        }}
      />
      {error && (
        <div id={`${id}-error`} className="text-negative mt-2 font-medium">
          {error.message}
        </div>
      )}
    </div>
  )
}
