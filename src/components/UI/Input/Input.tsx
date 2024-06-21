'use client'
import { InputProps } from '@/types/Input'
import { twMerge } from 'tailwind-merge'
import { FieldValues, PathValue } from 'react-hook-form'
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import CrossIcon from '@/components/UI/Input/CrossIcon'
import AttentionIcon from '@/components/UI/Input/AttentionIcon'

export default function Input<T extends FieldValues>({
  id,
  register,
  getValues,
  setValue,
  label,
  name,
  value,
  type = 'text',
  disabled,
  error,
  className,
  labelClassName = '',
  inputClassName = '',
  isRequired,
  ...rest
}: Readonly<InputProps<T>>) {
  const [isInputFocused, setIsInputFocused] = useState(false)

  const { onBlur, ref, ...restInputProps } = register(name)

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (value !== getValues(name)) {
      setValue(name, value as PathValue<T, typeof name>)
    }
  }, [value, setValue, getValues, name])

  const onInputClearHandler = () => {
    setValue(name, '' as PathValue<T, typeof name>)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current)
      } else {
        ;(ref as MutableRefObject<HTMLInputElement | null>).current =
          inputRef.current
      }
    }
  }, [ref])

  const borderColor = error
    ? 'border-error'
    : isInputFocused
      ? 'border-focus'
      : 'border-input-default'

  const inputLabelColor = error ? 'negative' : 'secondary'

  const iconType =
    getValues(name)?.length > 0 ? 'cross' : error ? 'attention' : ''

  const iconColor = error ? '#E12E3C' : isInputFocused ? '#682EFF' : '#EDEAF2'

  const backgroundColor = error ? 'bg-input-error' : 'bg-input-default'

  return (
    <>
      <div className={twMerge('relative', className)}>
        <label
          htmlFor={id}
          className={twMerge(
            'font-XS absolute left-2.5 top-1/2 block -translate-y-2/4 cursor-pointer text-sm font-medium opacity-65 duration-150',
            (getValues(name)?.length > 0 || isInputFocused) &&
              'top-2.5 translate-y-0',
            `text-${inputLabelColor}`,
            'disabled:opacity-40',
            labelClassName,
          )}
        >
          {isRequired ? '*' + label : label}
        </label>
        <input
          className={twMerge(
            `${backgroundColor}`,
            'block h-[54px] w-full rounded-lg border-2 px-2.5 pb-2.5 pt-8 text-XS text-primary focus:outline-none disabled:opacity-40',
            `${borderColor}`,
            inputClassName,
          )}
          id={id}
          type={type}
          onFocus={() => setIsInputFocused(true)}
          {...restInputProps}
          onBlur={(e) => {
            void onBlur(e)
            setIsInputFocused(false)
          }}
          ref={inputRef}
          disabled={disabled}
          {...rest}
        />
        {
          <button
            onClick={onInputClearHandler}
            className={twMerge(
              'textColor-positive absolute right-2.5 top-1/2 block -translate-y-2/4',
              'disabled:opacity-40',
            )}
            disabled={disabled}
          >
            {iconType === 'cross' && <CrossIcon color={iconColor} />}

            {iconType === 'attention' && <AttentionIcon color={iconColor} />}
          </button>
        }
      </div>

      {error && (
        <div className="mt-2 font-medium text-negative">{error.message}</div>
      )}
    </>
  )
}
