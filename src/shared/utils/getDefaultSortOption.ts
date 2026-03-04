import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'

export function getDefaultSortOption(options: IOption<ISortParams>[]) {
  return options.find((option) => option.isDefault === true)!
}
