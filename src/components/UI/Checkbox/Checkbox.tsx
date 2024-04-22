'use client'
import { CheckboxPropsType } from '@/types/Checkbox'

const Checkbox = ({
  label,
  id,
  isChecked = false,
  onChange = () => {},
  labelClassName = '',
  inputClassName = '',
  ariaLabel = '',
  ...restProps
}: CheckboxPropsType) => {
  if (!id) {
    console.warn('Id is required for checkbox but not given')
  }

  return (
    <label htmlFor={id} className="inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        className={`h-6 w-6 cursor-pointer appearance-none rounded-[4px] bg-secondary bg-center bg-no-repeat checked:bg-inverted checked:bg-[url(/checkbox_icon.svg)] checked:bg-[length:16px_16px] ${inputClassName}`}
        checked={isChecked}
        aria-checked={isChecked}
        aria-label={ariaLabel}
        onChange={onChange}
        {...restProps}
      />
      {label && (
        <span
          className={`ml-[16px] text-L font-medium text-primary ${labelClassName}`}
        >
          {label}
        </span>
      )}
    </label>
  )
}

export default Checkbox
