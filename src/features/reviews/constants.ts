import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'

export const reviewsSortOptions: IOption<ISortParams>[] = [
  { label: 'Most recent', value: { sortAttribute: 'createdAt', sortDirection: 'desc' }, isDefault: true },
  { label: 'Oldest first', value: { sortAttribute: 'createdAt', sortDirection: 'asc' }, isDefault: false },
  { label: 'High rating first', value: { sortAttribute: 'productRating', sortDirection: 'desc' }, isDefault: false },
  { label: 'Low rating first', value: { sortAttribute: 'productRating', sortDirection: 'asc' }, isDefault: false },
]
