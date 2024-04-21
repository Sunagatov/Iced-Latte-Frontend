export type CheckboxPropsType = {
  id: string
  label?: string
  name?: string,
  isChecked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  labelClassName?: string
  inputClassName?: string
  ariaLabel?: string
}
