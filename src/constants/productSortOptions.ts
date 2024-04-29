export const sortOptions = [
  {
    label: 'Price: High to Low',
    value: { sortAttribute: 'price', sortDirection: 'desc' },
  },
  {
    label: 'Price: Low to High',
    value: { sortAttribute: 'price', sortDirection: 'asc' },
  },
  {
    label: 'High rating first',
    value: { sortAttribute: 'averageRating', sortDirection: 'desc' },
  },
  {
    label: 'Low rating first',
    value: { sortAttribute: 'averageRating', sortDirection: 'asc' },
  },
] as const
