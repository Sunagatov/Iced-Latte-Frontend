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
  {
    label: 'High rating first',
    value: { sortAttribute: '', sortDirection: 'desc' }, //not implemented on the backend yet
  },
  {
    label: 'Low rating first',
    value: { sortAttribute: '', sortDirection: 'asc' }, //not implemented on the backend yet
  },
  {
    label: 'Best Sellers',
    value: { sortAttribute: '', sortDirection: 'asc' }, //not implemented on the backend yet
  },
]

export const defaultSortOption = sortOptions.filter(
  (sortOption) => sortOption.label === 'Best Sellers',
)[0]
