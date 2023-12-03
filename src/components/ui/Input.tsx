import classNames from 'classnames';
import { HTMLAttributes, HTMLInputTypeAttribute, InputHTMLAttributes } from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form'

type InputProps = {
  label?: string,
  placeholder?: string;
  name: string,
  classNameInput?: string,
  classNameLabel?: string,
  register?: UseFormRegister<FieldValues>,
  error?: string,
  type?: "password" | "text"
}

export default function Input({
  label,
  classNameInput,
  name,
  classNameLabel,
  error,
  type = "text",
  register,
  ...rest }: InputProps) {

  const classNameInputMerge = classNames(
    "h-[54px] bg-secondary border border-gray-300 text-gray-900 text-L rounded-lg focus:ring-brand-solid-hover block w-full p-2.5 ",
    classNameInput,
    {
      "border-error" : !!error
    })

  const classNameLabelMerge = classNames(
    "block mb-2 text-sm font-XS text-gray-900 ",
    classNameLabel,
    {
      "text-negative": !!error
    })
  return (
    <div className='mt-6'>
      {label &&
        <label
          htmlFor={name}
          className={classNameLabelMerge}
        >
          {label}
        </label>
      }
      <input
        name={name}
        type={type}
        id={name}
        className={classNameInputMerge}
        {...rest}
        {...register}
      />
      {!!error && <div className='text-negative'>{error}</div>}
    </div>
  )
}