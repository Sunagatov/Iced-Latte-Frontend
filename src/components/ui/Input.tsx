import { HTMLAttributes, useId } from 'react'

type InputProps = HTMLAttributes<HTMLInputElement> & {
  label?: string,
  classNameInput?: string,
  classNameLabel?: string
}

export default function Input({
  label,
  classNameInput,
  classNameLabel,
  ...rest }: InputProps) {
  const id = useId()

  const classNameInputMerge = "h-[54px] bg-secondary border border-gray-300 text-gray-900 text-L rounded-lg focus:ring-brand-solid-hover block w-full p-2.5 "
    + (classNameInput ?? '')

  const classNameLabelMerge = "block mb-2 text-sm font-XS text-gray-900 "
    + (classNameLabel ?? '')
  return (
    <div className='mt-[24px]'>
      {label &&
        <label
          htmlFor={id}
          className={classNameLabelMerge}
        >
          {label}
        </label>
      }
      <input
        type="text"
        id={id}
        className={classNameInputMerge}
        {...rest}
      />
    </div>
  )
}