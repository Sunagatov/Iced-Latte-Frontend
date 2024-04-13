export type PropsDropdown = {
  onChange: (option: IOption) => void
  options: IOption[]
  selectedOption: IOption
  className?: string
}

export interface IOption {
  label: string
  sortAttribute: string
  sortDirection: 'asc' | 'desc'
}
