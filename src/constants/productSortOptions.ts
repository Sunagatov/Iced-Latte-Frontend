import { IOption } from '@/types/Dropdown'

export const sortOptions: IOption[] = [
  {
    label: 'Price: Low to High',
    sortAttribute: 'price',
    sortDirection: 'asc',
  },
  {
    label: 'Price: High to Low',
    sortAttribute: 'price',
    sortDirection: 'desc',
  },
]
