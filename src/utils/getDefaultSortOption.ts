import { IOption } from '@/types/Dropdown'
import { ISortParams } from '@/types/ISortParams'

export function getDefaultSortOption(options: IOption<ISortParams>[]) {
  return options.find((option) => option.isDefault === true)!
}
