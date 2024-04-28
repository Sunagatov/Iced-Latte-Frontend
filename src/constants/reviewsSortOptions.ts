import { IOption } from '@/types/Dropdown'
import { IReviewsSortParams } from '@/types/IReviewsSortParams'

export const reviewsSortOptions: IOption<IReviewsSortParams>[] = [
  {
    label: 'Most recent',
    value: { sortAttribute: 'createdAt', sortDirection: 'desc' },
  },
  {
    label: 'Most oldest',
    value: { sortAttribute: 'createdAt', sortDirection: 'asc' },
  },
  {
    label: 'High rating first',
    value: { sortAttribute: 'productRating', sortDirection: 'desc' },
  },
  {
    label: 'Low rating first',
    value: { sortAttribute: 'productRating', sortDirection: 'asc' },
  },
  // {
  //   label: 'Helpfull',
  //   value: { sortAttribute: 'likesCount', sortDirection: 'desc' },
  // },
]
