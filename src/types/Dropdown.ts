export type PropsDropdown<T> = {
  onChange: (option: IOption<T>) => void
  options: IOption<T>[]
  selectedOption: IOption<T>
  className?: string
}

export interface IOption<T> {
  label: string
  value: T
}
