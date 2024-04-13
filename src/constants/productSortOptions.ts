import { IOption } from '@/types/Dropdown'
import { IProductSortParams } from '@/types/ProductSortParams'

export const sortOptions: IOption<IProductSortParams>[] = [
  {
    label: 'Price: Low to High',
    value: { sortAttribute: 'price', sortDirection: 'asc' },
  },
  {
    label: 'Price: High to Low',
    value: { sortAttribute: 'price', sortDirection: 'desc' },
  },
]
