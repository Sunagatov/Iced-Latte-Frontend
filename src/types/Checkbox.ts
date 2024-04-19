export type PropsCheckboxType = {
  label?: string
  id?: string
  name?: string,
  isChecked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  labelClassName?: string
  inputClassName?: string
}
