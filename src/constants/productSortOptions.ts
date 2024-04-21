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
  {
    label: 'Quantity: High to Low',
    value: { sortAttribute: 'quantity', sortDirection: 'desc' },
  },
  {
    label: 'Quantity: Low to High',
    value: { sortAttribute: 'quantity', sortDirection: 'asc' },
  },
  {
    label: 'Reviews: High to Low',
    value: { sortAttribute: 'reviewsCount', sortDirection: 'desc' },
  },
  {
    label: 'Reviews: Low to High',
    value: { sortAttribute: 'reviewsCount', sortDirection: 'asc' },
  },
  {
    label: 'Best Sellers',
    value: { sortAttribute: '', sortDirection: 'asc' }, //not implemented on the backend yet
  },
] as const
