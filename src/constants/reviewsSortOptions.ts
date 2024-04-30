import { IOption } from '@/types/Dropdown'
import { ISortParams } from '@/types/ISortParams'

export const reviewsSortOptions: IOption<ISortParams>[] = [
  {
    label: 'Most recent',
    value: { sortAttribute: 'createdAt', sortDirection: 'desc' },
    isDefault: true,
  },
  {
    label: 'Most oldest',
    value: { sortAttribute: 'createdAt', sortDirection: 'asc' },
    isDefault: false,
  },
  {
    label: 'High rating first',
    value: { sortAttribute: 'productRating', sortDirection: 'desc' },
    isDefault: false,
  },
  {
    label: 'Low rating first',
    value: { sortAttribute: 'productRating', sortDirection: 'asc' },
    isDefault: false,
  },
  // {
  //   label: 'Helpfull',
  //   value: { sortAttribute: 'likesCount', sortDirection: 'desc' },
  //   isDefault: false,
  // },
]
