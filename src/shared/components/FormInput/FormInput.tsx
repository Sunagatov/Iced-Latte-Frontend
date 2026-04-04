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
          'font-XS mb-3 block cursor-pointer text-sm font-medium text-primary',
          labelClassName,
        )}
      >
        {label}
      </label>
      <input
        className={twMerge(
          'block h-[54px] w-full rounded-lg bg-secondary p-2.5 text-L text-primary outline-focus placeholder:text-placeholder',
          error && 'border-2 border-error',
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
          void (registered.onChange as React.ChangeEventHandler<HTMLInputElement>)(e)
          onChange?.(e)
        }}
      />
      {error && (
        <div id={`${id}-error`} className="mt-2 font-medium text-negative">{error.message}</div>
      )}
    </div>
  )
}
