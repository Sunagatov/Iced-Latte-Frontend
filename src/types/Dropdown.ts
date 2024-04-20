export type PropsDropdown<T> = {
  onChange: (option: IOption<T>) => void
  options: readonly IOption<T>[] | IOption<T>[]
  selectedOption: IOption<T>
  className?: string
}

export interface IOption<T> {
  label: string
  value: T
}
