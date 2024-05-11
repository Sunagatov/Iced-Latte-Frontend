import { IOption } from '@/types/Dropdown'
import { ISortParams } from '@/types/ISortParams'

export const sortOptions: IOption<ISortParams>[] = [
  {
    label: 'Price: High to Low',
    value: { sortAttribute: 'price', sortDirection: 'desc' },
    isDefault: false,
  },
  {
    label: 'Price: Low to High',
    value: { sortAttribute: 'price', sortDirection: 'asc' },
    isDefault: false,
  },
  {
    label: 'High rating first',
    value: { sortAttribute: 'averageRating', sortDirection: 'desc' },
    isDefault: true,
  },
  {
    label: 'Low rating first',
    value: { sortAttribute: 'averageRating', sortDirection: 'asc' },
    isDefault: false,
  },
]
