export type PropsDropdown<T> = {
  onChange: (option: IOption<T>) => void
  options: readonly IOption<T>[]
  selectedOption: IOption<T>
  className?: string
  headerClassName?: string
  id: string
}

export interface IOption<T> {
  isDefault: boolean
  label: string
  value: T
}
