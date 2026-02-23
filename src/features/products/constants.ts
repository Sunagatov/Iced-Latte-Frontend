import { IOption } from '@/shared/types/Dropdown'
import { ISortParams } from '@/shared/types/ISortParams'

export const productRating: string = '4,8'
export const productSize: number = 500

export const sortOptions: IOption<ISortParams>[] = [
  { label: 'Price: High to Low', value: { sortAttribute: 'price', sortDirection: 'desc' }, isDefault: false },
  { label: 'Price: Low to High', value: { sortAttribute: 'price', sortDirection: 'asc' }, isDefault: false },
  { label: 'High rating first', value: { sortAttribute: 'averageRating', sortDirection: 'desc' }, isDefault: true },
  { label: 'Low rating first', value: { sortAttribute: 'averageRating', sortDirection: 'asc' }, isDefault: false },
]
