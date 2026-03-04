'use client'
interface CheckboxPropsType { label?: string; id?: string; isChecked?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; labelClassName?: string; inputClassName?: string; ariaLabel?: string; [key: string]: unknown }

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
        className={`h-6 w-6 cursor-pointer appearance-none rounded-[4px] border-2 border-[#D1D5DB] bg-white bg-center bg-no-repeat checked:border-brand-solid checked:bg-brand-solid checked:bg-[url(/checkbox_icon.svg)] checked:bg-[length:14px_14px] ${inputClassName}`}
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
