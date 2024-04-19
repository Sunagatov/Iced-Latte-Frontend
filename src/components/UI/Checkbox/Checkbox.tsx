'use client'
import { PropsCheckboxType } from '@/types/Checkbox'

export default function Checkbox({
  label,
  id,
  isChecked = false,
  onChange = () => {},
  labelClassName = '',
  inputClassName = '',
  ...restProps
}: PropsCheckboxType) {

  return (
    <>
      <label htmlFor={id} className="inline-flex items-center">
        <input
          type="checkbox"
          id={id}
          className={`w-6 h-6 appearance-none bg-secondary rounded-[4px] cursor-pointer checked:bg-inverted bg-no-repeat bg-center checked:bg-[url(/checkbox_icon.svg)] checked:bg-[length:16px_16px] ${inputClassName}`}
          checked={isChecked}
          aria-checked={isChecked}
          onChange={onChange}
          {...restProps}
        />
        {label && <span className={`ml-[16px] text-primary text-L font-medium ${labelClassName}`}>{label}</span>}
      </label>
    </>

  )
};