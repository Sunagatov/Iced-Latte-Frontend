import { InputProps } from '@/types/FormInput'
import { twMerge } from 'tailwind-merge'
import { FieldValues } from 'react-hook-form'

export default function FormInput<T extends FieldValues>({
  id,
  register,
  label,
  name,
  placeholder,
  type = 'text',
  error,
  className,
}: Readonly<InputProps<T>>) {
  return (
    <div className={twMerge('mt-6', className)}>
      <label
        htmlFor={id}
        className={'font-XS mb-3 block text-sm font-medium text-primary cursor-pointer'}
      >
        {label}
      </label>
      <input
        className={twMerge(
          'block h-[54px] w-full rounded-lg bg-secondary p-2.5 text-L text-primary outline-focus placeholder:text-placeholder',
          error && 'border-2 border-error',
        )}
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(name)}
      />
      {error && (
        <div className="mt-2 font-medium text-negative">{error.message}</div>
      )}
    </div>
  )
}
